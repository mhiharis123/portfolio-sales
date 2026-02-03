import { Hono } from "hono";
import { auth } from "../lib/auth";
import { getRedisClient } from "../lib/redis";
import postgres from "postgres";

const topHoldings = new Hono();

const CACHE_KEY = "top_holdings";
const CACHE_TTL = 86400; // 24 hours in seconds

interface TopHolding {
    client_name: string;
    dr_code: string;
    client_code: string;
    total_value: string;
}

interface TopHoldingsResponse {
    snapshot_date: string;
    holdings: TopHolding[];
}

async function fetchTopHoldingsFromDB(): Promise<TopHoldingsResponse> {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error("DATABASE_URL environment variable is required");
    }

    const sql = postgres(connectionString);

    try {
        // Query to get top 10 holdings with the latest snapshot date
        const result = await sql<TopHolding[]>`
            SELECT 
                client_name, 
                dr_code, 
                client_code, 
                SUM(market_value) AS total_value
            FROM daily_portfolio_snapshots
            WHERE snapshot_date = (SELECT MAX(snapshot_date) FROM daily_portfolio_snapshots)
            GROUP BY client_name, dr_code, client_code
            ORDER BY total_value DESC
            LIMIT 10
        `;

        // Get the snapshot date
        const dateResult = await sql`
            SELECT MAX(snapshot_date) as snapshot_date FROM daily_portfolio_snapshots
        `;

        const snapshotDate = dateResult[0]?.snapshot_date
            ? new Date(dateResult[0].snapshot_date).toISOString().split('T')[0]
            : '';

        await sql.end();

        return {
            snapshot_date: snapshotDate,
            holdings: result
        };
    } catch (error) {
        await sql.end();
        throw error;
    }
}

topHoldings.get("/", async (c) => {
    // Check authentication
    const session = await auth.api.getSession({
        headers: c.req.raw.headers,
    });

    if (!session) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const refresh = c.req.query("refresh") === "true";

    try {
        let data: TopHoldingsResponse | null = null;

        // Try to get from cache if not refresh
        if (!refresh) {
            try {
                const redis = getRedisClient();
                const cachedData = await redis.get(CACHE_KEY);

                if (cachedData) {
                    data = JSON.parse(cachedData);
                    console.log("✅ Cache hit for top holdings");
                }
            } catch (redisError) {
                console.error("Redis error (falling back to DB):", redisError);
            }
        }

        // If no cache hit or refresh requested, fetch from DB
        if (!data) {
            console.log("📊 Fetching top holdings from database");
            data = await fetchTopHoldingsFromDB();

            // Try to cache the result
            try {
                const redis = getRedisClient();
                await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(data));
                console.log("💾 Cached top holdings for 24 hours");
            } catch (redisError) {
                console.error("Failed to cache data (non-critical):", redisError);
                // Continue without caching - database query succeeded
            }
        }

        return c.json(data);
    } catch (error) {
        console.error("Error fetching top holdings:", error);
        return c.json({ error: "Failed to fetch top holdings" }, 500);
    }
});

export default topHoldings;

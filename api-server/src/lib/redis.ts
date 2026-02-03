import Redis from "ioredis";

// Create Redis client singleton
let redis: Redis | null = null;

export function getRedisClient(): Redis {
    if (!redis) {
        const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

        redis = new Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            retryStrategy(times) {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            reconnectOnError(err) {
                const targetErrors = ["READONLY", "ECONNREFUSED"];
                if (targetErrors.some(targetError => err.message.includes(targetError))) {
                    return true;
                }
                return false;
            }
        });

        redis.on("connect", () => {
            console.log("✅ Redis connected");
        });

        redis.on("error", (err) => {
            console.error("❌ Redis error:", err);
        });

        redis.on("ready", () => {
            console.log("🚀 Redis ready");
        });

        redis.on("reconnecting", () => {
            console.log("🔄 Redis reconnecting...");
        });
    }

    return redis;
}

export async function checkRedisHealth(): Promise<boolean> {
    try {
        const client = getRedisClient();
        const result = await client.ping();
        return result === "PONG";
    } catch (error) {
        console.error("Redis health check failed:", error);
        return false;
    }
}

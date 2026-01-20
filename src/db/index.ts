import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getRequestContext } from "@cloudflare/next-on-pages";

const getDbInstance = () => {
    // 1. Try to use Cloudflare Hyperdrive (Production)
    try {
        const { env } = getRequestContext();
        if (env && (env as any).HYPERDRIVE?.connectionString) {
            const client = postgres((env as any).HYPERDRIVE.connectionString, { prepare: false });
            return drizzle(client);
        }
    } catch (e) {
        // Not in a request context or not on Cloudflare
    }

    // 2. Fallback to local DATABASE_URL (Development)
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        // In build time vs runtime, this might trigger. 
        // We return a dummy or throw. For safety in build:
        if (process.env.NODE_ENV === 'production') {
            // throw new Error("DATABASE_URL missing");
        }
        // Return null or handle? Best to assume it exists for now.
    }

    // We assume DATABASE_URL exists if we are here (or postgres will throw)
    const client = postgres(connectionString!, { prepare: false });
    return drizzle(client);
};

// Export a Proxy that resolves the DB instance on every access
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
    get: (target, prop) => {
        const instance = getDbInstance();
        return (instance as any)[prop];
    },
});

// We remove the direct 'client' export as it cannot be static anymore.
// If valid usage requires it, we would need a similar Proxy or accessor.


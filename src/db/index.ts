import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { getRequestContext } from "@cloudflare/next-on-pages";

const getDbInstance = () => {
    // 1. Try to use Cloudflare Hyperdrive (Production)
    try {
        const { env } = getRequestContext();
        if (env && (env as any).HYPERDRIVE?.connectionString) {
            const sql = neon((env as any).HYPERDRIVE.connectionString);
            return drizzle(sql);
        }
    } catch (e) {
        // Not in a request context or not on Cloudflare
    }

    // 2. Fallback to local DATABASE_URL (Development)
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        // During build time, return a dummy that will error on use
        // This prevents build-time failures when DATABASE_URL isn't set
        if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
            // Create a placeholder that will be replaced at runtime
            const dummySql = neon("postgresql://placeholder:placeholder@localhost/placeholder");
            return drizzle(dummySql);
        }
    }

    const sql = neon(connectionString || "postgresql://placeholder:placeholder@localhost/placeholder");
    return drizzle(sql);
};

// Export a Proxy that resolves the DB instance on every access
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
    get: (target, prop) => {
        const instance = getDbInstance();
        return (instance as any)[prop];
    },
});

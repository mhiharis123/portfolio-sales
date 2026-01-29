import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import { user, session, account, verification } from "../db/schema";

const secret = process.env.BETTER_AUTH_SECRET;
if (!secret) {
    throw new Error("BETTER_AUTH_SECRET environment variable is required");
}

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user,
            session,
            account,
            verification,
        },
    }),
    secret,
    emailAndPassword: {
        enabled: true,
    },
    trustedOrigins: (process.env.CORS_ORIGIN || "https://mystocks.pages.dev").split(",").map(o => o.trim()),
    advanced: {
        defaultCookieAttributes: {
            sameSite: "none",
            secure: true,
        },
    },
});

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../src/db";
import { user, session, account, verification } from "../src/db/schema";

const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: { user, session, account, verification }
    }),
    emailAndPassword: {
        enabled: true,
    },
});

async function main() {
    const email = process.argv[2];
    const password = process.argv[3];

    if (!email || !password) {
        console.error("Usage: bun run scripts/seed-user.ts <email> <password>");
        process.exit(1);
    }

    console.log(`Creating user: ${email}...`);

    try {
        const res = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name: "Admin User",
            },
            asResponse: false
        });

        console.log("User created successfully!");
        console.log(res);
    } catch (e) {
        console.error("Error creating user:", e);
    }
    process.exit(0);
}

main();

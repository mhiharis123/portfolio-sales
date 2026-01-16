Act as a Senior Full Stack Engineer. Build a secure, internal-use web application using the following stack:

1. Tech Stack & Environment

Framework: Next.js 15 (App Router).

Runtime: Bun.

Database: PostgreSQL. Please use postgre mcp to create new table under 'salesdb' database.

ORM: Drizzle ORM.

Authentication: Better-Auth (Email/Password provider).

UI: Shadcn/UI (Card, Button, Input, Form, Label, Toast) + Tailwind CSS.

Validation: Zod.

2. Security & Auth Architecture (Closed System)

Access Control: strict Login Only. No public Sign-Up allowed.

Database Schema: Define Drizzle schemas for user, session, account, and verification (standard Better-Auth schema).

User Seeding: Provide a standalone TypeScript script (scripts/seed-user.ts) that allows me to manually insert a user into the database with a securely hashed password compatible with Better-Auth.

Middleware: Protect all routes under /dashboard. Unauthenticated users must be redirected to /login.

3. Core Functionality (The Dashboard)

Route: /dashboard (Protected).

Feature: CSV File Uploader.

UI: A clean Shadcn Card containing a file input (or drag-and-drop area).

Logic (Server Action):

Validate file extension (.csv) and size (max 30MB) using Zod.

Check for active session headers server-side.

Post the file to process.env.N8N_WEBHOOK_URL using fetch.

Return a typed response to the client.

4. Deliverables

File Structure: A clean, domain-driven structure.

Configuration: drizzle.config.ts, better-auth setup options.

The Code:

src/lib/auth.ts: Better-Auth client/server instance.

scripts/seed-user.ts: The script to create my first admin user.

src/app/login/page.tsx: The login form.

src/app/dashboard/page.tsx: The upload interface.

src/actions/upload.ts: The secure server action.
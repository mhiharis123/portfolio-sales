# Portfolio Sales Dashboard

A secure, internal-use web application designed for processing sales data via CSV uploads. This project features a split architecture with a Next.js frontend deployed on Cloudflare Pages and a Hono API server hosted on a VPS.

## 🏗 Architecture

The application is split into two distinct parts:

1.  **Frontend (`/`)**: A Next.js 15 application using the App Router, Shadcn UI, and Tailwind CSS. It handles user interaction, authentication (client-side), and file upload UI. Deployed to **Cloudflare Pages**.
2.  **API Server (`/api-server`)**: A lightweight Hono server running on Bun. It manages authentication (server-side), database interactions with Drizzle ORM, and securely proxies file uploads to an N8N webhook. Deployed to a **VPS**.

### Data Flow
1.  User logs in via the Frontend (Better-Auth).
2.  User uploads a CSV file on the Dashboard.
3.  Frontend sends the file to the API Server.
4.  API Server validates the file and session.
5.  API Server forwards the data to an **N8N Webhook** for processing.

## 🛠 Tech Stack

### Frontend
-   **Framework**: Next.js 15 (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS v4, Shadcn/UI
-   **State/Validation**: React Hook Form, Zod
-   **Auth Client**: Better-Auth (React)
-   **Icons**: Lucide React
-   **Runtime**: Bun

### Backend (API Server)
-   **Framework**: Hono
-   **Runtime**: Bun
-   **Database**: PostgreSQL
-   **ORM**: Drizzle ORM
-   **Auth Server**: Better-Auth
-   **Validation**: Zod

## 🚀 Getting Started

### Prerequisites
-   [Bun](https://bun.sh/) (v1.2 or later)
-   PostgreSQL Database
-   N8N Instance (for webhook processing)

### 1. Environment Setup

Create `.env` files for both the root and `api-server` directories.

**Frontend (`.env`)**
```env
# URL of your Hono API Server
NEXT_PUBLIC_API_URL=http://localhost:3002
```

**Backend (`api-server/.env`)**
```env
# Database Connection
DATABASE_URL=postgresql://user:password@localhost:5432/salesdb

# Better Auth Secret (Must be same as used in generation)
BETTER_AUTH_SECRET=your-secure-random-secret

# N8N Webhook URL for processing uploads
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/xxx

# Frontend Origin (CORS)
CORS_ORIGIN=http://localhost:3000

# Server Port
PORT=3002
```

### 2. Installation & Running Locally

**Install Dependencies:**
```bash
# Root (Frontend)
bun install

# API Server
cd api-server
bun install
```

**Run Database Migrations:**
```bash
cd api-server
bun run drizzle-kit push
```

**Start Development Servers:**

1.  **Start Backend:**
    ```bash
    cd api-server
    bun run dev
    # Runs on http://localhost:3002
    ```

2.  **Start Frontend:**
    ```bash
    # Open a new terminal in the root
    bun run dev
    # Runs on http://localhost:3000
    ```

### 3. User Seeding (First Admin)
Since public sign-up is disabled, you must manually seed the first user.
You can use the implied seeding script or manually insert into the `user` and `account` tables using SQL or Drizzle Studio.

## 📦 Deployment

### Frontend (Cloudflare Pages)
1.  Connect your repository to Cloudflare Pages.
2.  Set the **Build command** to: `bun run build` (or `next build`).
3.  Set the **Output directory** to: `.next` (or default for Next.js).
4.  Add the `NEXT_PUBLIC_API_URL` environment variable pointing to your production VPS API URL.
5.  **Note**: Ensure your `next.config.ts` is configured for `edge` or `nodejs` runtime as appropriate for your specific page needs, though Cloudflare usually handles Next.js automatically via `@cloudflare/next-on-pages`.

### Backend (VPS)
1.  Use Docker or run natively with Bun.
2.  Ensure the `DATABASE_URL` connects to your production Postgres instance.
3.  Set `CORS_ORIGIN` to your Cloudflare Pages domain (e.g., `https://mystocks.pages.dev`).
4.  Expose port `3002` (or use a reverse proxy like Nginx/Caddy).

## 🔒 Security
-   **Strict Auth**: No public sign-ups; only pre-authorized users can log in.
-   **Input Validation**: All uploads are strictly validated for size (max 30MB) and type (CSV) using Zod.
-   **CORS**: RESTRICTED to the frontend domain mainly.

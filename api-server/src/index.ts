import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./lib/auth";
import uploadRoutes from "./routes/upload";

const app = new Hono();

// Get CORS origin from environment
const corsOrigin = (process.env.CORS_ORIGIN || "https://mystocks.pages.dev").split(",").map(o => o.trim());

// Middleware: Logger
app.use("*", logger());

// Middleware: CORS
app.use("*", cors({
    origin: corsOrigin,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "Cookie"],
    credentials: true, // Required for cookies/auth
    exposeHeaders: ["Set-Cookie"],
}));

// Health check endpoint
app.get("/health", (c) => {
    return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Auth routes - handled by better-auth
app.on(["GET", "POST"], "/api/auth/*", (c) => {
    return auth.handler(c.req.raw);
});

// Upload routes
app.route("/api/upload", uploadRoutes);

// 404 handler
app.notFound((c) => {
    return c.json({ error: "Not Found" }, 404);
});

// Error handler
app.onError((err, c) => {
    console.error("Server error:", err);
    return c.json({ error: "Internal Server Error" }, 500);
});

// Start server
const port = parseInt(process.env.PORT || "3002", 10);

console.log(`🚀 API Server starting on port ${port}`);
console.log(`📡 CORS enabled for: ${corsOrigin}`);

export default {
    port,
    fetch: app.fetch,
};

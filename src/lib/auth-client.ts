import { createAuthClient } from "better-auth/react";

// API server URL - points to VPS backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const authClient = createAuthClient({
    baseURL: API_URL,
    fetchOptions: {
        credentials: "include", // Required for cross-origin cookies
    },
});

// Export API URL for other components
export { API_URL };

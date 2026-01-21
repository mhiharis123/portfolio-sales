import { Hono } from "hono";
import { z } from "zod";
import { auth } from "../lib/auth";

const upload = new Hono();

const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB
const ACCEPTED_FILE_TYPES = ["text/csv", "application/vnd.ms-excel"];

const uploadSchema = z.object({
    file: z.instanceof(File)
        .refine((file) => file.size <= MAX_FILE_SIZE, "Max file size is 30MB.")
        .refine(
            (file) => ACCEPTED_FILE_TYPES.includes(file.type) || file.name.endsWith(".csv"),
            "Only .csv files are accepted."
        ),
});

upload.post("/", async (c) => {
    // Get session from request
    const session = await auth.api.getSession({
        headers: c.req.raw.headers,
    });

    if (!session) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    // Parse multipart form data
    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
        return c.json({ error: "No file provided" }, 400);
    }

    // Validate file
    const result = uploadSchema.safeParse({ file });
    if (!result.success) {
        const issues = result.error.issues;
        const msg = issues?.[0]?.message || "Validation failed";
        return c.json({ error: msg }, 400);
    }

    // Post to n8n webhook
    const n8nUrl = process.env.N8N_WEBHOOK_URL;
    if (!n8nUrl) {
        console.error("N8N_WEBHOOK_URL not configured");
        return c.json({ error: "Upload service not configured" }, 500);
    }

    try {
        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("userId", session.user.id);
        uploadData.append("email", session.user.email);

        const response = await fetch(n8nUrl, {
            method: "POST",
            body: uploadData,
        });

        if (!response.ok) {
            throw new Error(`Webhook failed: ${response.statusText}`);
        }

        return c.json({ success: true, message: "File uploaded successfully!" });
    } catch (error) {
        console.error("Upload error:", error);
        return c.json({ error: "Failed to process file upload." }, 500);
    }
});

export default upload;

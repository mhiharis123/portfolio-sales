"use server";

import { auth } from "@/lib/auth";

import { headers } from "next/headers";
import { z } from "zod";

const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB
const ACCEPTED_FILE_TYPES = ["text/csv", "application/vnd.ms-excel"];

const uploadSchema = z.object({
    file: z.instanceof(File)
        .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 30MB.`)
        .refine(
            (file) => ACCEPTED_FILE_TYPES.includes(file.type) || file.name.endsWith(".csv"),
            "Only .csv files are accepted."
        ),
});

export async function uploadFile(formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return { error: "Unauthorized" };
    }

    const file = formData.get("file") as File;

    const result = uploadSchema.safeParse({ file });

    if (!result.success) {
        // cast error to any to avoid version mismatch issues during build
        const issues = (result.error as any).issues || (result.error as any).errors;
        const msg = issues?.[0]?.message || "Validation failed";
        return { error: msg };
    }

    // Post to n8n
    const n8nUrl = process.env.N8N_WEBHOOK_URL;
    if (!n8nUrl) {
        return { error: "N8N_WEBHOOK_URL not configured" };
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

        return { success: true, message: "File uploaded successfully!" };
    } catch (error) {
        console.error("Upload error:", error);
        return { error: "Failed to process file upload." };
    }
}

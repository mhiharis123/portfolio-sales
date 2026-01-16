
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
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

export const POST = async (req: NextRequest) => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        const result = uploadSchema.safeParse({ file });

        if (!result.success) {
            const issues = (result.error as any).issues || (result.error as any).errors;
            const msg = issues?.[0]?.message || "Validation failed";
            return NextResponse.json({ error: msg }, { status: 400 });
        }

        // Post to n8n
        const n8nUrl = process.env.N8N_WEBHOOK_URL;
        if (!n8nUrl) {
            return NextResponse.json({ error: "Configuration Error: N8N_WEBHOOK_URL missing" }, { status: 500 });
        }

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

        return NextResponse.json({ success: true, message: "File uploaded successfully!" });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Failed to process file upload." }, { status: 500 });
    }
}

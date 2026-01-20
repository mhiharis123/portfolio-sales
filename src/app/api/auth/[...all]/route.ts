import { auth } from "@/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";

export const runtime = "edge";
export const { GET, POST } = toNextJsHandler(auth);

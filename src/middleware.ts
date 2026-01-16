import { auth } from "@/lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers)
    });

    if (!session && request.nextUrl.pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"],
};

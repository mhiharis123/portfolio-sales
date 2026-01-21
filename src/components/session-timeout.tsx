"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export function SessionTimeout() {
    const router = useRouter();
    const { data: session } = authClient.useSession();
    const timeoutRef = useRef<NodeJS.Timeout>(null);

    useEffect(() => {
        if (!session) return;

        const resetTimer = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(async () => {
                await authClient.signOut();
                router.push("/login");
            }, TIMEOUT_MS);
        };

        // Events to detect activity
        const events = [
            "mousemove",
            "click",
            "keypress",
            "scroll",
            "touchstart",
        ];

        const handleActivity = () => {
            resetTimer();
        };

        // Initial timer start
        resetTimer();

        // Add event listeners
        events.forEach((event) => {
            window.addEventListener(event, handleActivity);
        });

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            events.forEach((event) => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [session, router]);

    return null;
}

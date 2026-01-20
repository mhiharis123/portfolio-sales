"use client";

export const runtime = "edge";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import FileUploader from "@/components/FileUploader";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
    const { data: session, isPending } = authClient.useSession();
    const router = useRouter();

    const handleLogout = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    toast.success("Logged out successfully");
                    router.push("/login"); // Client-side redirect
                },
            },
        });
    };

    if (isPending) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">P</span>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-gray-900">Portfolio Upload</h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                            <User className="w-4 h-4" />
                            <span>{session?.user.email}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="space-y-6 text-center mb-10">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Upload Portfolio Data
                    </h2>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Securely upload your daily portfolio CSV files. They will be processed automatically by the internal workflow.
                    </p>
                </div>

                <FileUploader />
            </main>
        </div>
    );
}

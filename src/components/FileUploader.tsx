"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileIcon, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadFile } from "@/actions/upload";

export default function FileUploader() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (file: File) => {
        if (!file.name.endsWith(".csv")) {
            toast.error("Only CSV files are allowed");
            return;
        }
        if (file.size > 30 * 1024 * 1024) {
            toast.error("File size must be less than 30MB");
            return;
        }
        setFile(file);
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);

        const formData = new FormData();
        formData.append("file", file);

        const res = await uploadFile(formData);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success(res.message);
            setFile(null);
        }
        setUploading(false);
    };

    return (
        <Card className="w-full max-w-xl mx-auto mt-10 shadow-xl border-dashed border-2 border-gray-200 hover:border-blue-500 transition-colors">
            <CardContent className="p-10 flex flex-col items-center justify-center space-y-4">
                <form
                    className="w-full flex flex-col items-center"
                    onDragEnter={handleDrag}
                    onSubmit={(e) => e.preventDefault()}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        accept=".csv"
                        onChange={handleChange}
                    />

                    {!file ? (
                        <div
                            className={`w-full h-64 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${dragActive ? "bg-blue-50 scale-105" : "bg-gray-50 hover:bg-gray-100"
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => inputRef.current?.click()}
                        >
                            <div className="bg-white p-4 rounded-full shadow-md mb-4">
                                <Upload className="w-8 h-8 text-blue-500" />
                            </div>
                            <p className="text-xl font-semibold text-gray-700">
                                Upload Portfolio CSV
                            </p>
                            <p className="text-sm text-gray-400 mt-2">
                                Drag & drop or click to browse
                            </p>
                            <p className="text-xs text-gray-300 mt-1">
                                Max 30MB
                            </p>
                        </div>
                    ) : (
                        <div className="w-full bg-blue-50 p-6 rounded-xl flex items-center justify-between border border-blue-100">
                            <div className="flex items-center space-x-4">
                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                    <FileIcon className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800 truncate max-w-[200px]">{file.name}</p>
                                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-400 hover:text-red-500"
                                onClick={() => setFile(null)}
                                disabled={uploading}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    )}

                    {file && (
                        <Button
                            onClick={handleUpload}
                            className="w-full mt-6 py-6 text-lg font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-all hover:translate-y-[-2px]"
                            disabled={uploading}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                "Upload Portfolio"
                            )}
                        </Button>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}

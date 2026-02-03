"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, Calendar } from "lucide-react";
import { toast } from "sonner";

interface TopHolding {
    client_name: string;
    dr_code: string;
    client_code: string;
    total_value: string;
}

interface TopHoldingsData {
    snapshot_date: string;
    holdings: TopHolding[];
}

export default function TopHoldings() {
    const [data, setData] = useState<TopHoldingsData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchTopHoldings = async (refresh = false) => {
        const loadingSetter = refresh ? setIsRefreshing : setIsLoading;
        loadingSetter(true);

        try {
            const url = refresh
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/top-holdings?refresh=true`
                : `${process.env.NEXT_PUBLIC_API_URL}/api/top-holdings`;

            const response = await fetch(url, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch top holdings");
            }

            const result: TopHoldingsData = await response.json();
            setData(result);

            if (refresh) {
                toast.success("Data refreshed successfully!");
            }
        } catch (error) {
            console.error("Error fetching top holdings:", error);
            toast.error("Failed to load top holdings");
        } finally {
            loadingSetter(false);
        }
    };

    // Auto-fetch on component mount
    useEffect(() => {
        fetchTopHoldings();
    }, []);

    const formatCurrency = (value: string) => {
        const num = parseFloat(value);
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
        }).format(num);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "N/A";
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(date);
    };

    if (isLoading && !data) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-center space-x-2 text-gray-500">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Loading top holdings...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Top 10 Share Holdings</h2>
                            {data?.snapshot_date && (
                                <div className="flex items-center space-x-1.5 mt-1">
                                    <Calendar className="w-3.5 h-3.5 text-blue-100" />
                                    <p className="text-sm text-blue-100">
                                        As of {formatDate(data.snapshot_date)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    <Button
                        onClick={() => fetchTopHoldings(true)}
                        disabled={isRefreshing}
                        variant="secondary"
                        size="sm"
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                        {isRefreshing ? "Refreshing..." : "Refresh"}
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Rank
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Client Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                DR Code
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Client Code
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Total Value
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data?.holdings && data.holdings.length > 0 ? (
                            data.holdings.map((holding, index) => (
                                <tr
                                    key={`${holding.client_code}-${index}`}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span
                                                className={`
                                                    inline-flex items-center justify-center w-8 h-8 rounded-full
                                                    ${index === 0 ? "bg-yellow-100 text-yellow-800 font-bold" : ""}
                                                    ${index === 1 ? "bg-gray-200 text-gray-700 font-bold" : ""}
                                                    ${index === 2 ? "bg-orange-100 text-orange-700 font-bold" : ""}
                                                    ${index > 2 ? "bg-gray-100 text-gray-600" : ""}
                                                `}
                                            >
                                                {index + 1}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {holding.client_name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {holding.dr_code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {holding.client_code}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span className="text-sm font-semibold text-gray-900">
                                            {formatCurrency(holding.total_value)}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

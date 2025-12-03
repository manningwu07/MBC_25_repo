// app/causes/page.tsx
'use client';

import { MainNav } from "~/components/layout/main-nav";
import { LiveMap } from "~/components/dashboard/live-map"; // Your existing map component
import { TransactionFeed } from "~/components/dashboard/transaction-feed";
import { Activity, TrendingUp, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { ConflictZone, fetchPolymarketData } from "~/lib/polymarket";

export default function CausesPage() {

    const [hottestZone, setHottestZone] = useState<ConflictZone | null>(null);

    useEffect(() => {
        fetchPolymarketData().then((data) => {
            if (data.length > 0) {
                setHottestZone(data[0]); // First item is now hottest due to sort
            }
        });
    }, []);

    return (
        <div className="min-h-screen bg-[#020410] text-white flex flex-col">
            <MainNav />

            <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-80px)] overflow-hidden">

                {/* LEFT PANEL: Data & Feed */}
                <div className="w-full md:w-[400px] lg:w-[450px] bg-[#0A0C16] border-r border-white/5 flex flex-col h-full overflow-y-auto custom-scrollbar">

                    <div className="p-6 border-b border-white/5">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Activity className="text-[#14F195]" /> Live Conflict Data
                        </h2>
                        <p className="text-sm text-gray-500 mt-2">
                            Real-time market prediction data identifies high-need zones.
                        </p>
                    </div>

                    {/* Polymarket Stats Mockup */}
                    <div className="p-6 space-y-6">
                        <div className="bg-[#131625] rounded-xl p-4 border border-white/5">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-bold text-gray-400 uppercase">Top Prediction Markets</span>
                                <TrendingUp size={14} className="text-[#9945FF]" />
                            </div>
                            {/* Simple List Mocking Charts */}
                            <div className="space-y-3">
                                {[
                                    { name: "Israel / Hamas Ceasefire", vol: "$4.2M", up: true },
                                    { name: "Ukraine Border Control", vol: "$1.8M", up: false },
                                    { name: "Sudan Humanitarian Corridor", vol: "$500k", up: true },
                                ].map((m, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm">
                                        <span className="text-gray-300">{m.name}</span>
                                        <span className={m.up ? "text-[#14F195]" : "text-red-500"}>{m.vol}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Integration with existing Transaction Feed */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold text-gray-400 uppercase">Recent On-Chain Relief</h3>
                            {/* Modified Container for feed */}
                            <div className="h-[550px] overflow-hidden rounded-xl border border-white/5 relative">
                                <div className="absolute inset-0 z-0">
                                    <TransactionFeed />
                                    {/* Note: You might need to adjust styling inside TransactionFeed to fit this smaller container perfectly, or just wrap it */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: Map */}
                <div className="flex-1 relative bg-black">
                    {/* Dynamic Overlay Controls */}
                    {hottestZone && (
                        <div className="absolute top-6 left-6 z-10 space-y-2 animate-in slide-in-from-left-4 duration-500">
                            <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 max-w-sm shadow-2xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                    </span>
                                    <h3 className="font-bold text-[#14F195] uppercase text-xs tracking-wider">
                                        Highest Priority Zone
                                    </h3>
                                </div>

                                <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                                    <AlertTriangle size={18} className="text-red-500" />
                                    {hottestZone.name}
                                </h2>

                                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                                    Polymarket volume <span className="text-[#14F195] font-mono">${(hottestZone.volume / 1000).toFixed(1)}k</span> indicates high probability of increased aid need.
                                </p>
                                {/* Note: The button here could also trigger the modal if you pass a handler, for now we keep it informational or link to donation logic */}
                            </div>
                        </div>
                    )}

                    <div className="w-full h-full">
                        <LiveMap hottestZone={hottestZone} />
                    </div>
                </div>

            </div>
        </div>
    );
}
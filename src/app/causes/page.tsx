// app/causes/page.tsx
'use client';

import { MainNav } from "~/components/layout/main-nav";
import { LiveMap } from "~/components/dashboard/live-map"; // Your existing map component
import { TransactionFeed } from "~/components/dashboard/transaction-feed";
import { Activity, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function CausesPage() {
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
                    <div className="h-[300px] overflow-hidden rounded-xl border border-white/5 relative">
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
            {/* Overlay Controls */}
            <div className="absolute top-6 left-6 z-10 space-y-2">
                 <div className="bg-black/60 backdrop-blur-md p-3 rounded-lg border border-white/10 max-w-sm">
                    <h3 className="font-bold flex items-center gap-2 text-[#14F195]">
                        <AlertTriangle size={16} /> High Priority Zone: Eastern Europe
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                        Polymarket volume indicates 85% probability of increased conflict intensity in next 24h.
                    </p>
                    <div className="mt-3 flex gap-2">
                        <Button className="h-8 text-xs bg-[#14F195] text-black hover:bg-[#14F195]/80">Donate to Region</Button>
                    </div>
                 </div>
            </div>
            
            {/* The Globe Component */}
            <div className="w-full h-full">
                <LiveMap />
            </div>
         </div>

      </div>
    </div>
  );
}
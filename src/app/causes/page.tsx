// src/app/causes/page.tsx
'use client';

import { MainNav } from "~/components/layout/main-nav";
import { LiveMap } from "~/components/dashboard/live-map";
import { TransactionFeed } from "~/components/dashboard/transaction-feed";
import { Activity } from "lucide-react";
import { useState } from "react";
import { CAUSES } from "~/lib/causes";

export default function CausesPage() {
    const [activeId, setActiveId] = useState<string | null>(CAUSES[0].id);

    return (
        <div className="min-h-screen bg-[#020410] text-white flex flex-col">
            <MainNav />

            <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-80px)] overflow-hidden">
                {/* LEFT PANEL */}
                <div className="w-full md:w-[400px] lg:w-[450px] bg-[#0A0C16] border-r border-white/5 flex flex-col h-full overflow-y-auto custom-scrollbar">
                    
                    <div className="p-6 border-b border-white/5">
                        <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                            <Activity className="text-blue-500" /> Active Relief Funds
                        </h2>
                        <p className="text-sm text-gray-500 mt-2">
                            Verified smart contracts deployed on Solana. Powered by Circle for global liquidity.
                        </p>
                    </div>

                    <div className="p-6 space-y-4">
                        {CAUSES.map((cause) => (
                            <div 
                                key={cause.id}
                                onClick={() => setActiveId(cause.id)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                    activeId === cause.id 
                                    ? "bg-blue-500/10 border-blue-500/40" 
                                    : "bg-[#131625] border-white/5 hover:border-white/10"
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-white">{cause.name}</h3>
                                    {activeId === cause.id && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"/>}
                                </div>
                                <p className="text-xs text-gray-400 line-clamp-2 mb-3">{cause.description}</p>
                                <div className="flex items-center gap-2">
                                    {cause.tags.map(t => (
                                        <span key={t} className="text-[10px] px-2 py-1 bg-black rounded-md text-gray-300 font-medium">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="mt-8 pt-8 border-t border-white/5">
                             <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Recent On-Chain Activity</h3>
                             <div className="h-[200px] overflow-hidden rounded-xl border border-white/5 relative">
                                <TransactionFeed />
                             </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: Map */}
                <div className="flex-1 relative bg-black">
                    <LiveMap activeCauseId={activeId} />
                </div>
            </div>
        </div>
    );
}
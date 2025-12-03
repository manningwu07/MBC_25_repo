/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Zap, ExternalLink, Loader2, Maximize2, Minimize2, Wallet } from 'lucide-react';
import { clsx } from 'clsx';
import { fetchPolymarketData, ConflictZone } from '~/lib/polymarket';

// Dynamic import for Globe
const Globe: any = dynamic(() => import('react-globe.gl'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#080808] animate-pulse" /> 
}) as any;

// Helper to simulate "Verified Wallets" for the hackathon demo based on live data
const DEMO_WALLETS = ['RedCross-SOL', 'DirectRelief-DAO', 'UNICEF-Crypto', 'MercyCorps-L2', 'GazaRelief-Fund'];
const getDemoWallets = (seedStr: string) => {
    // Deterministic selection so it stays consistent per zone
    const index = seedStr.charCodeAt(0) % (DEMO_WALLETS.length - 1);
    return DEMO_WALLETS.slice(index, index + 2);
};

export function LiveMap() {
  const globeRef = useRef<any>(null);
  const [zones, setZones] = useState<(ConflictZone & { activeWallets: string[], searchQuery: string })[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New State for UI interactions
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<any>(null);

  // Fetch real data on mount & augment for Demo UI
  useEffect(() => {
    fetchPolymarketData().then((data) => {
      const augmented = data.map(z => ({
        ...z,
        searchQuery: z.name, // Use the market name for Ground News search
        activeWallets: getDemoWallets(z.name) // Attach demo wallets
      }));
      setZones(augmented);
      setLoading(false);
    });
  }, []);

  // Format points for the globe
  const points = useMemo(
    () =>
      zones.map((z) => ({
        ...z,
        // Logarithmic scaling for size based on volume, clamped
        size: Math.max(0.3, Math.min(1.2, Math.log(z.volume) / 15)),
        color: '#14f195', // Solana Green
      })),
    [zones]
  );

  // Handle Resize triggers
  useEffect(() => {
    const handleResize = () => {
        if (globeRef.current) {
            globeRef.current.controls().autoRotate = !hoveredNode;
        }
    };
    window.dispatchEvent(new Event('resize'));
    return handleResize;
  }, [isExpanded, hoveredNode]);

  // Camera Logic
  useEffect(() => {
    const g = globeRef.current;
    if (!g || loading) return;
    
    // Animate view
    g.pointOfView({ lat: 20, lng: 20, altitude: isExpanded ? 1.8 : 2.3 }, 1000);
    
    const ctrl = g.controls();
    if (ctrl) {
      ctrl.autoRotate = true;
      ctrl.autoRotateSpeed = 0.5;
      ctrl.enableZoom = isExpanded;
      ctrl.dampingFactor = 0.1;
    }
  }, [loading, isExpanded]);

  return (
    <div 
        className={clsx(
            "transition-all duration-500 ease-in-out relative overflow-hidden bg-[#080808] border border-white/10 group",
            isExpanded 
            ? "fixed inset-0 z-50 h-screen w-screen rounded-none" 
            : "w-full h-[400px] rounded-3xl"
        )}
    >
      
      {/* Header Overlay */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-2 pointer-events-none">
        <h3 className="text-white font-bold flex items-center gap-2 bg-black/60 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 pointer-events-auto">
          <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse shadow-[0_0_10px_#14f195]" />
          Active Zones
        </h3>
        {loading && <span className="text-xs text-gray-500 ml-2 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Syncing Polymarket...</span>}
      </div>

      {/* Expand/Collapse Button */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute top-6 right-6 z-20 p-2 bg-black/60 hover:bg-white/10 border border-white/10 rounded-full text-white transition-colors backdrop-blur-md pointer-events-auto"
      >
        {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
      </button>

      {/* --- Hover Tooltip Card --- */}
      {hoveredNode && (
        <div 
            className="absolute z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:translate-x-0 md:translate-y-0 md:top-24 md:left-auto md:right-8 w-72 bg-black/80 backdrop-blur-xl border border-brand-green/30 rounded-xl p-4 shadow-[0_0_30px_rgba(20,241,149,0.1)] pointer-events-auto animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-bold text-lg text-white leading-tight">{hoveredNode.name}</h4>
              <p className="text-xs text-brand-green uppercase tracking-wider font-mono mt-1">
                Vol: ${(hoveredNode.volume / 1000).toFixed(1)}k
              </p>
            </div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping mt-1" />
          </div>

          <div className="space-y-3 mt-4">
             {/* Wallets Section */}
             <div>
                <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                    <Wallet size={12} /> Verified Relief Wallets
                </p>
                <div className="flex flex-wrap gap-1">
                    {hoveredNode.activeWallets.map((w: string) => (
                        <span key={w} className="text-[10px] bg-white/10 px-2 py-1 rounded text-white border border-white/5">
                            {w}
                        </span>
                    ))}
                </div>
             </div>

             {/* Ground News Link */}
             <a 
                href={`https://ground.news/search?q=${encodeURIComponent(hoveredNode.searchQuery)}`}
                target="_blank" 
                rel="noreferrer"
                className="block w-full text-center py-2 bg-brand-green/10 hover:bg-brand-green/20 border border-brand-green/50 rounded-lg text-brand-green text-xs font-bold transition-colors items-center justify-center gap-2"
             >
                Verify on Ground News <ExternalLink size={12} />
             </a>
             
             {/* Original Source Link */}
             <a 
                href={hoveredNode.url}
                target="_blank" 
                rel="noreferrer"
                className="block text-[10px] text-gray-500 hover:text-white text-center"
             >
                View Prediction Market Source
             </a>
          </div>
        </div>
      )}

      {/* --- The Globe --- */}
      <Globe
        ref={globeRef}
        width={undefined}
        height={undefined}
        backgroundColor="#050505"
        // High contrast night map for better visibility of green points
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointAltitude="size"
        pointColor="color"
        pointRadius={0.4}
        
        // Atmosphere
        atmosphereColor="#14f195"
        atmosphereAltitude={0.2}

        // Interaction
        onPointHover={setHoveredNode}
        onPointClick={(node: any) => {
            if (node) {
                globeRef.current?.pointOfView({ lat: node.lat, lng: node.lng, altitude: 1.5 }, 1000);
            }
        }}
      />

      {/* Footer Overlay (Hide when expanded for cleaner look) */}
      {!isExpanded && (
        <div className="absolute bottom-0 inset-x-0 p-3 border-t border-white/10 bg-black/70 backdrop-blur-sm flex justify-between items-center text-xs text-gray-400">
            <div className="flex gap-4 overflow-x-auto no-scrollbar mask-linear-fade max-w-[70%]">
            {zones.slice(0, 4).map((z) => (
                <div key={z.id} className="flex items-center gap-1 whitespace-nowrap">
                <span className="w-1 h-1 bg-brand-green rounded-full" /> 
                {z.name.length > 20 ? z.name.substring(0, 20) + '...' : z.name}
                </div>
            ))}
            </div>
            <div className="flex items-center gap-2 text-brand-green whitespace-nowrap font-mono">
            <Zap size={14} /> Live Oracle
            </div>
        </div>
      )}
    </div>
  );
}
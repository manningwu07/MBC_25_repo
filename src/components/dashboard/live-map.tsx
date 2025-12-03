/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { ExternalLink, Loader2, Maximize2, X, Wallet } from 'lucide-react';
import { clsx } from 'clsx';
import { fetchPolymarketData, ConflictZone } from '~/lib/polymarket';

// Dynamic import for Globe
const Globe: any = dynamic(() => import('react-globe.gl'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#050505] animate-pulse flex items-center justify-center text-gray-500">Loading 3D Map...</div> 
}) as any;

const DEMO_WALLETS = ['RedCross-SOL', 'DirectRelief-DAO', 'UNICEF-Crypto', 'MercyCorps-L2', 'GazaRelief-Fund'];
const getDemoWallets = (seedStr: string) => {
    const index = seedStr.charCodeAt(0) % (DEMO_WALLETS.length - 1);
    return DEMO_WALLETS.slice(index, index + 2);
};

export function LiveMap() {
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [zones, setZones] = useState<(ConflictZone & { activeWallets: string[], searchQuery: string })[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [isExpanded, setIsExpanded] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Interaction States
  const [hoveredNode, setHoveredNode] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null); // New: Locks the view
  
  // Decide what to show: Selected takes priority over Hovered
  const activeNode = selectedNode || hoveredNode;

  // Helper to handle closing full screen safely
  const handleDeExpand = useCallback(() => {
      setIsExpanded(false);
      setSelectedNode(null); // Optional: reset selection on close
      // Reset camera after a slight delay to allow transition
      setTimeout(() => {
          globeRef.current?.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 1000);
      }, 500);
  }, []);


  const points = useMemo(
    () =>
      zones.map((z) => ({
        ...z,
        size: Math.max(0.3, Math.min(1.2, Math.log(z.volume) / 15)),
        color: selectedNode?.id === z.id ? '#ffffff' : '#14f195',
        label: z.name
      })),
    [zones, selectedNode]
  );


  useEffect(() => {
    fetchPolymarketData().then((data) => {
      const augmented = data.map(z => ({
        ...z,
        searchQuery: z.name,
        activeWallets: getDemoWallets(z.name)
      }));
      setZones(augmented);
      setLoading(false);
    });
  }, []);


  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
      if (globeRef.current) globeRef.current.controls().update();
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    // Keyboard Shortcut: Escape to close
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isExpanded) {
            handleDeExpand();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
        window.removeEventListener('resize', updateDimensions);
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleDeExpand, isExpanded]);

  useEffect(() => {
    const g = globeRef.current;
    if (!g || loading) return;
    
    const ctrl = g.controls();
    
    // Logic: 
    // If Selected: Lock rotation, Zoom in close.
    // If Hovered (but not selected): Pause rotation, do NOT change zoom (avoids jumpiness).
    // If Idle: Auto rotate, default zoom.
    
    if (selectedNode) {
        ctrl.autoRotate = false;
        g.pointOfView({ lat: selectedNode.lat, lng: selectedNode.lng, altitude: 1.5 }, 1000);
    } else if (hoveredNode) {
        ctrl.autoRotate = false;
        // Do NOT set pointOfView here, allows user to hover without camera jumping
    } else {
        ctrl.autoRotate = true;
        ctrl.autoRotateSpeed = 0.5;
        // Only reset view if we are completely idle and not manually moving
        // (Optional: can add a "reset view" timeout if needed, but usually better to leave it)
    }

  }, [selectedNode, hoveredNode, loading]);

  return (
    <div 
        ref={containerRef}
        className={clsx(
            "relative overflow-hidden bg-[#050505] transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]",
            isExpanded 
            ? "fixed inset-0 z-100 h-screen w-screen" // High Z-Index to cover everything
            : "w-full h-full"
        )}
    >
      
      {/* Header Overlay */}
      <div className="absolute top-6 left-6 z-40 flex flex-col gap-2 pointer-events-none">
        <h3 className="text-white font-bold flex items-center gap-2 bg-black/60 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 pointer-events-auto shadow-xl">
          <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse shadow-[0_0_10px_#14f195]" />
          {selectedNode ? 'Zone Selected' : 'Active Zones'}
        </h3>
        {loading && <span className="text-xs text-gray-500 ml-2 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Syncing Polymarket...</span>}
      </div>

      {/* Close / Expand Controls */}
      <div className="absolute top-6 right-6 z-50 flex gap-2">
          {/* Instructions Hint (Only visible when expanded) */}
          {isExpanded && (
            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-xs text-gray-400 mr-2">
                <span>Press <kbd className="bg-white/10 px-1 rounded">Esc</kbd> to exit</span>
            </div>
          )}

          <button 
            onClick={(e) => {
                e.stopPropagation();
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                isExpanded ? handleDeExpand() : setIsExpanded(true);
            }}
            className="p-3 bg-black/60 hover:bg-white/20 border border-white/20 rounded-full text-white transition-all backdrop-blur-md shadow-xl cursor-pointer group"
          >
            {isExpanded ? (
                <X size={24} className="group-hover:scale-90 transition-transform" /> 
            ) : (
                <Maximize2 size={24} className="group-hover:scale-110 transition-transform" />
            )}
          </button>
      </div>

      {/* --- Active Node Card (Persistent if Selected, Transient if Hovered) --- */}
      {activeNode && (
        <div 
            // If selected, prevent clicks from bubbling to globe (which would deselect)
            onClick={(e) => e.stopPropagation()}
            className={clsx(
                "absolute z-40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:translate-x-0 md:translate-y-0 md:top-28 md:left-auto md:right-8 w-80 bg-black/90 backdrop-blur-xl border rounded-2xl p-5 shadow-[0_0_50px_rgba(20,241,149,0.15)] pointer-events-auto transition-all duration-300",
                selectedNode ? "border-brand-green ring-1 ring-brand-green/50 scale-100 opacity-100" : "border-white/10 scale-95 opacity-90"
            )}
        >
          {/* Close selection button (only if selected) */}
          {selectedNode && (
              <button 
                onClick={() => setSelectedNode(null)}
                className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-colors"
              >
                  <X size={14} />
              </button>
          )}

          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-bold text-xl text-white leading-tight pr-4">{activeNode.name}</h4>
              <p className="text-xs text-brand-green uppercase tracking-wider font-mono mt-1 font-bold">
                Vol: ${(activeNode.volume / 1000).toFixed(1)}k
              </p>
            </div>
            {/* Ping animation only for active live zones */}
            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping mt-2 shrink-0" />
          </div>

          <div className="space-y-4 mt-4">
             {/* Wallets Section */}
             <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1">
                    <Wallet size={10} /> Verified Relief Wallets
                </p>
                <div className="flex flex-wrap gap-2">
                    {activeNode.activeWallets.map((w: string) => (
                        <span key={w} className="text-xs bg-brand-green/10 text-brand-green px-2 py-1 rounded border border-brand-green/20 font-mono">
                            {w}
                        </span>
                    ))}
                </div>
             </div>

             {/* Action Buttons */}
             <div className="grid grid-cols-1 gap-2">
                <a 
                    href={`https://ground.news/search?q=${encodeURIComponent(activeNode.searchQuery)}`}
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-brand-green hover:bg-brand-green/90 text-black rounded-lg text-xs font-bold transition-all shadow-lg hover:shadow-brand-green/20"
                >
                    Verify on Ground News <ExternalLink size={12} />
                </a>
                
                <a 
                    href={activeNode.url}
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2 text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
                >
                    Source: Polymarket Oracle
                </a>
             </div>
          </div>
        </div>
      )}

      {/* --- The Globe --- */}
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        
        backgroundColor="#050505"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointAltitude="size"
        pointColor="color"
        pointRadius={0.5}
        pointResolution={10}
        
        // Atmosphere
        atmosphereColor="#14f195"
        atmosphereAltitude={0.15}

        // Interaction
        onPointHover={(node: any) => {
            // Only update hover state if we haven't locked a selection
            // Or if we have, we allow hovering other nodes but the card won't change unless clicked
            // Actually, simpler UX: Hover always updates 'hoveredNode', but UI prefers 'selectedNode'
            setHoveredNode(node);
            
            // If hovering over nothing, and we have a selection, keep cursor pointer
            if (document.body) {
                document.body.style.cursor = node ? 'pointer' : 'default';
            }
        }}
        onPointClick={(node: any) => {
            if (node) {
                setSelectedNode(node); // Locks the card
            } else {
                setSelectedNode(null); // Clicking background deselects
            }
        }}
        // Click background to deselect
        onGlobeClick={() => setSelectedNode(null)}
      />

      {/* Footer Instructions (Changes based on state) */}
      {!isExpanded && !selectedNode && (
        <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
            <span className="text-xs text-gray-500 bg-black/50 px-3 py-1 rounded-full border border-white/5 backdrop-blur-sm">
                Click a zone to view details & verify
            </span>
        </div>
      )}
    </div>
  );
}
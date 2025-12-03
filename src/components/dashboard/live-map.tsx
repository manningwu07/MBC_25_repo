/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Zap, ExternalLink, Loader2, Maximize2, Minimize2, Wallet, X } from 'lucide-react';
import { clsx } from 'clsx';
import { fetchPolymarketData, ConflictZone } from '~/lib/polymarket';
import { DonationModal } from '~/components/ui/donation-modal';

const Globe: any = dynamic(() => import('react-globe.gl'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#080808] animate-pulse flex items-center justify-center text-gray-500">Loading 3D Map...</div> 
}) as any;

const DEMO_WALLETS = ['RedCross-SOL', 'DirectRelief-DAO', 'UNICEF-Crypto'];
const getDemoWallets = (seedStr: string) => {
    // Deterministic fake wallets for demo
    const index = seedStr.charCodeAt(0) % (DEMO_WALLETS.length - 1);
    return DEMO_WALLETS.slice(index, index + 2);
};

export function LiveMap() {
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zones, setZones] = useState<(ConflictZone & { activeWallets: string[], searchQuery: string })[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null); // Click persistence
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ name: '', address: '' });

  // 1. Fetch Data
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

  // 2. Resize Logic
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
      if (globeRef.current) {
        globeRef.current.controls().update();
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    const timeout = setTimeout(updateDimensions, 100);
    return () => {
      window.removeEventListener('resize', updateDimensions);
      clearTimeout(timeout);
    };
  }, [isExpanded]);

  const points = useMemo(() =>
      zones.map((z) => ({
        ...z,
        size: Math.max(0.3, Math.min(1.2, Math.log(z.volume) / 15)),
        color: '#14f195',
      })),
    [zones]
  );

  // Trigger donation modal
  const openDonation = (name: string, address: string) => {
    setModalData({ name, address });
    setModalOpen(true);
  };

  const activeNode = selectedNode || hoveredNode;

  return (
    <div 
        ref={containerRef}
        className={clsx(
            "relative overflow-hidden bg-[#050505] transition-all duration-500",
            isExpanded ? "fixed inset-0 z-50 h-screen w-screen" : "w-full h-full" 
        )}
    >
      <DonationModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        recipientName={modalData.name} 
        walletAddress={modalData.address} 
      />

      {/* Map Controls Top Right */}
      <button 
        onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
        className="absolute top-4 right-4 z-40 p-2 bg-black/60 hover:bg-white/10 border border-white/10 rounded-lg text-white backdrop-blur-md"
      >
        {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
      </button>

      {/* "Zone Selected" Card - Bottom Right to avoid overlap */}
      {activeNode && (
        <div className="absolute bottom-4 right-4 z-30 w-80 bg-[#0A0C16]/95 backdrop-blur-xl border border-[#14F195]/30 rounded-xl p-5 shadow-[0_0_50px_rgba(20,241,149,0.1)] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <button 
            onClick={() => { setSelectedNode(null); setHoveredNode(null); }}
            className="absolute top-2 right-2 text-gray-500 hover:text-white"
          >
            <X size={14} />
          </button>

          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-bold text-lg text-white leading-tight">{activeNode.name}</h4>
              <p className="text-xs text-[#14F195] uppercase tracking-wider font-mono mt-1 font-bold">
                Vol: ${(activeNode.volume / 1000).toFixed(1)}k
              </p>
            </div>
          </div>

          <div className="space-y-4 mt-4">
             {/* Interactive Wallets */}
             <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1">
                    <Wallet size={10} /> Verified Relief Contracts
                </p>
                <div className="flex flex-wrap gap-2">
                    {activeNode.activeWallets.map((w: string) => (
                        <button 
                            key={w} 
                            onClick={() => openDonation(activeNode.name, w)}
                            className="text-xs bg-[#14F195]/10 hover:bg-[#14F195]/30 text-[#14F195] px-2 py-1 rounded border border-[#14F195]/20 font-mono transition-colors cursor-pointer"
                        >
                            {w}
                        </button>
                    ))}
                </div>
             </div>

             {/* Main Donate Button */}
             <button 
                onClick={() => openDonation(activeNode.name, "Smart-Contract-Pool")}
                className="w-full py-2.5 bg-[#14F195] hover:bg-[#14F195]/90 text-black font-bold rounded-lg transition-all text-sm shadow-[0_0_15px_rgba(20,241,149,0.3)]"
             >
                Donate to Region
             </button>

             <a 
                href={activeNode.url} 
                target="_blank" rel="noreferrer"
                className="block text-center text-[10px] text-gray-500 hover:text-white"
            >
                Source: Polymarket Oracle
             </a>
          </div>
        </div>
      )}

      {/* --- The Globe --- */}
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="#000000"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointAltitude="size"
        pointColor="color"
        pointRadius={0.6}
        pointResolution={10}
        atmosphereColor="#14f195"
        atmosphereAltitude={0.15}
        onPointHover={setHoveredNode}
        onPointClick={(node: any) => {
            setSelectedNode(node);
            globeRef.current?.pointOfView({ lat: node.lat, lng: node.lng, altitude: 1.5 }, 1000);
        }}
      />
      
      <div className="absolute bottom-2 left-2 text-[10px] text-gray-600 font-mono pointer-events-none">
        <Zap size={10} className="inline mr-1"/> Live Connection
      </div>
    </div>
  );
}
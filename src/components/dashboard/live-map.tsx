/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Zap, Maximize2, Minimize2, Wallet, X } from 'lucide-react';
import { clsx } from 'clsx';
import { fetchPolymarketData, ConflictZone } from '~/lib/polymarket';
import { DonationModal } from '~/components/ui/donation-modal';

const Globe: any = dynamic(() => import('react-globe.gl'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#080808] animate-pulse flex items-center justify-center text-gray-500">Loading 3D Map...</div> 
}) as any;

const DEMO_WALLETS = ['RedCross-SOL', 'DirectRelief-DAO', 'UNICEF-Crypto'];
const getDemoWallets = (seedStr: string) => {
    const index = seedStr.charCodeAt(0) % (DEMO_WALLETS.length - 1);
    return DEMO_WALLETS.slice(index, index + 2);
};

// Interface for Props
interface LiveMapProps {
  hottestZone?: ConflictZone | null;
}

export function LiveMap({ hottestZone }: LiveMapProps) {
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zones, setZones] = useState<(ConflictZone & { activeWallets: string[], searchQuery: string })[]>([]);
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ name: '', address: '', isPool: false });

  // 1. Fetch Data
  useEffect(() => {
    fetchPolymarketData().then((data) => {
      const augmented = data.map(z => ({
        ...z,
        searchQuery: z.name,
        activeWallets: getDemoWallets(z.name)
      }));
      setZones(augmented);
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

  // Handle Hottest Zone Focus
  useEffect(() => {
    if (hottestZone && globeRef.current) {
        globeRef.current.pointOfView({ lat: hottestZone.lat, lng: hottestZone.lng, altitude: 1.5 }, 2000);
    }
  }, [hottestZone]);

  const points = useMemo(() =>
      zones.map((z) => ({
        ...z,
        size: Math.max(0.3, Math.min(1.2, Math.log(z.volume) / 15)),
        color: '#14f195',
      })),
    [zones]
  );

  // Updated Trigger function
  const openDonation = (name: string, address: string, isPool: boolean) => {
    setModalData({ name, address, isPool });
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
        recipientAddress={modalData.address} 
        isPool={modalData.isPool}
      />

      <button 
        onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
        className="absolute top-4 right-4 z-40 p-2 bg-black/60 hover:bg-white/10 border border-white/10 rounded-lg text-white backdrop-blur-md"
      >
        {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
      </button>

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
             <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1">
                    <Wallet size={10} /> Verified Relief Contracts
                </p>
                
                <select 
                    className="w-full bg-black border border-white/20 rounded-md p-2 text-xs text-white outline-none mb-3"
                    onChange={(e) => {
                        if(e.target.value !== "") {
                            // isPool = false for direct wallet
                            openDonation(activeNode.name, e.target.value, false);
                            // Reset select to default
                            e.target.value = "";
                        }
                    }}
                    defaultValue=""
                >
                    <option value="" disabled>Select Direct Wallet...</option>
                    {activeNode.activeWallets.map((w: string) => (
                        <option key={w} value={w}>{w}</option>
                    ))}
                </select>

                <button 
                    onClick={() => openDonation(activeNode.name, "Smart-Contract-Pool", true)}
                    className="w-full py-2.5 bg-[#14F195] hover:bg-[#14F195]/90 text-black font-bold rounded-lg transition-all text-sm shadow-[0_0_15px_rgba(20,241,149,0.3)]"
                >
                    Donate to Region Pool
                </button>
             </div>

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
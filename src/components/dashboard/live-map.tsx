/* eslint-disable @typescript-eslint/no-explicit-any */

// src/components/dashboard/live-map.tsx
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Zap, Maximize2, Minimize2, Wallet, X } from 'lucide-react';
import { clsx } from 'clsx';
import { CAUSES, Cause } from '~/lib/causes'; // NEW IMPORT
import { DonationModal } from '~/components/ui/donation-modal';
import { usePool } from '~/lib/hooks/usePools';

const LAMPORTS_PER_SOL = 1_000_000_000;

const Globe: any = dynamic(() => import('react-globe.gl'), {
	ssr: false,
	loading: () => <div className="w-full h-full bg-[#080808] animate-pulse flex items-center justify-center text-gray-500">Loading Circle Infrastructure...</div>
}) as any;

interface LiveMapProps {
	activeCauseId?: string | null;
}

export function LiveMap({ activeCauseId }: LiveMapProps) {
	const globeRef = useRef<any>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
	const [isExpanded, setIsExpanded] = useState(false);

	// Modal State
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedCause, setSelectedCause] = useState<Cause | null>(null);

	const { data: poolInfo, isLoading: isLoadingPool } = usePool(
		selectedCause?.poolId ?? -1
	);

	// Resize Logic
	useEffect(() => {
		const updateDimensions = () => {
			if (containerRef.current) {
				setDimensions({
					width: containerRef.current.clientWidth,
					height: containerRef.current.clientHeight
				});
			}
		};
		updateDimensions();
		window.addEventListener('resize', updateDimensions);
		return () => window.removeEventListener('resize', updateDimensions);
	}, [isExpanded]);

	// Focus Logic
	useEffect(() => {
		let t: ReturnType<typeof setTimeout> | null = null;
		if (activeCauseId && globeRef.current) {
			const cause = CAUSES.find(c => c.id === activeCauseId);
			if (cause) {
				globeRef.current.pointOfView({ lat: cause.location.lat, lng: cause.location.lng, altitude: 1.5 }, 2000);
				// schedule state update asynchronously to avoid cascading renders inside the effect
				t = setTimeout(() => setSelectedCause(cause), 0);
			}
		}
		return () => {
			if (t !== null) clearTimeout(t);
		};
	}, [activeCauseId]);

	const points = useMemo(() =>
		CAUSES.map((c) => ({
			...c,
			size: 0.5,
			color: '#2775CA', // USDC Blue
		})),
		[]
	);

	return (
		<div
			ref={containerRef}
			className={clsx(
				"relative overflow-hidden bg-[#050505] transition-all duration-500 border-l border-white/5",
				isExpanded ? "fixed inset-0 z-50 h-screen w-screen" : "w-full h-full"
			)}
		>
			{/* Donation Modal */}
			{selectedCause && (
				<DonationModal
					isOpen={modalOpen}
					onClose={() => setModalOpen(false)}
					recipientName={selectedCause.name}
					poolId={selectedCause.poolId}
				/>
			)}

			<div className="absolute top-4 right-4 z-40 flex gap-2">
				<button
					onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
					className="p-2 bg-black/60 hover:bg-white/10 border border-white/10 rounded-lg text-white backdrop-blur-md"
				>
					{isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
				</button>
			</div>

			{selectedCause && !modalOpen && (
				<div className="absolute bottom-6 right-6 z-30 w-80 bg-[#0A0C16]/95 backdrop-blur-xl border border-blue-500/30 rounded-xl p-5 animate-in slide-in-from-bottom-5 fade-in duration-300 shadow-2xl">
					<button
						onClick={() => setSelectedCause(null)}
						className="absolute top-2 right-2 text-gray-500 hover:text-white"
					>
						<X size={14} />
					</button>

					<h4 className="font-bold text-lg text-white leading-tight mb-1">{selectedCause.name}</h4>
					<p className="text-xs text-gray-400 mb-4">{selectedCause.description}</p>

					<div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5 mb-4">
						<span className="text-xs text-gray-400">
							Raised (SOL)
						</span>

						<span className="text-blue-400 font-mono font-bold">
							{isLoadingPool
								? '…'
								: poolInfo
									? (poolInfo.totalDonated.toNumber() / LAMPORTS_PER_SOL).toString() // BN → string
									: '0'}
						</span>
					</div>
					<button
						onClick={() => setModalOpen(true)}
						className="w-full py-3 bg-[#2775CA] hover:bg-[#2775CA]/90 text-white font-bold rounded-lg transition-all text-sm shadow-[0_0_15px_rgba(39,117,202,0.4)] flex items-center justify-center gap-2"
					>
						<Wallet size={16} /> Donate
					</button>
				</div>
			)}

			<Globe
				ref={globeRef}
				width={dimensions.width}
				height={dimensions.height}
				backgroundColor="#000000"
				globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
				pointsData={points}
				pointLat={(d: any) => d.location.lat}
				pointLng={(d: any) => d.location.lng}
				pointAltitude={0.1}
				pointColor="color"
				pointRadius={0.8}
				onPointClick={(node: any) => {
					setSelectedCause(node);
					globeRef.current?.pointOfView({ lat: node.location.lat, lng: node.location.lng, altitude: 1.5 }, 1000);
				}}
			/>

			<div className="absolute bottom-2 left-2 text-[10px] text-gray-600 font-mono pointer-events-none flex items-center gap-2">
				<Zap size={10} className="text-[#14F195]" />
				<span>Solana Devnet</span>
				<span className="w-1 h-1 bg-gray-600 rounded-full" />
				<Zap size={10} className="text-blue-500" />
			</div>
		</div>
	);
}

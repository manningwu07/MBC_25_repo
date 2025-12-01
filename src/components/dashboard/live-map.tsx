/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef } from 'react';
import { Zap } from 'lucide-react';

const Globe: any = dynamic(() => import('react-globe.gl'), { ssr: false }) as any;

const ZONES = [
  { name: 'Sudan Relief', lat: 15, lng: 30 },
  { name: 'Turkey Quake', lat: 39, lng: 35 },
  { name: 'Ukraine Aid', lat: 49, lng: 31 },
  { name: 'Gaza Strip', lat: 31.5, lng: 34.5 },
];

export function LiveMap() {
  const globeRef = useRef<any>(null);
  const points = useMemo(
    () =>
      ZONES.map((z) => ({
        ...z,
        size: 0.45,
        color: '#14f195',
        label: z.name,
      })),
    []
  );

  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    const ctrl = g.controls();
    if (ctrl) {
      ctrl.autoRotate = true;
      ctrl.autoRotateSpeed = 0.45;
      ctrl.enableZoom = false;
    }
    g.pointOfView({ lat: 20, lng: 20, altitude: 2.3 }, 1000);
  }, []);

  return (
    <div className="w-full h-[400px] overflow-hidden rounded-3xl bg-[#080808] border border-white/10 relative">
      <div className="absolute top-4 left-6 z-20">
        <h3 className="text-white font-bold flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
          <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse shadow-[0_0_10px_#14f195]" />
          Active Zones
        </h3>
      </div>
      <Globe
        ref={globeRef}
        width={undefined}
        height={undefined}
        backgroundColor="#080808"
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-dark.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointAltitude="size"
        pointColor="color"
        pointLabel="label"
        atmosphereColor="#14f195"
        atmosphereAltitude={0.15}
        onGlobeReady={() => {
          const g = globeRef.current;
          if (!g) return;
          const ctrl = g.controls();
          if (ctrl) {
            ctrl.autoRotate = true;
            ctrl.enableZoom = false;
          }
        }}
      />
      <div className="absolute bottom-0 inset-x-0 p-3 border-t border-white/10 bg-black/70 backdrop-blur-sm flex justify-between items-center text-xs text-gray-400">
        <div className="flex gap-4 flex-wrap">
          {ZONES.map((z) => (
            <span key={z.name} className="flex items-center gap-1">
              <span className="w-1 h-1 bg-brand-green rounded-full" /> {z.name}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-brand-green">
          <Zap size={14} /> ~400ms dispatch
        </div>
      </div>
    </div>
  );
}
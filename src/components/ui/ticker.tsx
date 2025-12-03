// components/ui/ticker.tsx
'use client';

export function Ticker() {
  return (
    <div className="w-full bg-[#050505] border-t border-white/10 h-10 flex items-center overflow-hidden relative">
      <div className="absolute left-0 bg-[#050505] px-4 z-10 text-xs font-bold text-gray-500 h-full flex items-center">
        LIVE FEED
      </div>
      <div className="flex whitespace-nowrap animate-ticker">
         {/* Duplicate items for infinite scroll effect */}
         {[1,2,3,4].map(i => (
            <div key={i} className="flex items-center gap-8 px-4">
                <span className="text-xs text-gray-400">Anonymous donation: <span className="text-[#14F195] font-mono">+$10,003.12</span></span>
                <span className="text-xs text-gray-400">Gaza Relief Outflow: <span className="text-red-400 font-mono">-$3,900.00</span></span>
                <span className="text-xs text-gray-400">Ukraine Medical: <span className="text-[#14F195] font-mono">+$1,200.00</span></span>
                <span className="text-xs text-gray-400">System TPS: <span className="text-blue-400 font-mono">2,400</span></span>
            </div>
         ))}
      </div>
      <style jsx>{`
        @keyframes ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .animate-ticker {
            animation: ticker 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
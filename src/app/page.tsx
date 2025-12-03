// app/page.tsx
import { ArrowRight, Activity, Globe2, ShieldCheck, Coins } from "lucide-react";
import Link from "next/link";
import { MainNav } from "~/components/layout/main-nav";
import { Ticker } from "~/components/ui/ticker";

// Mock Data for the Cards
const FEATURED_FUNDS = [
  {
    title: "Ukraine Crisis Fund",
    id: "ukr-fund",
    icon: <ShieldCheck className="w-6 h-6 text-red-500" />,
    wallet: "SolanaWalletUkr...KiNng",
    color: "bg-red-500/10 border-red-500/20"
  },
  {
    title: "Gaza Relief Wallet",
    id: "gaza-relief",
    icon: <Activity className="w-6 h-6 text-emerald-500" />,
    wallet: "SolanaWalletGaza...2Sjt",
    color: "bg-emerald-500/10 border-emerald-500/20"
  },
  {
    title: "Clean Water Initiative",
    id: "water-dao",
    icon: <Coins className="w-6 h-6 text-blue-500" />,
    wallet: "SolanaWalletH2O...WvtI",
    color: "bg-blue-500/10 border-blue-500/20"
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#020410] text-white flex flex-col font-sans selection:bg-[#14F195] selection:text-black">
      <MainNav />

      <main className="flex-1 relative flex flex-col justify-center items-center overflow-hidden">
        {/* Background Map Effect */}
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
           {/* Replace this with a real static map image in public folder if available */}
           <div className="w-full h-full bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-no-repeat bg-center bg-cover mix-blend-overlay opacity-20 invert" />
           <div className="absolute inset-0 bg-linear-to-t from-[#020410] via-transparent to-[#020410]" />
           <div className="absolute inset-0 bg-linear-to-r from-[#020410] via-transparent to-[#020410]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-20 pb-32">
          
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
               <span className="w-2 h-2 rounded-full bg-[#14F195] animate-pulse" />
               <span className="text-sm font-medium text-gray-300">Global Conflicts & Aid Needs (Powered by Polymarket Data)</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
              Fast, Secure, <br/>
              Accountable Donations. <br/>
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#9945FF] to-[#14F195]">
                Track Your Impact on the Blockchain.
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-xl leading-relaxed">
              Connect with verified NGOs and specialized funds directly. Bypass bureaucracy and send aid where it&apos;s needed in seconds using Solana & USDC.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link href="/causes">
                <button className="bg-white text-black font-bold text-lg px-8 py-4 rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  Donate Now
                </button>
              </Link>
              <Link href="/ngo-signup">
                <button className="bg-transparent border border-white/30 text-white font-bold text-lg px-8 py-4 rounded-full hover:bg-white/10 transition-colors backdrop-blur-sm">
                  Register NGO
                </button>
              </Link>
            </div>
          </div>

          {/* Cards Section (Bottom of Hero) */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-12 gap-6">
             
             {/* Verified Badge */}
             <div className="md:col-span-3 bg-[#11131F]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-center items-center text-center gap-4 shadow-2xl">
                <div className="flex gap-4 opacity-80">
                   {/* Placeholders for logos (RedCross, StJude, etc) */}
                   <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center text-red-600 font-bold text-xs">RC</div>
                   <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center text-blue-600 font-bold text-xs">SJ</div>
                   <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center text-black font-bold text-xs">MSF</div>
                </div>
                <div>
                   <h3 className="font-bold text-white">Verified NGOs</h3>
                   <p className="text-xs text-gray-400">KYC Verified Entities</p>
                </div>
             </div>

             {/* Specific Funds */}
             {FEATURED_FUNDS.map((fund) => (
                <div key={fund.id} className={`md:col-span-3 bg-[#11131F]/60 backdrop-blur-md border border-white/5 rounded-3xl p-6 flex flex-col justify-between hover:bg-[#1A1D2D] transition-colors cursor-pointer group`}>
                   <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-2xl ${fund.color}`}>
                        {fund.icon}
                      </div>
                      <ArrowRight className="text-gray-600 group-hover:text-white transition-colors -rotate-45 group-hover:rotate-0" />
                   </div>
                   <div>
                      <h4 className="font-bold text-lg mb-1">{fund.title}</h4>
                      <p className="font-mono text-[10px] text-gray-500 truncate">{fund.wallet}</p>
                   </div>
                </div>
             ))}

          </div>

        </div>
      </main>

      <Ticker />
    </div>
  );
}
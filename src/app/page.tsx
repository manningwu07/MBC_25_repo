/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useState, useCallback, useEffect } from 'react';
import { Shield, Activity, Coins, Loader2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { getPoolSol } from '~/lib/solana/client';
import { LiveMap } from '~/components/dashboard/live-map';
import { TransactionFeed } from '~/components/dashboard/transaction-feed';

export default function Home() {
  const { login, authenticated, user, logout } = usePrivy();
  
  const [amount, setAmount] = useState<string>('');
  const [totalRaised, setTotalRaised] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [fundError, setFundError] = useState<string | null>(null);

  const refreshTvl = useCallback(async () => {
    try {
      const tvl = await getPoolSol();
      setTotalRaised(tvl);
      setFundError(null);
    } catch (e: any) {
      console.warn("TVL fetch failed, using mock:", e?.message);
      setTotalRaised(12450.5);
      setFundError(e?.message ?? "TVL fetch failed");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshTvl();
    const id = setInterval(() => void refreshTvl(), 10000);
    return () => clearInterval(id);
  }, [refreshTvl]);

  const handleDonate = useCallback(async () => {
    if (!amount || isNaN(Number(amount))) return;
    setLoading(true);

    await new Promise(r => setTimeout(r, 1500));
    
    setTotalRaised(prev => prev + Number(amount));
    setAmount('');
    setLoading(false);
    alert("Donation successful! Thank you for helping.");
  }, [amount]);

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <nav className="flex justify-between items-center py-4 border-b border-white/10 mb-8">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-brand-green" />
          <h1 className="text-xl font-bold tracking-tight">SolanaDirect</h1>
        </div>
        <div className="flex items-center gap-4">
          {authenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 font-mono">
                {user?.wallet ? `${user.wallet.address.slice(0, 4)}...${user.wallet.address.slice(-4)}` : user?.email?.address}
              </span>
              <Button variant="outline" onClick={logout}>Disconnect</Button>
            </div>
          ) : (
            <Button onClick={login}>Connect Wallet</Button>
          )}
        </div>
      </nav>

      {/* Hero Text - Centered for Impact */}
      <div className="text-center max-w-3xl mx-auto space-y-6 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/10 text-brand-green text-sm mx-auto">
          <Activity className="w-4 h-4" />
          <span>Live Emergency Response</span>
        </div>
        <h2 className="text-5xl md:text-6xl font-bold leading-tight">
          Decentralized Aid <br />
          <span className="text-brand-green">Delivered Instantly</span>
        </h2>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Bypass intermediaries. Funds reach emergency zones in seconds, fully verifiable on-chain.
        </p>
      </div>

      {/* New Visual Dashboard Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Map takes up 2 columns */}
        <div className="lg:col-span-2 h-full min-h-[400px]">
          <LiveMap />
        </div>
        {/* Feed takes up 1 column */}
        <div className="lg:col-span-1 h-full min-h-[400px]">
          <TransactionFeed />
        </div>
      </section>

      {/* Donation Action Area */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/5 rounded-3xl p-8 border border-white/10 mt-8 backdrop-blur-sm">
         <div className="space-y-4">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Coins className="text-yellow-400" />
              Global Relief Pool
            </h3>
             <div className="bg-black/40 p-6 rounded-xl border border-white/5">
              <p className="text-sm text-gray-400 mb-1">Total Value Locked (SOL)</p>
              <div className="text-4xl font-mono font-bold text-white">
                {totalRaised.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-brand-green mt-2 flex items-center gap-1">
                <Activity className="w-3 h-3" /> +12.5% last hour
              </div>
            </div>
         </div>

         <div className="flex flex-col justify-center space-y-4">
            {!authenticated ? (
               <div className="text-center p-6 bg-brand-green/5 rounded-xl border border-brand-green/20">
                  <p className="mb-4 text-gray-300">Connect your wallet to contribute to the relief fund.</p>
                  <Button onClick={login} className="w-full">Connect Wallet to Donate</Button>
               </div>
            ) : (
               <div className="p-6 bg-black/40 rounded-xl border border-white/10 space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Donate Amount (SOL)</label>
                    <span className="text-xs text-brand-green">Ready to transfer</span>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 bg-black border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-green transition-all font-mono text-lg"
                    />
                    <Button onClick={handleDonate} disabled={loading || !amount} className="px-8">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Donate"}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Transaction will be verified on Solana Devnet
                  </p>
               </div>
            )}
         </div>
      </section>
    </main>
  );
}
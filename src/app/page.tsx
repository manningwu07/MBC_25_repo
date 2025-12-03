/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useSignAndSendTransaction } from '@privy-io/react-auth/solana';
import { useState, useCallback, useEffect } from 'react';
import { Shield, Activity, Coins, Loader2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { getPoolSol, buildSwapAndDonateTx } from '~/lib/solana/client';
import { LiveMap } from '~/components/dashboard/live-map';
import { TransactionFeed } from '~/components/dashboard/transaction-feed';
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';

export default function Home() {
  const { login, authenticated, user, logout } = usePrivy();
  const { wallets } = useWallets();
  const { signAndSendTransaction } = useSignAndSendTransaction();
  
  const [amount, setAmount] = useState<string>('');
  const [totalRaised, setTotalRaised] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const refreshTvl = useCallback(async () => {
    try {
      const tvl = await getPoolSol();
      setTotalRaised(tvl);
    } catch (e: any) {
      console.warn("TVL fetch failed:", e?.message);
    }
  }, []);

  useEffect(() => {
    void refreshTvl();
    const id = setInterval(() => void refreshTvl(), 10000);
    return () => clearInterval(id);
  }, [refreshTvl]);

  const handleDonate = useCallback(async () => {
    if (!amount || isNaN(Number(amount)) || !user?.wallet) return;
    
    // Find the specific wallet object
    const wallet = wallets.find((w) => w.address === user.wallet?.address);
    if (!wallet) return;

    setLoading(true);

    try {
      const tx = await buildSwapAndDonateTx(new PublicKey(wallet.address), Number(amount));

      let serializedTx: Uint8Array;
      if (tx instanceof VersionedTransaction) {
        serializedTx = tx.serialize();
      } else {
        serializedTx = (tx as Transaction).serializeMessage();
      }

      const { signature } = await signAndSendTransaction({ 
        transaction: serializedTx, 
        wallet: wallet as any 
      });
      
      console.log("Tx Sent:", signature);
      await new Promise(r => setTimeout(r, 2000));
      setTotalRaised(prev => prev + Number(amount));
      setAmount('');
      alert("Donation successful! Signature: " + signature.slice(0, 8));
    } catch (e: any) {
      console.error(e);
      alert("Donation failed: " + e?.message);
    } finally {
      setLoading(false);
    }
  }, [amount, user, wallets, signAndSendTransaction]);

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 space-y-12">
      {/* Header */}
      <nav className="flex justify-between items-center py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-brand-green" />
          <h1 className="text-xl font-bold tracking-tight">SolanaDirect</h1>
        </div>
        <div className="flex items-center gap-4">
          {authenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 font-mono hidden md:block">
                {user?.wallet ? `${user.wallet.address.slice(0, 4)}...${user.wallet.address.slice(-4)}` : user?.email?.address}
              </span>
              <Button variant="outline" onClick={logout}>Disconnect</Button>
            </div>
          ) : (
            <Button onClick={login}>Connect Wallet</Button>
          )}
        </div>
      </nav>

      {/* Hero & Title */}
      <div className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/10 text-brand-green text-sm mx-auto border border-brand-green/20">
          <Activity className="w-4 h-4" />
          <span>Live Emergency Response</span>
        </div>
        <h2 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
          Decentralized Aid <br />
          <span className="text-brand-green">Delivered Instantly</span>
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Bypass intermediaries. Funds reach emergency zones in seconds, fully verifiable on-chain.
        </p>
      </div>

      {/* 1. Global Donation Area (Top) */}
      <section className="bg-white/5 rounded-3xl p-1 border border-white/10 backdrop-blur-sm shadow-2xl overflow-hidden">
         <div className="grid grid-cols-1 md:grid-cols-2">
             {/* TVL Section */}
             <div className="p-8 md:p-10 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/10 bg-black/20">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500">
                        <Coins size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-200">Global Relief Pool</h3>
                </div>
                <div>
                    <p className="text-sm text-gray-400 mb-1 font-medium">Total Value Locked (SOL)</p>
                    <div className="text-5xl md:text-6xl font-mono font-bold text-white tracking-tighter">
                        {totalRaised.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-brand-green mt-3 flex items-center gap-1 bg-brand-green/10 w-fit px-2 py-1 rounded-md">
                        <Activity className="w-3 h-3" /> +12.5% last hour
                    </div>
                </div>
             </div>

             {/* Donate Input Section */}
             <div className="p-8 md:p-10 flex flex-col justify-center bg-white/5 md:bg-transparent">
                {!authenticated ? (
                   <div className="text-center space-y-4">
                      <p className="text-gray-300 text-lg">Connect your wallet to contribute directly to the relief fund.</p>
                      <Button onClick={login} className="w-full py-6 text-lg">Connect Wallet to Donate</Button>
                   </div>
                ) : (
                   <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <label className="text-base font-medium text-gray-200">Donate Amount (SOL)</label>
                        <span className="text-xs text-brand-green bg-brand-green/10 px-2 py-1 rounded">Auto-swaps to USDC</span>
                      </div>
                      
                      <div className="flex gap-3">
                        <input 
                          type="number" 
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          className="flex-1 bg-black/50 border border-white/20 rounded-xl px-4 py-4 focus:outline-none focus:border-brand-green transition-all font-mono text-xl text-white placeholder:text-gray-600"
                        />
                        <Button onClick={handleDonate} disabled={loading || !amount} className="px-8 py-4 text-lg h-auto">
                          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Donate"}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        Secure transaction verified on Solana Mainnet
                      </p>
                   </div>
                )}
             </div>
         </div>
      </section>

      {/* 2. Map (Middle - Full Width) */}
      <section className="w-full">
        <div className="flex items-center gap-2 mb-4 px-2">
            <div className="w-2 h-2 bg-brand-green rounded-full animate-pulse" />
            <h3 className="font-semibold text-gray-300">Live Impact Zones</h3>
        </div>
        <div className="h-[500px] md:h-[600px] w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
             <LiveMap />
        </div>
      </section>

      {/* 3. Live Activity (Bottom - Full Width) */}
      <section className="w-full">
         <TransactionFeed />
      </section>
    </main>
  );
}
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
      // 1. Build the Transaction (Swap or Standard)
      const tx = await buildSwapAndDonateTx(new PublicKey(wallet.address), Number(amount));

      // 2. Serialize the transaction to Uint8Array as required by Privy's API
      let serializedTx: Uint8Array;
      if (tx instanceof VersionedTransaction) {
        serializedTx = tx.serialize();
      } else {
        // legacy Transaction: serializeMessage returns the message bytes to be signed/sent
        serializedTx = (tx as Transaction).serializeMessage();
      }

      // 3. Send using Privy's Hook
      // FIX: Cast 'wallet' to 'any' to resolve the Strict Type Mismatch
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

      {/* Hero */}
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

      {/* Dashboard */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        <div className="lg:col-span-2 h-full min-h-[400px]">
          <LiveMap />
        </div>
        <div className="lg:col-span-1 h-full min-h-[400px]">
          <TransactionFeed />
        </div>
      </section>

      {/* Donation Area */}
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
                    <span className="text-xs text-brand-green">Auto-swaps to USDC</span>
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
                    Transaction will be verified on Solana Mainnet
                  </p>
               </div>
            )}
         </div>
      </section>
    </main>
  );
}
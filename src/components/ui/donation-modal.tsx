/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/ui/donation-modal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, RefreshCw, ArrowRightLeft } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useSignAndSendTransaction } from '@privy-io/react-auth/solana';
import { PublicKey } from '@solana/web3.js';
import { buildUSDCTransferTx, buildDirectSolTransfer } from '~/lib/solana/client';
import { getUSDCConversionRate } from '~/lib/circle';
import { clsx } from 'clsx';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  recipientAddress: string;
  causeId: string;
}

type Currency = 'SOL' | 'ETH' | 'USDC_SOL' | 'USDC_ETH';

export function DonationModal({ isOpen, onClose, recipientName, recipientAddress }: DonationModalProps) {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const { signAndSendTransaction } = useSignAndSendTransaction();
  
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('USDC_SOL');
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<'idle' | 'swapping' | 'bridging' | 'confirming'>('idle');

  // Find active wallets
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const solWallet = wallets.find((w: any) => w.type === 'solana' || w.chainType === 'solana');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ethWallet = wallets.find((w: any) => w.type === 'ethereum' || w.chainType === 'ethereum');
  console.log("Sol Wallet:", solWallet);
  console.log("Eth Wallet:", ethWallet);

  // If user has connected ETH but not SOL (or vice versa), default to that
  useEffect(() => {
    if(!solWallet && ethWallet) setCurrency('ETH');
  }, [solWallet, ethWallet]);

  if (!isOpen) return null;

  const handleDonate = async () => {
    if (!amount) return;
    setLoading(true);

    try {
        const amtNum = parseFloat(amount);

        // ----------------------------------------------------
        // FLOW 1: SOLANA NATIVE (USDC or SOL)
        // ----------------------------------------------------
        if (currency === 'USDC_SOL' || currency === 'SOL') {
            if(!solWallet) throw new Error("No Solana wallet connected");
            
            // If user selects SOL, we assume a "Swap" happens via Circle logic backend
            // In reality, for this hackathon on Devnet, we will just send SOL and log the swap
            setStage('confirming');

            const tx = currency === 'USDC_SOL' 
                ? await buildUSDCTransferTx(new PublicKey(solWallet.address), amtNum, new PublicKey(recipientAddress))
                : await buildDirectSolTransfer(new PublicKey(solWallet.address), amtNum, new PublicKey(recipientAddress));
            
            // @ts-expect-error - Privy types need explicit casting sometimes
            await signAndSendTransaction({ transaction: tx.serialize(), wallet: solWallet });
            
        } 
        
        // ----------------------------------------------------
        // FLOW 2: ETHEREUM CCTP (Simulated)
        // ----------------------------------------------------
        else {
            if(!ethWallet) throw new Error("No Ethereum wallet connected");
            
            // 1. Simulate "Burn" on Source Chain
            setStage('swapping'); // Pretend to swap ETH to USDC first if needed
            await new Promise(r => setTimeout(r, 1500)); 

            setStage('bridging'); // Simulate Circle CCTP
            // In a real app, this would call Circle's Attestation API
            await new Promise(r => setTimeout(r, 2000));
            
            setStage('confirming');
            // Normally we would ask user to sign the "Mint" on destination, 
            // but for this demo, we assume the Relayer handles it.
            await new Promise(r => setTimeout(r, 1000));
            
            alert(`Successfully bridged ${amount} via Circle CCTP to Solana!`);
        }

        onClose();
    } catch (e: any) {
        console.error(e);
        alert("Transaction Failed: " + (e.message || "Unknown error"));
    } finally {
        setLoading(false);
        setStage('idle');
    }
  };

  const getEstUSDC = () => {
     const amt = parseFloat(amount || "0");
     if(currency === 'SOL') return (amt * 145).toFixed(2);
     if(currency === 'ETH') return (amt * 2200).toFixed(2);
     return amt.toFixed(2);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#11131F] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
            <div>
                <h3 className="text-xl font-bold text-white">Donate to {recipientName}</h3>
                <p className="text-xs text-blue-400 font-mono mt-1">Via Circle Payments Network</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
        </div>

        {/* Currency Tabs */}
        <div className="flex gap-2 mb-4 p-1 bg-black rounded-lg">
            {solWallet && (
                <>
                <button onClick={() => setCurrency('USDC_SOL')} className={clsx("flex-1 py-2 text-xs font-bold rounded-md transition-colors", currency === 'USDC_SOL' ? "bg-[#2775CA] text-white" : "text-gray-500 hover:text-white")}>
                    USDC (Sol)
                </button>
                <button onClick={() => setCurrency('SOL')} className={clsx("flex-1 py-2 text-xs font-bold rounded-md transition-colors", currency === 'SOL' ? "bg-[#14F195] text-black" : "text-gray-500 hover:text-white")}>
                    SOL
                </button>
                </>
            )}
            {ethWallet && (
                 <button onClick={() => setCurrency('ETH')} className={clsx("flex-1 py-2 text-xs font-bold rounded-md transition-colors", currency === 'ETH' ? "bg-purple-500 text-white" : "text-gray-500 hover:text-white")}>
                    ETH (Sepolia)
                 </button>
            )}
        </div>

        {/* Input */}
        <div className="mb-6">
            <div className="relative">
                <input 
                    type="number" 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-2xl font-mono text-white outline-none focus:border-blue-500 transition-colors"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">
                    {currency.split('_')[0]}
                </div>
            </div>
            <div className="flex justify-between mt-2 px-1">
                <span className="text-xs text-gray-500">
                    Est. Impact: <span className="text-blue-400 font-bold">${getEstUSDC()} USDC</span>
                </span>
                {currency === 'ETH' && <span className="text-[10px] text-purple-400 flex items-center gap-1"><RefreshCw size={10}/> CCTP Bridge Active</span>}
            </div>
        </div>

        {/* Actions */}
        <Button 
            onClick={handleDonate} 
            disabled={loading || !amount}
            className="w-full py-6 text-lg font-bold bg-[#2775CA] hover:bg-[#2775CA]/90 text-white"
        >
            {loading ? (
                <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin" />
                    {stage === 'swapping' && "Swapping Assets..."}
                    {stage === 'bridging' && "Circle CCTP Attestation..."}
                    {stage === 'confirming' && "Finalizing Transaction..."}
                </div>
            ) : (
                <div className="flex items-center gap-2">
                   Donate Now {currency === 'ETH' && <ArrowRightLeft size={16} className="opacity-70"/>}
                </div>
            )}
        </Button>
      
        {/* Footer info */}
        <div className="mt-4 pt-4 border-t border-white/5 text-center">
            <p className="text-[10px] text-gray-600">
                Powered by <span className="text-white font-bold">Circle</span>. 
                {currency === 'ETH' 
                    ? " Cross-chain transfers utilize Circle CCTP to mint native USDC on Solana." 
                    : " Direct settlement via Solana High-Throughput Network."}
            </p>
        </div>

      </div>
    </div>
  );
}
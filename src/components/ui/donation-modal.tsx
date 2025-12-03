/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ui/donation-modal.tsx
'use client';

import { useState } from 'react';
import { X, Loader2, Coins, AlertOctagon } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useSignAndSendTransaction } from '@privy-io/react-auth/solana';
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { buildSwapAndDonateTx, buildDonateTx } from '~/lib/solana/client';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  recipientAddress: string;
  isPool: boolean; // TRUE = Smart Contract Pool, FALSE = Direct Wallet
}

export function DonationModal({ isOpen, onClose, recipientName, recipientAddress, isPool }: DonationModalProps) {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const { signAndSendTransaction } = useSignAndSendTransaction();
  
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<"input" | "confirm" | "double-confirm">("input");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Mock SOL price for the >$100 check
  const SOL_PRICE_USD = 200; 

  const handleNext = () => {
    if (!amount) return;
    const valUsd = Number(amount) * SOL_PRICE_USD;
    
    // Logic: If > $100, go to double confirm
    if (valUsd > 100) {
        setStep("double-confirm");
    } else {
        setStep("confirm");
    }
  };

  const executeDonation = async () => {
    const wallet = wallets.find((w) => w.address === user?.wallet?.address);
    if (!wallet) return;

    setLoading(true);
    try {
      let tx;
      const amountNum = Number(amount);

      if (isPool) {
        // Use the Swap logic for Pool (SOL -> USDC -> Pool)
        tx = await buildSwapAndDonateTx(new PublicKey(wallet.address), amountNum);
      } else {
        // Direct Transfer (SOL -> NGO Wallet directly)
        // You need to update `lib/solana/client.ts` to expose `buildDonateTx` which does a simple SystemProgram.transfer
        // We will assume `recipientAddress` is a valid public key
        tx = await buildDonateTx(new PublicKey(wallet.address), amountNum, new PublicKey(recipientAddress));
      }
      
      // Serialize and Send
      let serializedTx: Uint8Array;
      if (tx instanceof VersionedTransaction) {
        serializedTx = tx.serialize();
      } else {
        serializedTx = (tx as Transaction).serializeMessage();
      }

      await signAndSendTransaction({ transaction: serializedTx, wallet: wallet as any });
      alert("Donation sent successfully!");
      onClose();
    } catch (e: any) {
      console.error(e);
      alert("Transaction failed: " + e.message);
    } finally {
      setLoading(false);
      setStep("input");
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-[#11131F] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#14F195]/10 rounded-full text-[#14F195]"><Coins size={24} /></div>
          <div>
            <h3 className="text-xl font-bold text-white">
                {isPool ? "Donate to Regional Pool" : "Direct Transfer"}
            </h3>
            <p className="text-sm text-gray-400">Recipient: <span className="text-white">{recipientName}</span></p>
          </div>
        </div>

        {step === "input" && (
            <div className="space-y-4">
                <div>
                    <label className="text-sm text-gray-300 mb-1 block">Amount (SOL)</label>
                    <input 
                        type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00" autoFocus
                        className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white text-lg font-mono outline-none focus:border-[#14F195]"
                    />
                    <p className="text-xs text-gray-500 mt-2 text-right">≈ ${(Number(amount || 0) * SOL_PRICE_USD).toFixed(2)} USD</p>
                </div>
                <Button onClick={handleNext} className="w-full py-4 bg-[#14F195] text-black font-bold">Review Donation</Button>
            </div>
        )}

        {step === "confirm" && (
             <div className="space-y-4 text-center">
                <p className="text-gray-300">Sending <span className="text-[#14F195] font-bold">{amount} SOL</span> to {recipientName}.</p>
                <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => setStep("input")} className="flex-1">Back</Button>
                    <Button onClick={executeDonation} disabled={loading} className="flex-1 bg-[#14F195] text-black font-bold">
                        {loading ? <Loader2 className="animate-spin" /> : "Confirm"}
                    </Button>
                </div>
             </div>
        )}

        {step === "double-confirm" && (
            <div className="space-y-4 bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-center">
                <AlertOctagon className="w-10 h-10 text-red-500 mx-auto" />
                <h4 className="text-lg font-bold text-red-500">Large Amount Warning</h4>
                <p className="text-sm text-gray-300">
                    You are about to donate <b>{amount} SOL</b> (~${(Number(amount) * SOL_PRICE_USD).toFixed(2)}). 
                    This is a large transaction.
                </p>
                <p className="text-xs text-gray-500">Please confirm you verify the recipient address: {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}</p>
                
                <div className="flex gap-3 mt-4">
                    <Button variant="ghost" onClick={() => setStep("input")} className="flex-1">Cancel</Button>
                    <Button onClick={executeDonation} disabled={loading} className="flex-1 bg-red-500 text-white font-bold hover:bg-red-600">
                        {loading ? <Loader2 className="animate-spin" /> : "I am sure"}
                    </Button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { X, Loader2, Coins } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useSignAndSendTransaction } from '@privy-io/react-auth/solana';
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { buildSwapAndDonateTx } from '~/lib/solana/client';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  walletAddress: string; // The specific NGO/Sub-wallet
}

export function DonationModal({ isOpen, onClose, recipientName, walletAddress }: DonationModalProps) {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const { signAndSendTransaction } = useSignAndSendTransaction();
  
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDonate = async () => {
    if (!amount || isNaN(Number(amount)) || !user?.wallet) return;
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

      await signAndSendTransaction({ transaction: serializedTx, wallet: wallet as any });
      alert("Donation sent!");
      onClose();
    } catch (e: any) {
      console.error(e);
      alert("Failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#11131F] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#14F195]/10 rounded-full text-[#14F195]">
            <Coins size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Donate to {recipientName}</h3>
            <p className="text-xs font-mono text-gray-400">{walletAddress.slice(0, 6)}...{walletAddress.slice(-6)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Amount (SOL)</label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#14F195] outline-none font-mono text-lg"
            />
          </div>

          <Button 
            onClick={handleDonate} 
            disabled={loading || !amount}
            className="w-full py-6 text-lg bg-[#14F195] text-black font-bold hover:bg-[#14F195]/90"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Confirm Donation"}
          </Button>
          
          <p className="text-center text-xs text-gray-500">
            Funds are routed directly to the verified smart contract wallet for this cause.
          </p>
        </div>
      </div>
    </div>
  );
}
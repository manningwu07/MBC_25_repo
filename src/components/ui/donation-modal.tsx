/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, ArrowRightLeft, CheckCircle2, ExternalLink, AlertTriangle } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useSignAndSendTransaction } from '@privy-io/react-auth/solana';
import { useSendTransaction } from '@privy-io/react-auth';
import { PublicKey } from '@solana/web3.js';
import { buildUSDCTransferTx, buildDirectSolTransfer } from '~/lib/solana/client';
import { clsx } from 'clsx';
import { initiateCCTPBridge, pollForAttestation } from '~/lib/circle';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  recipientAddress: string;
  causeId: string;
}

type Currency = 'SOL' | 'ETH' | 'USDC_SOL';

export function DonationModal({ isOpen, onClose, recipientName, recipientAddress }: DonationModalProps) {
  const { connectWallet } = usePrivy();
  const { wallets } = useWallets();
  const { signAndSendTransaction: signSolana } = useSignAndSendTransaction();
  const { sendTransaction: sendEther } = useSendTransaction();
  
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('USDC_SOL');
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<'idle' | 'swapping' | 'bridging' | 'confirming' | 'success'>('idle');
  const [txHash, setTxHash] = useState<string>("");
  const [bridgeStep, setBridgeStep] = useState<string>("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const solWallet = wallets.find((w: any) => w.chainType === 'solana' || w.type == 'solana');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ethWallet = wallets.find((w: any) => w.chainType === 'ethereum' || w.type == 'ethereum');

  console.log("Donate Solana Wallet", solWallet);
  console.log("Donate Ethereum Wallet", ethWallet);
  console.log("Donate Wallets", wallets);

  useEffect(() => {
    if (!solWallet && ethWallet && !currency.includes('ETH')) {
        setCurrency('ETH');
    }
  }, [solWallet, ethWallet, currency]);

  if (!isOpen) return null;

  const handleClose = () => {
    setStage('idle');
    setTxHash("");
    setAmount("");
    setBridgeStep("");
    onClose();
  }

  const handleDonate = async () => {
    if (!amount) return;
    setLoading(true);
    setTxHash("");
    setBridgeStep("");

    try {
        const amtNum = parseFloat(amount);
        let signature = "";

        // ------------------------------------
        // FLOW 1: SOLANA NATIVE
        // ------------------------------------
        if (currency === 'USDC_SOL' || currency === 'SOL') {
            if(!solWallet) throw new Error("Please connect a Solana wallet.");
            setStage('confirming');

            if (!recipientAddress || recipientAddress.length < 32) throw new Error("Invalid recipient address.");
            const fromPubkey = new PublicKey(solWallet.address);
            const toPubkey = new PublicKey(recipientAddress);

            const tx = currency === 'USDC_SOL' 
                ? await buildUSDCTransferTx(fromPubkey, amtNum, toPubkey)
                : await buildDirectSolTransfer(fromPubkey, amtNum, toPubkey);
            // @ts-expect-error Privy types vary
            const receipt = await signSolana({ transaction: tx, wallet: solWallet });
            // @ts-expect-error Privy types vary
            signature = receipt.signature || receipt; 
        } 
        
        // ------------------------------------
        // FLOW 2: REAL CIRCLE CCTP (Sepolia -> Solana)
        // ------------------------------------
        else {
            if(!ethWallet) throw new Error("Please connect an Ethereum wallet.");
            
            setStage('confirming');
            setBridgeStep("Sign transaction to Burn USDC on Sepolia...");
            
            const burnTxHash = await initiateCCTPBridge(
                ethWallet, 
                sendEther, 
                amtNum, 
                recipientAddress 
            );

            setTxHash(burnTxHash);
            setBridgeStep("USDC Burned. Waiting for Circle Attestation...");
            setStage('bridging');

            await pollForAttestation(burnTxHash);
            
            setBridgeStep("Attestation verified via Circle Iris.");
            signature = burnTxHash; 
        }

        setTxHash(signature);
        setStage('success');

    } catch (e: any) {
        console.error("Donation Error:", e);
        const msg = e.message || "Transaction failed";
        alert(msg.includes("rejected") ? "Transaction cancelled." : "Error: " + msg);
    } finally {
        setLoading(false);
    }
  };

  if (stage === 'success') {
    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="bg-[#11131F] border border-[#14F195]/30 w-full max-w-md rounded-2xl p-8 shadow-2xl text-center animate-in zoom-in-95 duration-200">
                <div className="w-20 h-20 bg-[#14F195]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} className="text-[#14F195]" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Donation Sent!</h2>
                <p className="text-gray-400 mb-6">
                    {currency === 'ETH' 
                        ? "USDC Burned on Sepolia & Verified by Circle Iris API." 
                        : "Funds transferred on Solana Devnet."}
                </p>
                <div className="bg-black/50 p-4 rounded-xl border border-white/10 mb-6 text-left">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Transaction Hash</p>
                    <div className="flex items-center justify-between">
                        <code className="text-[#14F195] text-xs font-mono truncate max-w-[250px]">{txHash}</code>
                        <a 
                             href={currency === 'ETH' ? `https://sepolia.etherscan.io/tx/${txHash}` : `https://explorer.solana.com/tx/${txHash}?cluster=devnet`}
                            target="_blank" rel="noreferrer"
                            className="text-gray-400 hover:text-white"
                        >
                            <ExternalLink size={14}/>
                        </a>
                    </div>
                </div>
                <Button onClick={handleClose} className="w-full bg-[#14F195] text-black font-bold">Close</Button>
            </div>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#11131F] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        
        <div className="flex justify-between items-start mb-6">
            <div>
                <h3 className="text-xl font-bold text-white">Donate to {recipientName}</h3>
                <p className="text-xs text-blue-400 font-mono mt-1">Via Circle CCTP & Solana</p>
            </div>
            <button onClick={handleClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
        </div>

        <div className="flex gap-2 mb-4 p-1 bg-black rounded-lg">
            {/* Show all buttons, disable if wallet missing but user can click to switch logic */}
            <button 
                onClick={() => setCurrency('USDC_SOL')} 
                className={clsx("flex-1 py-2 text-xs font-bold rounded-md transition-colors", currency === 'USDC_SOL' ? "bg-[#2775CA] text-white" : "text-gray-500 hover:text-white", !solWallet && currency !== 'USDC_SOL' && "opacity-50")}
            >
                USDC (Sol)
            </button>
            <button 
                onClick={() => setCurrency('SOL')} 
                className={clsx("flex-1 py-2 text-xs font-bold rounded-md transition-colors", currency === 'SOL' ? "bg-[#14F195] text-black" : "text-gray-500 hover:text-white", !solWallet && currency !== 'SOL' && "opacity-50")}
            >
                SOL
            </button>
            <button 
                onClick={() => setCurrency('ETH')} 
                className={clsx("flex-1 py-2 text-xs font-bold rounded-md transition-colors", currency === 'ETH' ? "bg-purple-500 text-white" : "text-gray-500 hover:text-white", !ethWallet && currency !== 'ETH' && "opacity-50")}
            >
                ETH
            </button>
        </div>

        {/* --- DYNAMIC WARNINGS --- */}
        {currency.includes('SOL') && !solWallet && (
            <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex gap-3 cursor-pointer" onClick={connectWallet}>
                <AlertTriangle className="text-yellow-400 shrink-0" size={16} />
                <p className="text-[10px] text-yellow-200">
                    Solana wallet missing. Click here to connect.
                </p>
            </div>
        )}

        {currency === 'ETH' && !ethWallet && (
             <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex gap-3 cursor-pointer" onClick={connectWallet}>
                <AlertTriangle className="text-yellow-400 shrink-0" size={16} />
                <p className="text-[10px] text-yellow-200">
                    Ethereum wallet missing. Click here to connect.
                </p>
            </div>
        )}

        {currency === 'ETH' && ethWallet && (
            <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg flex gap-3">
                <AlertTriangle className="text-purple-400 shrink-0" size={16} />
                <p className="text-[10px] text-purple-200">
                    Bridging <b>USDC</b> from Sepolia. Requires USDC + ETH for gas.
                </p>
            </div>
        )}

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
                    {currency.includes('USDC') || currency === 'ETH' ? 'USDC' : 'SOL'}
                </div>
            </div>
        </div>

        <Button 
            onClick={handleDonate} 
            disabled={loading || !amount}
            className={clsx("w-full py-6 text-lg font-bold text-white transition-all", currency === 'ETH' ? "bg-purple-600 hover:bg-purple-500" : "bg-[#2775CA] hover:bg-[#2775CA]/90")}
        >
            {loading ? (
                <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={18} />
                        Processing...
                    </div>
                    {bridgeStep && <span className="text-[10px] font-normal opacity-80">{bridgeStep}</span>}
                </div>
            ) : (
                <div className="flex items-center gap-2">
                   {currency === 'ETH' ? "Bridge via CCTP" : "Donate Now"} 
                   {currency === 'ETH' && <ArrowRightLeft size={16} className="opacity-70"/>}
                </div>
            )}
        </Button>
      </div>
    </div>
  );
}
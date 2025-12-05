'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  CheckCircle2,
  ExternalLink,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Button } from '~/components/ui/button';
import { clsx } from 'clsx';
import { donateToPool } from '~/lib/solana/donate';

// Solana
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

// Ethereum - wagmi v3
import {
  useAccount,
  useConnect,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { parseEther } from 'viem';
import { injected } from 'wagmi/connectors';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  poolId: number;
}

type Currency = 'SOL' | 'ETH';

const ETH_TREASURY = '0xadf16E45c5e5F5716CEC24b38D0194B1a4cf4B64' as const; 

export function DonationModal({
  isOpen,
  onClose,
  recipientName,
  poolId,
}: DonationModalProps) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('SOL');
  const [stage, setStage] = useState<'idle' | 'confirming' | 'success'>(
    'idle'
  );
  const [txHash, setTxHash] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Solana
  const {
    publicKey,
    signTransaction,
    signAllTransactions,
    connected: solConnected,
  } = useWallet();
  const { setVisible: setSolModalVisible } = useWalletModal();

  // Ethereum - wagmi v3
  const { address: ethAddress, isConnected: ethConnected } = useAccount();
  const { connect } = useConnect();
  const {
    sendTransaction,
    isPending: isEthPending,
    data: ethTxHash,
    error: ethError,
    reset: resetEthTx,
  } = useSendTransaction();

  // Wait for ETH transaction receipt
  const { isLoading: isEthConfirming, isSuccess: isEthConfirmed } =
    useWaitForTransactionReceipt({
      hash: ethTxHash,
    });

  // Handle ETH transaction success
  useEffect(() => {
    if (isEthConfirmed && ethTxHash && stage === 'confirming') {
      setTxHash(ethTxHash);
      setStage('success');
      setIsProcessing(false);
    }
  }, [isEthConfirmed, ethTxHash, stage]);

  // Handle ETH transaction error
  useEffect(() => {
    if (ethError) {
      console.error('ETH Transaction Error:', ethError);
      setStage('idle');
      setIsProcessing(false);
      alert(
        'Transaction failed: ' +
          (ethError.message.includes('rejected')
            ? 'Transaction rejected by user'
            : ethError.message)
      );
      resetEthTx();
    }
  }, [ethError, resetEthTx]);

  if (!isOpen) return null;

  const handleClose = () => {
    setStage('idle');
    setTxHash('');
    setAmount('');
    setStatusMsg('');
    setIsProcessing(false);
    resetEthTx();
    onClose();
  };

  const handleDonate = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    setStatusMsg('');
    setIsProcessing(true);

    try {
      const amtNum = parseFloat(amount);

      // ============================================
      // SOLANA: SOL Donation to Pool via Smart Contract
      // ============================================
      if (currency === 'SOL') {
        if (!publicKey || !signTransaction || !signAllTransactions) {
          throw new Error('Please connect your Phantom wallet first.');
        }

        setStage('confirming');
        setStatusMsg('Please approve the transaction in your wallet...');

        const sig = await donateToPool(
          {
            publicKey,
            signTransaction,
            signAllTransactions,
          },
          poolId,
          amtNum
        );

        setStatusMsg('Transaction confirmed!');
        setTxHash(sig);
        setStage('success');
        setIsProcessing(false);
      }
      // ============================================
      // ETHEREUM: Send ETH to treasury for conversion
      // In production: Backend would swap ETH→SOL and call smart contract
      // ============================================
      else if (currency === 'ETH') {
        if (!ethAddress) {
          throw new Error('Please connect your Ethereum wallet first.');
        }

        setStage('confirming');
        setStatusMsg(
          'Please approve the transaction (ETH will be converted to SOL)'
        );

        // Send ETH to treasury - in production this triggers a swap
        sendTransaction({
          to: ETH_TREASURY,
          value: parseEther(amtNum.toString()),
        });
      }
    } catch (e: unknown) {
      console.error('Donation Error:', e);
      const msg = e instanceof Error ? e.message : 'Transaction failed';

      if (
        msg.toLowerCase().includes('rejected') ||
        msg.toLowerCase().includes('denied')
      ) {
        alert('Transaction cancelled by user.');
      } else {
        alert('Error: ' + msg);
      }

      setStage('idle');
      setIsProcessing(false);
    }
  };

  // ============================================
  // SUCCESS SCREEN
  // ============================================
  if (stage === 'success') {
    const explorerUrl =
      currency === 'ETH'
        ? `https://sepolia.etherscan.io/tx/${txHash}`
        : `https://explorer.solana.com/tx/${txHash}?cluster=devnet`;

    return (
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
        <div className="w-full max-w-md rounded-2xl border border-[#14F195]/30 bg-[#11131F] p-8 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#14F195]/10">
            <CheckCircle2 size={40} className="text-[#14F195]" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white">Donation Sent!</h2>
          <p className="mb-6 text-gray-400">
            {currency === 'ETH'
              ? 'ETH received! It will be converted to SOL and deposited to the relief pool.'
              : 'SOL deposited to the relief pool on Solana Devnet.'}
          </p>
          <div className="mb-6 rounded-xl border border-white/10 bg-black/50 p-4 text-left">
            <p className="mb-1 text-[10px] font-bold uppercase text-gray-500">
              Transaction Hash
            </p>
            <div className="flex items-center justify-between">
              <code className="max-w-[250px] truncate font-mono text-xs text-[#14F195]">
                {txHash}
              </code>
              <a
                href={explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-white"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
          <Button
            onClick={handleClose}
            className="w-full bg-[#14F195] font-bold text-black"
          >
            Close
          </Button>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN MODAL
  // ============================================
  const needsSol = currency === 'SOL';
  const needsEth = currency === 'ETH';
  const isLoading = isProcessing || isEthPending || isEthConfirming;
  const canSubmit =
    amount &&
    parseFloat(amount) > 0 &&
    !isLoading &&
    stage === 'idle' &&
    ((needsSol && solConnected && publicKey) || (needsEth && ethConnected));

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#11131F] p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">
              Donate to {recipientName}
            </h3>
            <p className="mt-1 font-mono text-xs text-blue-400">
              Pool #{poolId} • Solana Devnet
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Currency Tabs */}
        <div className="mb-4 flex gap-2 rounded-lg bg-black p-1">
          {(['SOL', 'ETH'] as Currency[]).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              disabled={isLoading}
              className={clsx(
                'flex-1 rounded-md py-2 text-xs font-bold transition-colors',
                currency === c
                  ? c === 'ETH'
                    ? 'bg-purple-500 text-white'
                    : 'bg-[#14F195] text-black'
                  : 'text-gray-500 hover:text-white',
                isLoading && 'cursor-not-allowed opacity-50'
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Wallet Connection Warnings */}
        {needsSol && !solConnected && (
          <div
            onClick={() => setSolModalVisible(true)}
            className="mb-4 flex cursor-pointer gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3"
          >
            <AlertTriangle className="shrink-0 text-yellow-400" size={16} />
            <div>
              <p className="text-xs font-medium text-yellow-200">
                Solana wallet not connected
              </p>
              <p className="text-[10px] text-yellow-200/70">
                Click here to connect Phantom
              </p>
            </div>
          </div>
        )}

        {needsEth && !ethConnected && (
          <div
            onClick={() => connect({ connector: injected() })}
            className="mb-4 flex cursor-pointer gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3"
          >
            <AlertTriangle className="shrink-0 text-yellow-400" size={16} />
            <div>
              <p className="text-xs font-medium text-yellow-200">
                Ethereum wallet not connected
              </p>
              <p className="text-[10px] text-yellow-200/70">
                Click here to connect MetaMask
              </p>
            </div>
          </div>
        )}

        {/* ETH Conversion Info */}
        {currency === 'ETH' && ethConnected && (
          <div className="mb-4 flex gap-3 rounded-lg border border-purple-500/20 bg-purple-500/10 p-3">
            <Info className="shrink-0 text-purple-400" size={16} />
            <p className="text-[10px] text-purple-200">
              <b>Cross-chain donation:</b> Your ETH (Sepolia) will be received
              by our treasury and converted to SOL, then deposited to the
              relief pool smart contract.
            </p>
          </div>
        )}

        {/* Amount Input */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              disabled={isLoading}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 font-mono text-2xl text-white outline-none transition-colors focus:border-[#14F195] disabled:cursor-not-allowed disabled:opacity-50"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
              {currency}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleDonate}
          disabled={!canSubmit}
          className={clsx(
            'w-full py-6 text-lg font-bold transition-all',
            currency === 'ETH'
              ? 'bg-purple-600 text-white hover:bg-purple-500'
              : 'bg-[#14F195] text-black hover:bg-[#14F195]/90',
            !canSubmit && 'cursor-not-allowed opacity-50'
          )}
        >
          {isLoading ? (
            <span className="flex flex-col items-center gap-1">
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                {isEthConfirming
                  ? 'Confirming on Ethereum...'
                  : 'Processing...'}
              </span>
              {statusMsg && (
                <span className="whitespace-pre-line text-[10px] font-normal opacity-80">
                  {statusMsg}
                </span>
              )}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              {currency === 'ETH' ? 'Donate ETH → SOL' : 'Donate SOL'}
            </span>
          )}
        </Button>

        {/* Connected Wallets Info */}
        <div className="mt-4 flex justify-center gap-4 text-[10px] text-gray-500">
          {solConnected && publicKey && (
            <span>
              SOL: {publicKey.toBase58().slice(0, 4)}...
              {publicKey.toBase58().slice(-4)}
            </span>
          )}
          {ethConnected && ethAddress && (
            <span>
              ETH: {ethAddress.slice(0, 4)}...{ethAddress.slice(-4)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
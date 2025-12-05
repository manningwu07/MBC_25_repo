'use client';

import { useState } from 'react';
import {
  X,
  Loader2,
  ArrowRightLeft,
  CheckCircle2,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '~/components/ui/button';
import { clsx } from 'clsx';
import { PublicKey } from '@solana/web3.js';

// Solana
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

// Ethereum
import {
  useAccount,
  useConnect,
  useSendTransaction,
  usePublicClient,
} from 'wagmi';
import { injected } from 'wagmi/connectors';

// Local
import {
  buildUSDCTransferTx,
  buildDonateToPoolTx,
} from '~/lib/solana/client';
import { getCauseById } from '~/lib/causes';
import {
  buildApproveData,
  buildBurnData,
  SEPOLIA_USDC,
  SEPOLIA_TOKEN_MESSENGER,
  pollForAttestation,
} from '~/lib/circle';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  recipientAddress: string;
  causeId: string; // Required now!
}

type Currency = 'SOL' | 'ETH'; //| 'USDC_SOL';

export function DonationModal({
  isOpen,
  onClose,
  recipientName,
  recipientAddress,
  causeId,
}: DonationModalProps) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('SOL');
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<
    'idle' | 'bridging' | 'confirming' | 'success'
  >('idle');
  const [txHash, setTxHash] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<string>('');

  // Solana
  const { publicKey, signTransaction, connected: solConnected } = useWallet();
  const { connection } = useConnection();
  const { setVisible: setSolModalVisible } = useWalletModal();

  // Ethereum
  const { address: ethAddress, isConnected: ethConnected } = useAccount();
  const { connect: ethConnect } = useConnect();
  const { sendTransactionAsync } = useSendTransaction();
  const publicClient = usePublicClient();

  // Get the cause to find poolId
  const cause = getCauseById(causeId);

  if (!isOpen) return null;

  const handleClose = () => {
    setStage('idle');
    setTxHash('');
    setAmount('');
    setStatusMsg('');
    onClose();
  };

  const handleDonate = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    setLoading(true);
    setTxHash('');
    setStatusMsg('');

    try {
      const amtNum = parseFloat(amount);
      let signature = '';

      // ============================================
      // SOLANA: SOL donation via Smart Contract
      // ============================================
      if (currency === 'SOL') {
        if (!publicKey || !signTransaction) {
          throw new Error('Please connect your Phantom wallet first.');
        }

        if (!cause) {
          throw new Error('Invalid cause selected.');
        }

        setStage('confirming');
        setStatusMsg('Building smart contract transaction...');

        // Use the smart contract!
        const tx = await buildDonateToPoolTx(publicKey, cause.poolId, amtNum);

        setStatusMsg('Please approve in Phantom...');

        const signed = await signTransaction(tx);
        const sig = await connection.sendRawTransaction(signed.serialize());

        setStatusMsg('Confirming on-chain...');
        await connection.confirmTransaction(sig, 'confirmed');

        signature = sig;
      }

      // // ============================================
      // // SOLANA: USDC Transfer (direct SPL transfer)
      // // ============================================
      // else if (currency === 'USDC_SOL') {
      //   if (!publicKey || !signTransaction) {
      //     throw new Error('Please connect your Phantom wallet first.');
      //   }

      //   setStage('confirming');
      //   setStatusMsg('Building USDC transfer...');

      //   const toPubkey = new PublicKey(recipientAddress);
      //   const tx = await buildUSDCTransferTx(publicKey, amtNum, toPubkey);

      //   setStatusMsg('Please approve in Phantom...');

      //   const signed = await signTransaction(tx);
      //   const sig = await connection.sendRawTransaction(signed.serialize());

      //   setStatusMsg('Confirming transaction...');
      //   await connection.confirmTransaction(sig, 'confirmed');

      //   signature = sig;
      // }

      // ============================================
      // ETHEREUM: CCTP Bridge (Sepolia USDC -> Solana)
      // ============================================
      else if (currency === 'ETH') {
        if (!ethAddress || !publicClient) {
          throw new Error('Please connect your Ethereum wallet first.');
        }

        const destSolAddress = publicKey?.toBase58() || recipientAddress;

        setStage('confirming');
        setStatusMsg('Approving USDC spend...');

        const approveHash = await sendTransactionAsync({
          to: SEPOLIA_USDC,
          data: buildApproveData(amtNum),
        });

        setStatusMsg('Waiting for approval confirmation...');

        await waitForTx(publicClient, approveHash, setStatusMsg);

        setStatusMsg('Approval confirmed! Burning USDC for bridge...');

        const burnHash = await sendTransactionAsync({
          to: SEPOLIA_TOKEN_MESSENGER,
          data: buildBurnData(amtNum, destSolAddress),
        });

        setTxHash(burnHash);
        setStage('bridging');
        setStatusMsg('Waiting for Circle attestation...');

        await pollForAttestation(burnHash);

        setStatusMsg('Bridge complete!');
        signature = burnHash;
      }

      setTxHash(signature);
      setStage('success');
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
    } finally {
      setLoading(false);
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
              ? 'USDC bridged from Sepolia to Solana via Circle CCTP.'
              : currency === 'SOL'
                ? 'SOL donated to pool via Solana smart contract.'
                : 'USDC transferred on Solana Devnet.'}
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
          {currency === 'SOL' && cause && (
            <div className="mb-4 rounded-lg border border-[#14F195]/20 bg-[#14F195]/5 p-3 text-left">
              <p className="text-[10px] font-bold uppercase text-[#14F195]">
                Pool Updated
              </p>
              <p className="text-xs text-gray-400">
                Pool #{cause.poolId} total_donated incremented on-chain
              </p>
            </div>
          )}
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
  const needsSol = currency === 'SOL';  //|| currency === 'USDC_SOL';
  const needsEth = currency === 'ETH';
  const canSubmit =
    amount &&
    parseFloat(amount) > 0 &&
    !loading &&
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
              {currency === 'SOL' && cause
                ? `Pool #${cause.poolId} • Solana Smart Contract`
                : 'Via Circle CCTP & Solana'}
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
          {/* {(['SOL', 'USDC_SOL', 'ETH'] as Currency[]).map((c) => ( */}
          {(['SOL', 'ETH'] as Currency[]).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={clsx(
                'flex-1 rounded-md py-2 text-xs font-bold transition-colors',
                currency === c
                  ? c === 'ETH'
                    ? 'bg-purple-500 text-white'
                    : c === 'SOL'
                      ? 'bg-[#14F195] text-black'
                      : 'bg-[#2775CA] text-white'
                  : 'text-gray-500 hover:text-white'
              )}
            >
              {/* {c === 'USDC_SOL' ? 'USDC (Sol)' : c === 'ETH' ? 'ETH→Sol' : 'SOL'} */}
              {c === 'ETH' ? 'ETH→Sol' : 'SOL'}
            </button>
          ))}
        </div>

        {/* Smart Contract Info for SOL */}
        {currency === 'SOL' && cause && (
          <div className="mb-4 flex gap-3 rounded-lg border border-[#14F195]/20 bg-[#14F195]/5 p-3">
            <CheckCircle2 className="shrink-0 text-[#14F195]" size={16} />
            <p className="text-[10px] text-[#14F195]">
              Donating via <b>solana_aid</b> smart contract. Your donation will
              be tracked on-chain in Pool #{cause.poolId}.
            </p>
          </div>
        )}

        {/* Wallet Connection Warnings */}
        {needsSol && !solConnected && (
          <div
            onClick={() => setSolModalVisible(true)}
            className="mb-4 flex cursor-pointer gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3"
          >
            <AlertTriangle className="shrink-0 text-yellow-400" size={16} />
            <div>
              <p className="text-xs font-medium text-yellow-200">
                Phantom wallet not connected
              </p>
              <p className="text-[10px] text-yellow-200/70">
                Click here to connect
              </p>
            </div>
          </div>
        )}

        {needsEth && !ethConnected && (
          <div
            onClick={() => ethConnect({ connector: injected() })}
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

        {currency === 'ETH' && ethConnected && (
          <div className="mb-4 flex gap-3 rounded-lg border border-purple-500/20 bg-purple-500/10 p-3">
            <ArrowRightLeft className="shrink-0 text-purple-400" size={16} />
            <p className="text-[10px] text-purple-200">
              Bridging <b>USDC</b> from Sepolia → Solana Devnet via Circle CCTP.
              Requires Sepolia USDC + ETH for gas.
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
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 font-mono text-2xl text-white outline-none transition-colors focus:border-[#14F195]"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
              {currency === 'SOL' ? 'SOL' : 'USDC'}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleDonate}
          disabled={!canSubmit}
          className={clsx(
            'w-full py-6 text-lg font-bold text-white transition-all',
            currency === 'ETH'
              ? 'bg-purple-600 hover:bg-purple-500'
              : currency === 'SOL'
                ? 'bg-[#14F195] text-black hover:bg-[#14F195]/90'
                : 'bg-[#2775CA] hover:bg-[#2775CA]/90',
            !canSubmit && 'cursor-not-allowed opacity-50'
          )}
        >
          {loading ? (
            <span className="flex flex-col items-center gap-1">
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                Processing...
              </span>
              {statusMsg && (
                <span className="text-[10px] font-normal opacity-80">
                  {statusMsg}
                </span>
              )}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              {currency === 'ETH'
                ? 'Bridge via CCTP'
                : currency === 'SOL'
                  ? 'Donate to Pool'
                  : 'Donate USDC'}
              {currency === 'ETH' && <ArrowRightLeft size={16} />}
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

// Add this helper at the top of donation-modal.tsx (after imports)
async function waitForTx(
  publicClient: ReturnType<typeof usePublicClient>,
  hash: `0x${string}`,
  onStatus: (msg: string) => void,
  maxAttempts = 30
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const receipt = await publicClient!.getTransactionReceipt({ hash });
      if (receipt && receipt.status === 'success') {
        return;
      }
      if (receipt && receipt.status === 'reverted') {
        throw new Error('Transaction reverted');
      }
    } catch (e: unknown) {
      // Receipt not found yet, keep polling
      if (!(e instanceof Error) || !e.message.includes('could not be found')) {
        throw e;
      }
    }
    onStatus(`Confirming... (${i + 1}/${maxAttempts})`);
    await new Promise((r) => setTimeout(r, 4000)); // 4 sec between polls
  }
  throw new Error('Transaction confirmation timeout');
}
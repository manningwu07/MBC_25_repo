'use client';

import { MainNav } from '~/components/layout/main-nav';
import { Button } from '~/components/ui/button';
import { useCallback, useEffect, useState } from 'react';
import {
  Loader2,
  ShieldCheck,
  Download,
  Wallet,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import {
  getNgoInfo,
  withdrawFromPool,
  NgoInfo,
} from '~/lib/solana/donate';
import { getPoolById, PoolInfo, POOL_NAMES } from '~/lib/solana/pools';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

export default function NgoDashboard() {
  const { publicKey, connected, signTransaction, signAllTransactions } =
    useWallet();
  const { setVisible } = useWalletModal();

  const [loading, setLoading] = useState(true);
  const [ngoInfo, setNgoInfo] = useState<NgoInfo | null>(null);
  const [pools, setPools] = useState<PoolInfo[]>([]);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState<Record<number, string>>(
    {}
  );
  const [txResult, setTxResult] = useState<{
    poolId: number;
    success: boolean;
    message: string;
    txHash?: string;
  } | null>(null);

  const walletAddress = publicKey?.toBase58() ?? null;

  const refreshData = useCallback(async () => {
    if (!walletAddress) return;

    setLoading(true);
    try {
      // Check if wallet is a registered NGO
      const info = await getNgoInfo(walletAddress);
      setNgoInfo(info);

      if (info && info.isActive) {
        // Fetch pools the NGO has access to
        const poolData: PoolInfo[] = [];
        for (const poolId of info.allowedPools) {
          const pool = await getPoolById(poolId);
          if (pool) {
            poolData.push(pool);
          }
        }
        setPools(poolData);
      } else {
        setPools([]);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  const handleWithdraw = async (poolId: number, maxBalance: number) => {
    const amountStr = withdrawAmount[poolId];
    if (!amountStr || !publicKey || !signTransaction || !signAllTransactions) {
      return;
    }

    const amount = parseFloat(amountStr);

    if (amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (amount > maxBalance) {
      alert(`Insufficient funds. Max available: ${maxBalance.toFixed(4)} SOL`);
      return;
    }

    // Check daily limit
    if (ngoInfo) {
      const dailyLimitSol = ngoInfo.dailyLimit.toNumber() / LAMPORTS_PER_SOL;
      const withdrawnTodaySol =
        ngoInfo.withdrawnToday.toNumber() / LAMPORTS_PER_SOL;
      const remaining = dailyLimitSol - withdrawnTodaySol;

      if (amount > remaining) {
        alert(
          `Daily limit exceeded. Remaining today: ${remaining.toFixed(4)} SOL`
        );
        return;
      }
    }

    setProcessingId(poolId);
    setTxResult(null);

    try {
      const txHash = await withdrawFromPool(
        { publicKey, signTransaction, signAllTransactions },
        poolId,
        amount
      );

      setWithdrawAmount((prev) => ({ ...prev, [poolId]: '' }));
      setTxResult({
        poolId,
        success: true,
        message: `Successfully withdrew ${amount} SOL`,
        txHash,
      });

      // Refresh data after successful withdrawal
      await refreshData();
    } catch (error) {
      console.error('Withdrawal error:', error);
      const msg = error instanceof Error ? error.message : 'Transaction failed';

      setTxResult({
        poolId,
        success: false,
        message: msg.includes('daily')
          ? 'Daily withdrawal limit exceeded'
          : msg.includes('Insufficient')
            ? 'Insufficient funds in pool'
            : msg.includes('not allowed')
              ? 'You are not authorized for this pool'
              : msg,
      });
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    if (connected && walletAddress) {
      refreshData();
    } else {
      setLoading(false);
      setNgoInfo(null);
      setPools([]);
    }
  }, [connected, walletAddress, refreshData]);

  // NOT CONNECTED
  if (!connected) {
    return (
      <div className="min-h-screen bg-[#020410] text-white">
        <MainNav />
        <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
          <Wallet className="h-16 w-16 text-gray-600" />
          <h2 className="text-xl font-bold">
            Connect Wallet to Access Dashboard
          </h2>
          <p className="text-gray-400">
            We need to verify your NGO registration on-chain.
          </p>
          <Button
            onClick={() => setVisible(true)}
            className="bg-[#14F195] font-bold text-black"
          >
            Connect Phantom
          </Button>
        </div>
      </div>
    );
  }

  // LOADING
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020410] text-white">
        <MainNav />
        <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#14F195]" />
          <p className="animate-pulse font-mono text-sm text-[#14F195]">
            Verifying NGO registration on Solana...
          </p>
        </div>
      </div>
    );
  }

  // NOT REGISTERED OR INACTIVE
  if (!ngoInfo || !ngoInfo.isActive) {
    return (
      <div className="min-h-screen bg-[#020410] text-white">
        <MainNav />
        <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
          <XCircle className="h-16 w-16 text-red-500" />
          <h2 className="text-xl font-bold">Not a Registered NGO</h2>
          <p className="max-w-md text-center text-gray-400">
            Your wallet address is not registered as an authorized NGO in our
            smart contract. Please contact the platform administrators to apply
            for registration.
          </p>
          <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="font-mono text-xs text-gray-500">Your wallet:</p>
            <p className="font-mono text-sm text-white">{walletAddress}</p>
          </div>
        </div>
      </div>
    );
  }

  // NO ALLOWED POOLS
  if (ngoInfo.allowedPools.length === 0) {
    return (
      <div className="min-h-screen bg-[#020410] text-white">
        <MainNav />
        <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
          <AlertCircle className="h-16 w-16 text-yellow-500" />
          <h2 className="text-xl font-bold">No Pool Access</h2>
          <p className="max-w-md text-center text-gray-400">
            Your NGO is registered but has not been assigned to any relief
            pools yet. Please contact the administrators.
          </p>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD
  const dailyLimitSol = ngoInfo.dailyLimit.toNumber() / LAMPORTS_PER_SOL;
  const withdrawnTodaySol = ngoInfo.withdrawnToday.toNumber() / LAMPORTS_PER_SOL;
  const remainingToday = dailyLimitSol - withdrawnTodaySol;

  return (
    <div className="min-h-screen bg-[#020410] text-white selection:bg-[#14F195] selection:text-black">
      <MainNav />

      <div className="mx-auto max-w-6xl px-6 py-12">
        <header className="mb-12">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-[#14F195]" />
            <div>
              <h1 className="text-3xl font-bold">NGO Partner Dashboard</h1>
              <p className="text-gray-400">
                Withdraw funds from authorized relief pools
              </p>
            </div>
          </div>
        </header>

        {/* NGO STATUS CARD */}
        <div className="mb-8 rounded-2xl border border-[#14F195]/20 bg-[#14F195]/5 p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400">
                Wallet Address
              </p>
              <p className="mt-1 font-mono text-sm text-white">
                {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-8)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400">
                Daily Limit
              </p>
              <p className="mt-1 font-mono text-xl font-bold text-white">
                {dailyLimitSol.toFixed(2)} SOL
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400">
                Remaining Today
              </p>
              <p className="mt-1 font-mono text-xl font-bold text-[#14F195]">
                {remainingToday.toFixed(4)} SOL
              </p>
            </div>
          </div>
        </div>

        {/* POOLS */}
        <section>
          <h2 className="mb-6 text-xl font-bold">Your Authorized Pools</h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AnimatePresence>
              {pools.map((pool) => (
                <motion.div
                  key={pool.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  layout
                  className="rounded-2xl border border-white/10 bg-[#11131F] p-6"
                >
                  <div className="mb-6 flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {pool.name}
                      </h3>
                      <p className="mt-1 font-mono text-xs text-gray-500">
                        Pool ID: {pool.id}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400">
                        Available Balance
                      </p>
                      <p className="font-mono text-2xl font-bold text-[#14F195]">
                        {pool.balanceSol.toFixed(4)} SOL
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mb-4 grid grid-cols-2 gap-4 rounded-lg bg-black/30 p-3">
                    <div>
                      <p className="text-[10px] text-gray-500">Total Donated</p>
                      <p className="font-mono text-sm text-white">
                        {(pool.totalDonated.toNumber() / LAMPORTS_PER_SOL).toFixed(4)} SOL
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">
                        Total Withdrawn
                      </p>
                      <p className="font-mono text-sm text-white">
                        {(pool.totalWithdrawn.toNumber() / LAMPORTS_PER_SOL).toFixed(4)} SOL
                      </p>
                    </div>
                  </div>

                  {/* Tx Result */}
                  {txResult && txResult.poolId === pool.id && (
                    <div
                      className={`mb-4 flex items-center gap-2 rounded-lg p-3 ${
                        txResult.success
                          ? 'border border-green-500/20 bg-green-500/10'
                          : 'border border-red-500/20 bg-red-500/10'
                      }`}
                    >
                      {txResult.success ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <p
                        className={`text-xs ${txResult.success ? 'text-green-400' : 'text-red-400'}`}
                      >
                        {txResult.message}
                      </p>
                      {txResult.txHash && (
                        <a
                          href={`https://explorer.solana.com/tx/${txResult.txHash}?cluster=devnet`}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-auto text-xs text-blue-400 hover:underline"
                        >
                          View Tx
                        </a>
                      )}
                    </div>
                  )}

                  {/* Withdraw Form */}
                  <div className="rounded-xl border border-white/5 bg-black/40 p-4">
                    <label className="mb-2 block text-xs text-gray-400">
                      Withdraw to your wallet
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        placeholder="0.00"
                        step="0.001"
                        min="0"
                        max={Math.min(pool.balanceSol, remainingToday)}
                        value={withdrawAmount[pool.id] || ''}
                        onChange={(e) =>
                          setWithdrawAmount((prev) => ({
                            ...prev,
                            [pool.id]: e.target.value,
                          }))
                        }
                        disabled={processingId !== null}
                        className="flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2 font-mono text-sm text-white outline-none transition-colors focus:border-[#14F195] disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      <Button
                        onClick={() =>
                          handleWithdraw(pool.id, pool.balanceSol)
                        }
                        disabled={
                          processingId !== null ||
                          !withdrawAmount[pool.id] ||
                          parseFloat(withdrawAmount[pool.id] || '0') <= 0
                        }
                        className="bg-white font-bold text-black hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {processingId === pool.id ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <>
                            <Download size={16} className="mr-2" />
                            Withdraw
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="mt-2 text-[10px] text-gray-500">
                      Max: {Math.min(pool.balanceSol, remainingToday).toFixed(4)}{' '}
                      SOL (limited by pool balance or daily limit)
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* INFO FOOTER */}
        <div className="mt-12 flex items-start gap-4 rounded-xl border border-blue-500/10 bg-blue-500/5 p-4">
          <AlertCircle className="mt-1 shrink-0 text-blue-500" size={20} />
          <div>
            <h4 className="text-sm font-bold text-blue-500">
              On-Chain Verification
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-gray-400">
              Your NGO status is verified directly from the Solana blockchain.
              Withdrawals are processed through the smart contract which
              enforces daily limits and pool authorization. All transactions are
              transparent and verifiable on Solana Explorer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
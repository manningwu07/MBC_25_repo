'use client';

import { MainNav } from '~/components/layout/main-nav';
import { Button } from '~/components/ui/button';
import { useCallback, useEffect, useState } from 'react';
import {
  Loader2,
  ShieldCheck,
  Download,
  Plus,
  Wallet,
  AlertCircle,
} from 'lucide-react';
import {
  FundContract,
  getContracts,
  joinContract,
  withdrawFromContract,
} from '~/lib/smart-contracts';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

export default function NgoDashboard() {
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [loading, setLoading] = useState(true);

  const [registered, setRegistered] = useState<FundContract[]>([]);
  const [others, setOthers] = useState<FundContract[]>([]);

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState<Record<string, string>>(
    {}
  );

  const walletAddress = publicKey?.toBase58() ?? null;

  const refreshData = useCallback(() => {
    if (!walletAddress) return;
    const allContracts = getContracts();

    const reg = allContracts.filter((c) =>
      c.whitelist.includes(walletAddress)
    );
    const unreg = allContracts.filter(
      (c) => !c.whitelist.includes(walletAddress)
    );

    setRegistered(reg);
    setOthers(unreg);
  }, [walletAddress]);

  const handleJoin = async (contractId: string) => {
    if (!walletAddress) return;
    setProcessingId(contractId);
    try {
      await joinContract(contractId, walletAddress);
      refreshData();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const handleWithdraw = async (
    contractId: string,
    maxBalance: number,
    contractName: string
  ) => {
    const amountStr = withdrawAmount[contractId];
    if (!amountStr || !walletAddress) return;
    const amount = parseFloat(amountStr);

    if (amount <= 0 || amount > maxBalance) {
      alert('Invalid amount');
      return;
    }

    setProcessingId(contractId);
    try {
      await withdrawFromContract(contractId, amount, contractName, walletAddress);
      setWithdrawAmount((prev) => ({ ...prev, [contractId]: '' }));
      refreshData();
      alert(
        `Successfully withdrew ${amount} SOL to ${walletAddress.slice(0, 6)}...`
      );
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    const scanBlockchain = async () => {
      if (!connected || !walletAddress) return;

      setLoading(true);
      await new Promise((r) => setTimeout(r, 1200));
      refreshData();
      setLoading(false);
    };

    scanBlockchain();
  }, [connected, walletAddress, refreshData]);

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
            We need to scan your address against our registry.
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

  if (registered.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-[#020410] text-white">
        <MainNav />
        <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
          <Wallet className="h-16 w-16 text-gray-600" />
          <h2 className="text-xl font-bold">You are not an authorized NGO</h2>
          <p className="text-gray-400">Please apply to join the NGO Registry</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020410] text-white selection:bg-[#14F195] selection:text-black">
      <MainNav />

      <div className="mx-auto max-w-6xl px-6 py-12">
        <header className="mb-12">
          <h1 className="mb-2 text-3xl font-bold">NGO Partner Dashboard</h1>
          <p className="text-gray-400">
            Manage your organization&apos;s access to decentralized relief
            funds.
          </p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-20">
            <Loader2 className="h-10 w-10 animate-spin text-[#14F195]" />
            <p className="animate-pulse font-mono text-sm text-[#14F195]">
              Scanning Smart Contracts...
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            {/* REGISTERED CONTRACTS */}
            <section>
              <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-[#14F195]">
                <ShieldCheck /> Your Registered Smart Contracts
              </h2>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <AnimatePresence>
                  {registered.map((contract) => (
                    <motion.div
                      key={contract.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      layout
                      className="rounded-2xl border border-[#14F195]/20 bg-[#14F195]/5 p-6"
                    >
                      <div className="mb-6 flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {contract.name}
                          </h3>
                          <p className="mt-1 font-mono text-xs text-[#14F195] opacity-70">
                            Contract: {contract.address.slice(0, 6)}...
                            {contract.address.slice(-4)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-wider text-gray-400">
                            Available Pool
                          </p>
                          <p className="font-mono text-2xl font-bold text-[#14F195]">
                            {contract.balance.toLocaleString()} SOL
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/5 bg-black/40 p-4">
                        <label className="mb-2 block text-xs text-gray-400">
                          Withdraw Funds to your Wallet
                        </label>
                        <div className="flex gap-3">
                          <input
                            type="number"
                            placeholder="0.00"
                            value={withdrawAmount[contract.id] || ''}
                            onChange={(e) =>
                              setWithdrawAmount((prev) => ({
                                ...prev,
                                [contract.id]: e.target.value,
                              }))
                            }
                            className="flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2 font-mono text-sm text-white outline-none transition-colors focus:border-[#14F195]"
                          />
                          <Button
                            onClick={() =>
                              handleWithdraw(
                                contract.id,
                                contract.balance,
                                contract.name
                              )
                            }
                            disabled={processingId === contract.id}
                            className="bg-white font-bold text-black hover:bg-gray-200"
                          >
                            {processingId === contract.id ? (
                              <Loader2 className="animate-spin" />
                            ) : (
                              <Download size={16} className="mr-2" />
                            )}
                            Pull
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>

            {/* OTHER CONTRACTS */}
            <section>
              <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-400">
                <Wallet /> Available Relief Pools
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {others.map((contract) => (
                  <div
                    key={contract.id}
                    className="rounded-xl border border-white/5 bg-[#11131F] p-5 transition-colors hover:border-white/10"
                  >
                    <div className="mb-4">
                      <h3 className="font-bold text-white">{contract.name}</h3>
                      <p className="mt-1 text-xs text-gray-500">
                        Balance: {contract.balance.toLocaleString()} SOL
                      </p>
                    </div>
                    <Button
                      onClick={() => handleJoin(contract.id)}
                      disabled={processingId === contract.id}
                      variant="outline"
                      className="group w-full justify-between"
                    >
                      {processingId === contract.id ? (
                        <span className="flex items-center gap-2">
                          <Loader2 size={14} className="animate-spin" />{' '}
                          Registering...
                        </span>
                      ) : (
                        <>
                          Apply for Whitelist
                          <Plus
                            size={16}
                            className="transition-colors group-hover:text-[#14F195]"
                          />
                        </>
                      )}
                    </Button>
                  </div>
                ))}

                {others.length === 0 && (
                  <div className="col-span-full py-8 text-center text-gray-600">
                    You are registered in all available pools.
                  </div>
                )}
              </div>
            </section>

            {/* INFO FOOTER */}
            <div className="flex items-start gap-4 rounded-xl border border-blue-500/10 bg-blue-500/5 p-4">
              <AlertCircle
                className="mt-1 shrink-0 text-blue-500"
                size={20}
              />
              <div>
                <h4 className="text-sm font-bold text-blue-500">
                  How Verification Works
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-gray-400">
                  This dashboard interacts directly with Solana Program
                  Accounts. When you click &quot;Apply&quot;, you are submitting
                  a transaction to add your wallet key to the program&apos;s PDA
                  whitelist. Once confirmed, the UI moves the contract to your
                  &quot;Registered&quot; list, enabling the Withdraw function.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
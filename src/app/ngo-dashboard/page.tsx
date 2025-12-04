'use client';

import { MainNav } from '~/components/layout/main-nav';
import { Button } from '~/components/ui/button';
import { usePrivy } from '@privy-io/react-auth';
import { useCallback, useEffect, useState } from 'react';
import { Loader2, ShieldCheck, Download, Plus, Wallet, AlertCircle } from 'lucide-react';
import { FundContract, getContracts, joinContract, withdrawFromContract } from '~/lib/smart-contracts';
import { motion, AnimatePresence } from 'framer-motion';

export default function NgoDashboard() {
    const { user, authenticated } = usePrivy();
    const [loading, setLoading] = useState(true);

    // State
    const [registered, setRegistered] = useState<FundContract[]>([]);
    const [others, setOthers] = useState<FundContract[]>([]);

    // Action State
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [withdrawAmount, setWithdrawAmount] = useState<Record<string, string>>({});

    const refreshData = useCallback(() => {
        if (!user?.wallet) return;
        const allContracts = getContracts();
        const myWallet = user.wallet.address;

        const reg = allContracts.filter(c => c.whitelist.includes(myWallet));
        const unreg = allContracts.filter(c => !c.whitelist.includes(myWallet));

        console.log("All Contracts", allContracts);
        console.log("Registered", reg);
        console.log("myWallet", myWallet);
        setRegistered(reg);
        setOthers(unreg);
    }, [user?.wallet]);

    // 2. Handle Joining (Whitelisting)
    const handleJoin = async (contractId: string) => {
        if (!user?.wallet) return;
        setProcessingId(contractId);
        try {
            await joinContract(contractId, user.wallet.address);
            refreshData(); // Refresh UI
        } catch (e) {
            console.error(e);
        } finally {
            setProcessingId(null);
        }
    };

    // 3. Handle Withdrawal
    const handleWithdraw = async (contractId: string, maxBalance: number, contractName: string) => {
        const amountStr = withdrawAmount[contractId];
        if (!amountStr) return;
        const amount = parseFloat(amountStr);

        if (amount <= 0 || amount > maxBalance) {
            alert("Invalid amount");
            return;
        }

        setProcessingId(contractId);
        try {
            // Here is where you would normally invoke the wallet signature
            // await signTransaction(...) 

            await withdrawFromContract(contractId, amount, contractName, user?.wallet?.address || "Unknown");

            // Clear input and refresh
            setWithdrawAmount(prev => ({ ...prev, [contractId]: '' }));
            refreshData();
            alert(`Successfully withdrew ${amount} SOL to ${user?.wallet?.address.slice(0, 6)}...`);
        } catch (e) {
            console.error(e);
        } finally {
            setProcessingId(null);
        }
    };
    
    useEffect(() => {
        const scanBlockchain = async () => {
            if (!authenticated || !user?.wallet) return;

            setLoading(true);
            // Simulate RPC calls to fetch program accounts
            await new Promise(r => setTimeout(r, 1200));

            refreshData();
            setLoading(false);
        };

        scanBlockchain();
    }, [authenticated, refreshData, user]);

    if (!authenticated) {
        return (
            <div className="min-h-screen bg-[#020410] text-white">
                <MainNav />
                <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                    <Wallet className="w-16 h-16 text-gray-600" />
                    <h2 className="text-xl font-bold">Connect Wallet to Access Dashboard</h2>
                    <p className="text-gray-400">We need to scan your address against our registry.</p>
                </div>
            </div>
        );
    }

    if(registered.length == 0){
        return (
            <div className="min-h-screen bg-[#020410] text-white">
                <MainNav />
                <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                    <Wallet className="w-16 h-16 text-gray-600" />
                    <h2 className="text-xl font-bold">You are not an authorized NGO</h2>
                    <p className="text-gray-400">Please apply to join the NGO Registry</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020410] text-white selection:bg-[#14F195] selection:text-black">
            <MainNav />

            <div className="max-w-6xl mx-auto py-12 px-6">
                <header className="mb-12">
                    <h1 className="text-3xl font-bold mb-2">NGO Partner Dashboard</h1>
                    <p className="text-gray-400">Manage your organization&apos;s access to decentralized relief funds.</p>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 className="w-10 h-10 text-[#14F195] animate-spin" />
                        <p className="text-sm font-mono text-[#14F195] animate-pulse">Scanning Smart Contracts...</p>
                    </div>
                ) : (
                    <div className="space-y-16">

                        {/* SECTION 1: REGISTERED CONTRACTS */}
                        <section>
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#14F195]">
                                <ShieldCheck /> Your Registered Smart Contracts
                            </h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <AnimatePresence>
                                    {registered.map((contract) => (
                                        <motion.div
                                            key={contract.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            layout
                                            className="bg-[#14F195]/5 border border-[#14F195]/20 p-6 rounded-2xl"
                                        >
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <h3 className="font-bold text-xl text-white">{contract.name}</h3>
                                                    <p className="text-xs font-mono text-[#14F195] opacity-70 mt-1">
                                                        Contract: {contract.address.slice(0, 6)}...{contract.address.slice(-4)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Available Pool</p>
                                                    <p className="text-2xl font-mono font-bold text-[#14F195]">{contract.balance.toLocaleString()} SOL</p>
                                                </div>
                                            </div>

                                            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                                                <label className="text-xs text-gray-400 mb-2 block">Withdraw Funds to your Wallet</label>
                                                <div className="flex gap-3">
                                                    <input
                                                        type="number"
                                                        placeholder="0.00"
                                                        value={withdrawAmount[contract.id] || ''}
                                                        onChange={(e) => setWithdrawAmount(prev => ({ ...prev, [contract.id]: e.target.value }))}
                                                        className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-[#14F195] outline-none transition-colors"
                                                    />
                                                    <Button
                                                        onClick={() => handleWithdraw(contract.id, contract.balance, contract.name)}
                                                        disabled={processingId === contract.id}
                                                        className="bg-white text-black hover:bg-gray-200 font-bold"
                                                    >
                                                        {processingId === contract.id ? <Loader2 className="animate-spin" /> : <Download size={16} className="mr-2" />}
                                                        Pull
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                        </section>

                        {/* SECTION 2: OTHER CONTRACTS */}
                        <section>
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-400">
                                <Wallet /> Available Relief Pools
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {others.map((contract) => (
                                    <div key={contract.id} className="bg-[#11131F] border border-white/5 p-5 rounded-xl hover:border-white/10 transition-colors">
                                        <div className="mb-4">
                                            <h3 className="font-bold text-white">{contract.name}</h3>
                                            <p className="text-xs text-gray-500 mt-1">Balance: {contract.balance.toLocaleString()} SOL</p>
                                        </div>
                                        <Button
                                            onClick={() => handleJoin(contract.id)}
                                            disabled={processingId === contract.id}
                                            variant="outline"
                                            className="w-full justify-between group"
                                        >
                                            {processingId === contract.id ? (
                                                <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Registering...</span>
                                            ) : (
                                                <>
                                                    Apply for Whitelist
                                                    <Plus size={16} className="group-hover:text-[#14F195] transition-colors" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                ))}

                                {others.length === 0 && (
                                    <div className="col-span-full text-center py-8 text-gray-600">
                                        You are registered in all available pools.
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* INFO FOOTER */}
                        <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex gap-4 items-start">
                            <AlertCircle className="text-blue-500 shrink-0 mt-1" size={20} />
                            <div>
                                <h4 className="font-bold text-blue-500 text-sm">How Verification Works</h4>
                                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                    This dashboard interacts directly with Solana Program Accounts.
                                    When you click &quot;Apply&quot;, you are submitting a transaction to add your wallet key to the program&apos;s PDA whitelist.
                                    Once confirmed, the UI moves the contract to your &quot;Registered&quot; list, enabling the Withdraw function.
                                </p>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
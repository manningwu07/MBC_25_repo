'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface Tx {
    id: string;
    amount: number;
    user: string;
    time: string;
}

export function TransactionFeed() {
    const [txs, setTxs] = useState<Tx[]>([
        { id: '1', amount: 5.5, user: '8xP2...9z1A', time: 'Just now' },
        { id: '2', amount: 12.0, user: 'C4k1...1b2D', time: '10s ago' },
        { id: '3', amount: 1.2, user: 'Anon', time: '15s ago' },
    ]);

    // Simulate live feed
    useEffect(() => {
        const interval = setInterval(() => {
            const newTx = {
                id: Math.random().toString(),
                amount: Number((Math.random() * 10).toFixed(2)),
                user: `User${Math.floor(Math.random() * 9999)}`,
                time: 'Just now'
            };
            setTxs(prev => [newTx, ...prev.slice(0, 6)]);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    return (
         <div className="bg-[#050505] border border-white/10 rounded-3xl p-6 h-full overflow-hidden flex flex-col">
            <h3 className="text-gray-400 text-sm font-semibold mb-4 uppercase tracking-wider">
                Live On-Chain Activity
            </h3>
            <div className="space-y-4">
                <AnimatePresence>
                    {txs.map((tx) => (
                        <motion.div
                            key={tx.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-brand-green/10 rounded-lg text-brand-green">
                                    <ArrowUpRight size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">{tx.user}</p>
                                    <p className="text-xs text-gray-500">Donated to Pool A</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-mono text-brand-green font-bold">+{tx.amount} SOL</p>
                                <p className="text-xs text-gray-600">{tx.time}</p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
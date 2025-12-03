'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface Tx {
    id: string;
    amount: number;
    user: string;
    pool: string;
    time: string;
}

const POOL_NAMES = [
    "Ukraine Crisis Fund",
    "Gaza Relief Wallet",
    "Sudan Emergency",
    "Global Clean Water",
    "Turkey Earthquake Relief"
];

export function TransactionFeed() {
    const [txs, setTxs] = useState<Tx[]>([
        { id: '1', amount: 5.5, user: 'Anonymous', pool: 'Ukraine Crisis Fund', time: 'Just now' },
        { id: '2', amount: 12.0, user: 'Anonymous', pool: 'Gaza Relief Wallet', time: '10s ago' },
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            const randomPool = POOL_NAMES[Math.floor(Math.random() * POOL_NAMES.length)];
            const randomAmount = (Math.random() * 15).toFixed(2);
            
            const newTx = {
                id: Math.random().toString(),
                amount: Number(randomAmount),
                user: 'Anonymous', // Requested change
                pool: randomPool,  // Requested change
                time: 'Just now'
            };
            setTxs(prev => [newTx, ...prev.slice(0, 6)]);
        }, 4000);
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
                                <div className="p-2 bg-[#14F195]/10 rounded-lg text-[#14F195]">
                                    <ArrowUpRight size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{tx.user}</p>
                                    <p className="text-[10px] text-gray-500">To: {tx.pool}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-mono text-[#14F195] font-bold">+{tx.amount} SOL</p>
                                <p className="text-[10px] text-gray-600">{tx.time}</p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
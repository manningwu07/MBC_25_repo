'use client';

import { MainNav } from '~/components/layout/main-nav';
import { Loader2, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getTransactions, ContractTransaction } from '~/lib/smart-contracts';

export default function Transparency() {
  const [txs, setTxs] = useState<ContractTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching from our "Smart Contract" indexer
    setTimeout(() => {
        setTxs(getTransactions());
        setLoading(false);
    }, 800);
  }, []);

  return (
    <div className="min-h-screen bg-[#020410] text-white">
      <MainNav />
      <div className="max-w-6xl mx-auto py-12 px-6">
        <h1 className="text-3xl font-bold mb-2">Transparency Reports</h1>
        <p className="text-gray-400 mb-8">Real-time ledger of verified NGO withdrawals from the smart contract registry.</p>
        
        <div className="bg-[#11131F] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 text-xs uppercase">
              <tr>
                <th className="p-4">Source Fund</th>
                <th className="p-4">Recipient (NGO)</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                {loading ? (
                    <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="animate-spin inline mr-2"/> Syncing Ledger...</td></tr>
                ) : txs.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">No withdrawals recorded yet. Go to the NGO Dashboard to pull funds.</td></tr>
                ) : (
                    txs.map((row) => (
                        <tr key={row.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-bold text-white">{row.contractName}</td>
                            <td className="p-4 font-mono text-sm text-gray-400">{row.to.slice(0, 6)}...{row.to.slice(-4)}</td>
                            <td className="p-4 font-mono text-[#14F195] font-bold">-{row.amount} SOL</td>
                            <td className="p-4 text-gray-500 text-sm">{new Date(row.timestamp).toLocaleString()}</td>
                            <td className="p-4 text-right">
                                <span className="inline-flex items-center gap-1 text-xs text-[#14F195] bg-[#14F195]/10 px-2 py-1 rounded border border-[#14F195]/20">
                                    <FileText size={10} /> Verified On-Chain
                                </span>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
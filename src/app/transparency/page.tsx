'use client';

import { MainNav } from '~/components/layout/main-nav';
import { ExternalLink, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { FUND_BASE, RPC_URL } from '~/lib/solana/client';

interface TxItem {
    signature: string;
    slot: number;
    blockTime: number;
    status: string;
}

export default function Transparency() {
  const [txs, setTxs] = useState<TxItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
        try {
            const connection = new Connection(RPC_URL, "confirmed");
            // Use the FUND_BASE (The wallet you generated)
            const pubkey = new PublicKey(FUND_BASE);
            const signatures = await connection.getSignaturesForAddress(pubkey, { limit: 10 });
            
            const items = signatures.map(sig => ({
                signature: sig.signature,
                slot: sig.slot,
                blockTime: sig.blockTime || Date.now()/1000,
                status: sig.err ? 'Failed' : 'Success'
            }));
            setTxs(items);
        } catch (e) {
            console.error("Failed to fetch history", e);
        } finally {
            setLoading(false);
        }
    };
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-[#020410] text-white">
      <MainNav />
      <div className="max-w-6xl mx-auto py-12 px-6">
        <h1 className="text-3xl font-bold mb-8">Live On-Chain Ledger</h1>
        
        <div className="bg-[#11131F] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 text-xs uppercase">
              <tr>
                <th className="p-4">Signature</th>
                <th className="p-4">Status</th>
                <th className="p-4">Time</th>
                <th className="p-4 text-right">Explorer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                {loading ? (
                    <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="animate-spin inline mr-2"/> Loading Blockchain Data...</td></tr>
                ) : txs.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-gray-500">No transactions found on Devnet yet. Make a donation!</td></tr>
                ) : (
                    txs.map((row) => (
                        <tr key={row.signature} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-mono text-sm text-gray-300 truncate max-w-[200px]">{row.signature}</td>
                            <td className="p-4"><span className="bg-[#14F195]/10 text-[#14F195] text-xs px-2 py-1 rounded">{row.status}</span></td>
                            <td className="p-4 text-gray-500 text-sm">{new Date(row.blockTime * 1000).toLocaleString()}</td>
                            <td className="p-4 text-right">
                                <a href={`https://explorer.solana.com/tx/${row.signature}?cluster=devnet`} target="_blank" className="text-[#9945FF] text-xs hover:underline flex items-center justify-end gap-1">
                                    View <ExternalLink size={10} />
                                </a>
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
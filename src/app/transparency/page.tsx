'use client';

import { MainNav } from '~/components/layout/main-nav';
import {
  Loader2,
  FileText,
  ExternalLink,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import {
  getWithdrawalTransactions,
  getDonationTransactions,
  WithdrawalTransaction,
} from '~/lib/solana/transactions';
import { Button } from '~/components/ui/button';

type TransactionType = 'all' | 'withdrawals' | 'donations';

interface DisplayTransaction extends WithdrawalTransaction {
  type: 'withdrawal' | 'donation';
}

export default function Transparency() {
  const [transactions, setTransactions] = useState<DisplayTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TransactionType>('all');
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      const [withdrawals, donations] = await Promise.all([
        getWithdrawalTransactions(50),
        getDonationTransactions(50),
      ]);

      const allTxs: DisplayTransaction[] = [
        ...withdrawals.map((tx) => ({ ...tx, type: 'withdrawal' as const })),
        ...donations.map((tx) => ({ ...tx, type: 'donation' as const })),
      ];

      // Sort by timestamp descending
      allTxs.sort((a, b) => b.timestamp - a.timestamp);

      setTransactions(allTxs);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'all') return true;
    if (filter === 'withdrawals') return tx.type === 'withdrawal';
    if (filter === 'donations') return tx.type === 'donation';
    return true;
  });

  const totalDonated = transactions
    .filter((tx) => tx.type === 'donation')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalWithdrawn = transactions
    .filter((tx) => tx.type === 'withdrawal')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="min-h-screen bg-[#020410] text-white">
      <MainNav />
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Transparency Ledger</h1>
            <p className="text-gray-400">
              Real-time on-chain transactions from Solana Devnet. All data is
              fetched directly from the blockchain.
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw
              size={14}
              className={refreshing ? 'animate-spin' : ''}
            />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-[#11131F] p-4">
            <p className="text-xs uppercase tracking-wider text-gray-400">
              Total Transactions
            </p>
            <p className="mt-1 font-mono text-2xl font-bold text-white">
              {transactions.length}
            </p>
          </div>
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
            <p className="text-xs uppercase tracking-wider text-green-400">
              Total Donated
            </p>
            <p className="mt-1 font-mono text-2xl font-bold text-green-400">
              +{totalDonated.toFixed(4)} SOL
            </p>
          </div>
          <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
            <p className="text-xs uppercase tracking-wider text-orange-400">
              Total Withdrawn
            </p>
            <p className="mt-1 font-mono text-2xl font-bold text-orange-400">
              -{totalWithdrawn.toFixed(4)} SOL
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-4 flex gap-2">
          {(['all', 'donations', 'withdrawals'] as TransactionType[]).map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            )
          )}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-white/5 bg-[#11131F]">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-xs uppercase text-gray-400">
              <tr>
                <th className="p-4">Type</th>
                <th className="p-4">Pool</th>
                <th className="p-4">Wallet</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Explorer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <Loader2 className="mr-2 inline animate-spin" />
                    Fetching from Solana blockchain...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No transactions found. Donate or withdraw to see activity.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr
                    key={tx.signature}
                    className="transition-colors hover:bg-white/5"
                  >
                    <td className="p-4">
                      <div
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
                          tx.type === 'donation'
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-orange-500/10 text-orange-400'
                        }`}
                      >
                        {tx.type === 'donation' ? (
                          <ArrowDownRight size={12} />
                        ) : (
                          <ArrowUpRight size={12} />
                        )}
                        {tx.type === 'donation' ? 'Donation' : 'Withdrawal'}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-white">{tx.poolName}</td>
                    <td className="p-4 font-mono text-sm text-gray-400">
                      {tx.recipient.slice(0, 4)}...{tx.recipient.slice(-4)}
                    </td>
                    <td
                      className={`p-4 font-mono font-bold ${
                        tx.type === 'donation'
                          ? 'text-green-400'
                          : 'text-orange-400'
                      }`}
                    >
                      {tx.type === 'donation' ? '+' : '-'}
                      {tx.amount.toFixed(4)} SOL
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {tx.timestamp
                        ? new Date(tx.timestamp).toLocaleString()
                        : 'Unknown'}
                    </td>
                    <td className="p-4 text-right">
                      <a
                        href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded border border-[#14F195]/20 bg-[#14F195]/10 px-2 py-1 text-xs text-[#14F195] transition-colors hover:bg-[#14F195]/20"
                      >
                        <FileText size={10} />
                        View
                        <ExternalLink size={10} />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Info Footer */}
        <div className="mt-8 rounded-lg border border-blue-500/10 bg-blue-500/5 p-4">
          <p className="text-xs text-gray-400">
            <span className="font-bold text-blue-400">100% On-Chain Data</span>{' '}
            — All transactions shown here are fetched directly from Solana
            Devnet using{' '}
            <code className="rounded bg-black/30 px-1">
              getSignaturesForAddress
            </code>{' '}
            and{' '}
            <code className="rounded bg-black/30 px-1">
              getParsedTransaction
            </code>
            . Click &quot;View&quot; to verify any transaction on Solana
            Explorer.
          </p>
        </div>
      </div>
    </div>
  );
}
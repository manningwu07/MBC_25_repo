'use client';

import { MainNav } from '~/components/layout/main-nav';
import { Download, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Transparency() {
  const outflows = [
    {
      id: 1,
      to: 'Medical Supplies Co.',
      cause: 'Gaza Relief',
      amount: '5,400 USDC',
      date: '2025-11-20',
      tx: '3x9...2a1',
    },
    {
      id: 2,
      to: 'Local Logistics LLC',
      cause: 'Ukraine Fund',
      amount: '12,200 USDC',
      date: '2025-11-19',
      tx: '8z2...9cc',
    },
    {
      id: 3,
      to: 'Water Filters Inc',
      cause: 'Clean Water',
      amount: '2,100 USDC',
      date: '2025-11-18',
      tx: '1p0...5mm',
    },
  ];

  return (
    <div className="min-h-screen bg-[#020410] text-white">
      <MainNav />

      <motion.div
        className="max-w-6xl mx-auto py-12 px-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <motion.div
          className="flex justify-between items-end mb-8"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: 0.05 }}
        >
          <div>
            <h1 className="text-3xl font-bold">Transparency Reports</h1>
            <p className="text-gray-400 mt-2">
              Public ledger of all fund outflows from NGO sub-wallets.
            </p>
          </div>
          <button className="flex items-center gap-2 text-sm text-[#14F195] hover:underline">
            <Download size={16} /> Export CSV
          </button>
        </motion.div>

        <motion.div
          className="bg-[#11131F] border border-white/5 rounded-xl overflow-hidden"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: 0.1 }}
        >
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Recipient</th>
                <th className="p-4">Source Fund</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {outflows.map((row, idx) => (
                <motion.tr
                  key={row.id}
                  className="hover:bg-white/5 transition-colors"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut', delay: 0.12 + idx * 0.04 }}
                >
                  <td className="p-4 font-medium">{row.to}</td>
                  <td className="p-4 text-gray-400">{row.cause}</td>
                  <td className="p-4 font-mono text-[#14F195]">{row.amount}</td>
                  <td className="p-4 text-gray-500 text-sm">{row.date}</td>
                  <td className="p-4 text-right">
                    <a
                      href="#"
                      className="inline-flex items-center gap-1 text-xs text-[#9945FF] hover:text-white"
                    >
                      {row.tx} <ExternalLink size={10} />
                    </a>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </motion.div>
    </div>
  );
}
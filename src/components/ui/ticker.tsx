'use client';

import { useEffect, useState } from 'react';
import { 
  getDonationTransactions, 
  getWithdrawalTransactions, 
} from '~/lib/solana/transactions';

export function Ticker() {
  const [items, setItems] = useState<string[]>([
    "Initializing Solana connection...",
    "Fetching live transactions..."
  ]);

  useEffect(() => {
    async function fetchTickerData() {
      try {
        const [donations, withdrawals] = await Promise.all([
          getDonationTransactions(5), // Get last 5 donations
          getWithdrawalTransactions(5) // Get last 5 withdrawals
        ]);

        const tickerItems: string[] = [];

        // Add donations
        donations.forEach(tx => {
          tickerItems.push(`New Donation: +${tx.amount.toFixed(2)} SOL to ${tx.poolName}`);
        });

        // Add withdrawals
        withdrawals.forEach(tx => {
          tickerItems.push(`Aid Deployed: -${tx.amount.toFixed(2)} SOL from ${tx.poolName} to ${tx.recipient.slice(0,4)}...`);
        });

        // Add system stats if list is short
        if (tickerItems.length < 5) {
          tickerItems.push("Solana Mainnet: Operational");
          tickerItems.push("Circle CCTP: Active");
        }

        setItems(tickerItems);
      } catch (e) {
        console.error("Ticker update failed", e);
        setItems([
          "Solana Network: Online", 
          "Tracking Global Relief Funds",
          "Real-time settlement enabled"
        ]);
      }
    }

    fetchTickerData();
    const interval = setInterval(fetchTickerData, 15000); // Update every 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#050505] border-t border-white/10 h-10 flex items-center overflow-hidden relative z-50">
      <div className="absolute left-0 bg-[#050505] px-4 z-10 text-xs font-bold text-gray-500 h-full flex items-center border-r border-white/10">
        LIVE FEED
      </div>
      <div className="flex whitespace-nowrap animate-ticker">
         {/* Duplicate items for infinite scroll effect */}
         {[...items, ...items, ...items].map((text, i) => (
            <div key={i} className="flex items-center gap-8 px-4">
                <span className="text-xs text-gray-400">
                  {text.includes('+') ? (
                    <>
                      {text.split('+')[0]} 
                      <span className="text-[#14F195] font-mono">+{text.split('+')[1]}</span>
                    </>
                  ) : text.includes('-') ? (
                    <>
                      {text.split('-')[0]} 
                      <span className="text-orange-400 font-mono">-{text.split('-')[1]}</span>
                    </>
                  ) : (
                    <span className="text-blue-400">{text}</span>
                  )}
                </span>
                <span className="w-1 h-1 rounded-full bg-white/20"></span>
            </div>
         ))}
      </div>
      <style jsx>{`
        @keyframes ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33%); }
        }
        .animate-ticker {
            animation: ticker 40s linear infinite;
        }
      `}</style>
    </div>
  );
}
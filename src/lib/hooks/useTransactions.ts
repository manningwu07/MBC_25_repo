'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getWithdrawalTransactions,
  getDonationTransactions,
  WithdrawalTransaction,
} from '~/lib/solana/transactions';

const STORAGE_KEY = 'solana_aid_transactions';
const CACHE_TTL = 60_000 * 10; // 1 minute

interface CachedTransactions {
  withdrawals: WithdrawalTransaction[];
  donations: WithdrawalTransaction[];
  timestamp: number;
}

function getFromStorage(): CachedTransactions | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed: CachedTransactions = JSON.parse(stored);
    const isExpired = Date.now() - parsed.timestamp > CACHE_TTL;

    return isExpired ? null : parsed;
  } catch {
    return null;
  }
}

function saveToStorage(data: CachedTransactions): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save transactions to localStorage:', e);
  }
}

async function fetchTransactions(): Promise<CachedTransactions> {
  // Check localStorage first
  const cached = getFromStorage();
  if (cached) {
    return cached;
  }

  // Fetch from chain
  const [withdrawals, donations] = await Promise.all([
    getWithdrawalTransactions(50),
    getDonationTransactions(50),
  ]);

  const data: CachedTransactions = {
    withdrawals,
    donations,
    timestamp: Date.now(),
  };

  saveToStorage(data);
  return data;
}

export function useTransactions() {
  return useQuery<CachedTransactions>({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
    staleTime: CACHE_TTL,
    gcTime: 5 * 60_000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useRefreshTransactions() {
  const clearCache = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return clearCache;
}
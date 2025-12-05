'use client';

import { useQuery } from '@tanstack/react-query';
import { getAllPools, PoolInfo } from '~/lib/solana/pools';

export function usePools() {
  return useQuery<PoolInfo[]>({
    queryKey: ['pools'],
    queryFn: getAllPools,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchInterval: 60_000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function usePool(poolId: number) {
  const { data: pools, ...rest } = usePools();
  return {
    ...rest,
    data: pools?.find((p) => p.id === poolId) ?? null,
  };
}
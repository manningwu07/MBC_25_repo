// src/lib/causes.ts

export const WALLETS = {
  RED_CROSS_ETH: process.env.NEXT_PUBLIC_RED_CROSS_ETH,
  RED_CROSS_SOL: process.env.NEXT_PUBLIC_RED_CROSS_SOL,
  UKRAINE_FUND: process.env.NEXT_PUBLIC_UKRAINE_FUND,
  GAZA_FUND: process.env.NEXT_PUBLIC_GAZA_FUND,
  SUDAN_FUND: process.env.NEXT_PUBLIC_SUDAN_FUND,
};

export interface Cause {
  id: string;
  poolId: number; // <-- ADD THIS: Maps to on-chain pool ID
  name: string;
  description: string;
  location: { lat: number; lng: number };
  usdc_raised: number;
  wallet_address: string;
  tags: string[];
}

// Pool IDs match your scripts/types.ts
export const CAUSES: Cause[] = [
  {
    id: 'ukraine-aid',
    poolId: 3000, // matches "food" pool from your scripts
    name: 'Ukraine Humanitarian Fund',
    description:
      'Medical supplies and emergency housing for displaced families in Kyiv and Kharkiv regions.',
    location: { lat: 48.3794, lng: 31.1656 },
    usdc_raised: 450200.5,
    wallet_address: WALLETS.UKRAINE_FUND || '',
    tags: ['Medical', 'Housing', 'Emergency'],
  },
  {
    id: 'gaza-relief',
    poolId: 129, // matches "water" pool
    name: 'Gaza Emergency Relief',
    description:
      'Direct food aid, water purification, and medical assistance for civilians.',
    location: { lat: 31.5, lng: 34.4667 },
    usdc_raised: 890120.0,
    wallet_address: WALLETS.GAZA_FUND || '',
    tags: ['Food', 'Water', 'Medical'],
  },
  {
    id: 'sudan-crisis',
    poolId: 130, // matches "shelter" pool
    name: 'Sudan Displacement Support',
    description:
      'Support for families fleeing conflict zones with shelter and essential goods.',
    location: { lat: 12.8628, lng: 30.2176 },
    usdc_raised: 125000.75,
    wallet_address: WALLETS.SUDAN_FUND || '',
    tags: ['Shelter', 'Food'],
  },
];

export function getCauseById(id: string) {
  return CAUSES.find((c) => c.id === id);
}

export function getCauseByPoolId(poolId: number) {
  return CAUSES.find((c) => c.poolId === poolId);
}
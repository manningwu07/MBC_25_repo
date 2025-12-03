/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';

/**
 * Devnet "chain" description.
 * NOTE: Privy's Chain typing expects a very specific shape.
 * Casting to `any` here keeps TypeScript happy for our dev/test flow.
 * Replace the `as any` casts with the library's Chain type in prod.
 */
const solanaDevnet = {
  id: 101, // numeric id to avoid TS complaints (arbitrary non-conflicting number)
  network: 'solana-devnet',
  name: 'Solana Devnet',
  nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
  rpcUrls: {
    default: { http: ['https://api.devnet.solana.com'] },
    public: { http: ['https://api.devnet.solana.com'] },
  },
  blockExplorers: {
    default: { name: 'Solana Explorer', url: 'https://explorer.solana.com/?cluster=devnet' },
  },
} as any;

const solanaConnectors = toSolanaWalletConnectors({
  shouldAutoConnect: true,
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Mark mounted so we only initialize Privy on the client
    // Schedule the state update asynchronously to avoid calling setState synchronously inside the effect
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  if (!mounted) return <>{children}</>;

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'insert-privy-app-id'}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#14f195',
          logo: '/favicon.ico',
        },
        externalWallets: {
          solana: {
            connectors: solanaConnectors,
          },
        },
        // Dev-only: cast to `any` to satisfy types. Replace with proper Chain type later.
        defaultChain: solanaDevnet as any,
        supportedChains: [solanaDevnet as any],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import { useEffect, useState } from 'react';

const solanaDevnet = {
  id: 101, // 101 is the numeric ID for Solana Devnet in many registries
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
} as const;

const sepolia = {
  id: 11155111,
  network: 'sepolia',
  name: 'Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.sepolia.org'] },
    public: { http: ['https://rpc.sepolia.org'] },
  },
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
  },
} as const;

// Make sure this is outside the component to avoid re-initialization
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
        supportedChains: [solanaDevnet, sepolia],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
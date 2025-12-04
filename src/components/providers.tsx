'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import {
  createSolanaRpc,
  createSolanaRpcSubscriptions,
} from '@solana/kit';

const solanaDevnet = {
  id: 101,
  network: 'solana-devnet',
  name: 'Solana Devnet',
  nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
  rpcUrls: {
    default: { http: ['https://api.devnet.solana.com'] },
    public: { http: ['https://api.devnet.solana.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Solana Explorer',
      url: 'https://explorer.solana.com/?cluster=devnet',
    },
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

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  //New: Memoize solana connectors with proper config
  const solanaConnectors = useMemo(
    () =>
      toSolanaWalletConnectors({
        shouldAutoConnect: false,
      }),
    []
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return <>{children}</>;

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'insert-privy-app-id'}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#14f195',
          logo: '/favicon.ico',
          walletChainType: 'ethereum-and-solana',
          walletList: [
            'detected_solana_wallets',
            'phantom',
            'detected_ethereum_wallets'
          ],
        },
        solana: {
          rpcs: {
            'solana:devnet': {
              rpc: createSolanaRpc('https://api.devnet.solana.com'),
              rpcSubscriptions: createSolanaRpcSubscriptions(
                'wss://api.devnet.solana.com'
              ),
            },
          },
        },
        externalWallets: { solana: { connectors: solanaConnectors } },
        supportedChains: [solanaDevnet, sepolia],
        defaultChain: solanaDevnet
      }}
    >
      {children}
    </PrivyProvider>
  );
}
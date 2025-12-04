/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/kit';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { clusterApiUrl } from '@solana/web3.js';

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

  const solanaConnectors = useMemo(
    () => toSolanaWalletConnectors({ shouldAutoConnect: true }),
    []
  );
  const solanaWallets = useMemo(() => [new PhantomWalletAdapter()], []);
  const endpoint = useMemo(() => clusterApiUrl('devnet'), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <>{children}</>;

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={solanaWallets} autoConnect>
        <PrivyProvider
          appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
          config={{
            appearance: {
              theme: 'dark',
              accentColor: '#14f195',
              logo: '/favicon.ico',
              walletChainType: 'ethereum-and-solana',
              walletList: ['detected_solana_wallets', 'phantom', 'detected_ethereum_wallets'],
            },
            solana: {
              rpcs: {
                'solana:devnet': {
                  rpc: createSolanaRpc('https://api.devnet.solana.com'),
                  rpcSubscriptions: createSolanaRpcSubscriptions('wss://api.devnet.solana.com'),
                },
              },
            },
            externalWallets: { solana: { connectors: solanaConnectors } },
            supportedChains: [solanaDevnet, sepolia],
            defaultChain: solanaDevnet,
          }}
        >
          {children}
        </PrivyProvider>
      </WalletProvider>
    </ConnectionProvider >
  );
}
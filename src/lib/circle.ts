// src/lib/circle.ts
import { encodeFunctionData, parseUnits, getAddress } from 'viem';
import { PublicKey } from '@solana/web3.js';

// ============================================
// CCTP V2 Testnet Addresses
// ============================================

export const SEPOLIA_TOKEN_MESSENGER = getAddress(
  '0x9f3B8679c73C2F338593d1268802e00a6FD98a60'
);
export const SEPOLIA_USDC = getAddress(
  '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
);

export const SOLANA_DESTINATION_DOMAIN = 5;
export const USDC_DEVNET_MINT = new PublicKey(
  '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'
);

// ============================================
// ABIs
// ============================================

const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
] as const;

const TOKEN_MESSENGER_ABI = [
  {
    name: 'depositForBurn',
    type: 'function',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'destinationDomain', type: 'uint32' },
      { name: 'mintRecipient', type: 'bytes32' },
      { name: 'burnToken', type: 'address' },
    ],
    outputs: [{ name: 'nonce', type: 'uint64' }],
    stateMutability: 'nonpayable',
  },
] as const;

// ============================================
// HELPERS
// ============================================

/**
 * Convert a Solana address (base58) to bytes32 format required by CCTP
 */
function solanaAddressToBytes32(address: string): `0x${string}` {
  const pubKey = new PublicKey(address);
  const buffer = pubKey.toBuffer();
  const hex = buffer.toString('hex').padStart(64, '0');
  return `0x${hex}`;
}

/**
 * Build the calldata for ERC20 approve
 */
export function buildApproveData(amountUSDC: number): `0x${string}` {
  const amountWei = parseUnits(amountUSDC.toString(), 6);
  return encodeFunctionData({
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [SEPOLIA_TOKEN_MESSENGER, amountWei],
  });
}

/**
 * Build the calldata for depositForBurn (CCTP)
 */
export function buildBurnData(
  amountUSDC: number,
  recipientSolanaAddress: string
): `0x${string}` {
  const amountWei = parseUnits(amountUSDC.toString(), 6);
  const recipientBytes32 = solanaAddressToBytes32(recipientSolanaAddress);

  return encodeFunctionData({
    abi: TOKEN_MESSENGER_ABI,
    functionName: 'depositForBurn',
    args: [amountWei, SOLANA_DESTINATION_DOMAIN, recipientBytes32, SEPOLIA_USDC],
  });
}

// ============================================
// ATTESTATION POLLING
// ============================================

/**
 * Poll Circle's Iris API for attestation (simplified for hackathon)
 *
 * In production:
 * 1. Get MessageSent event from tx receipt
 * 2. Hash the message bytes
 * 3. Poll https://iris-api-sandbox.circle.com/attestations/{messageHash}
 * 4. Wait for status: "complete"
 * 5. Use attestation to mint on destination chain
 */
export async function pollForAttestation(txHash: string): Promise<string> {
  console.log(`Polling Circle Iris API for tx: ${txHash}`);

  // Simulate ~15 second attestation wait for demo
  await new Promise((r) => setTimeout(r, 10000));

  console.log('Attestation received (simulated for hackathon demo)');
  return '0xMOCK_ATTESTATION';
}
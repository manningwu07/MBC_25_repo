// src/lib/circle.ts
import { encodeFunctionData, parseUnits, getAddress, keccak256 } from 'viem';
import { PublicKey } from '@solana/web3.js';

// ============================================
// CCTP V2 Testnet Addresses (CORRECTED)
// ============================================

// Sepolia (Ethereum Testnet)
export const SEPOLIA_TOKEN_MESSENGER = getAddress(
  '0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa'
);
export const SEPOLIA_USDC = getAddress(
  '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
);

// Domain IDs
export const ETHEREUM_SEPOLIA_DOMAIN = 0;
export const SOLANA_DESTINATION_DOMAIN = 5;

// Solana Devnet
export const USDC_DEVNET_MINT = new PublicKey(
  '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'
);

// Attestation API
export const IRIS_API_TESTNET = 'https://iris-api-sandbox.circle.com';
export const IRIS_API_MAINNET = 'https://iris-api.circle.com';

// ============================================
// ABIs (CCTP V2)
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

// CCTP V2 TokenMessengerV2 ABI
const TOKEN_MESSENGER_V2_ABI = [
  {
    name: 'depositForBurn',
    type: 'function',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'destinationDomain', type: 'uint32' },
      { name: 'mintRecipient', type: 'bytes32' },
      { name: 'burnToken', type: 'address' },
      { name: 'destinationCaller', type: 'bytes32' },
      { name: 'maxFee', type: 'uint256' },
      { name: 'minFinalityThreshold', type: 'uint32' },
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
 * Build the calldata for depositForBurn (CCTP V2)
 */
export function buildBurnData(
  amountUSDC: number,
  recipientSolanaAddress: string
): `0x${string}` {
  const amountWei = parseUnits(amountUSDC.toString(), 6);
  const recipientBytes32 = solanaAddressToBytes32(recipientSolanaAddress);

  // Empty bytes32 = any address can call receiveMessage on destination
  const destinationCaller =
    '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`;

  // Max fee in USDC (6 decimals) - 0.5 USDC max fee
  const maxFee = parseUnits('0.5', 6);

  // Finality threshold: 2000 = finalized, lower = faster but less secure
  const minFinalityThreshold = 2000;

  return encodeFunctionData({
    abi: TOKEN_MESSENGER_V2_ABI,
    functionName: 'depositForBurn',
    args: [
      amountWei,
      SOLANA_DESTINATION_DOMAIN,
      recipientBytes32,
      SEPOLIA_USDC,
      destinationCaller,
      maxFee,
      minFinalityThreshold,
    ],
  });
}

// ============================================
// ATTESTATION POLLING (REAL IMPLEMENTATION)
// ============================================

interface AttestationResponse {
  attestation: string | null;
  status: 'complete' | 'pending_confirmations';
}

/**
 * Get message hash from transaction logs
 * In a real implementation, you'd parse the MessageSent event
 */
export async function getMessageHashFromTx(
  txHash: string,
  publicClient: unknown
): Promise<string> {
  // For hackathon demo, we'll simulate this
  // In production: parse MessageSent event from tx receipt, keccak256 the message bytes
  console.log(`Getting message hash from tx: ${txHash}`);

  // Simulate getting the message hash
  // Real implementation would parse the MessageSent event
  return keccak256(`0x${txHash.slice(2)}`);
}

/**
 * Poll Circle's Iris API for attestation
 */
export async function pollForAttestation(
  txHash: string,
  maxAttempts = 60,
  intervalMs = 5000
): Promise<string> {
  console.log(`Polling Circle Iris API for tx: ${txHash}`);

  // For hackathon demo, simulate the attestation wait
  // Real implementation would:
  // 1. Parse MessageSent event from tx receipt
  // 2. keccak256 hash the message bytes
  // 3. Poll /v1/attestations/{messageHash}

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // In production, you would:
      // const messageHash = await getMessageHashFromTx(txHash, publicClient);
      // const response = await fetch(`${IRIS_API_TESTNET}/v1/attestations/${messageHash}`);
      // const data: AttestationResponse = await response.json();

      // if (data.status === 'complete' && data.attestation) {
      //   return data.attestation;
      // }

      // For demo: simulate ~30 second wait
      await new Promise((r) => setTimeout(r, intervalMs));

      if (attempt > 5) {
        // Simulate success after ~30 seconds
        console.log('Attestation received (simulated for hackathon demo)');
        return '0xMOCK_ATTESTATION_' + txHash.slice(0, 10);
      }

      console.log(
        `Waiting for attestation... attempt ${attempt + 1}/${maxAttempts}`
      );
    } catch (error) {
      console.error('Attestation polling error:', error);
    }
  }

  throw new Error('Attestation timeout - message may still be processing');
}

/**
 * Real attestation polling (for production use)
 */
export async function pollForAttestationReal(
  messageHash: string,
  isTestnet = true,
  maxAttempts = 60,
  intervalMs = 5000
): Promise<string> {
  const baseUrl = isTestnet ? IRIS_API_TESTNET : IRIS_API_MAINNET;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(
        `${baseUrl}/v1/attestations/${messageHash}`
      );
      const data: AttestationResponse = await response.json();

      if (data.status === 'complete' && data.attestation) {
        console.log('Attestation received!');
        return data.attestation;
      }

      console.log(
        `Attestation pending... attempt ${attempt + 1}/${maxAttempts}`
      );
      await new Promise((r) => setTimeout(r, intervalMs));
    } catch (error) {
      console.error('Attestation polling error:', error);
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }

  throw new Error('Attestation timeout');
}
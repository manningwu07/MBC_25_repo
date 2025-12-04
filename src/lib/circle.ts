// src/lib/circle.ts
import { encodeFunctionData, parseUnits, getAddress } from 'viem';
import { PublicKey } from '@solana/web3.js';

// --------------------------------------------
// CONFIGURATION (Public CCTP V2 Testnet Addresses)
// --------------------------------------------

// Sepolia (ETH) Contracts - Using getAddress for checksum validation
export const SEPOLIA_TOKEN_MESSENGER = getAddress(
  '0x9f3B8679c73C2F338593d1268802e00a6FD98a60'
);
export const SEPOLIA_USDC = getAddress(
  '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
);
export const ETH_DOMAIN = 0;

// Solana Devnet
export const SOLANA_DESTINATION_DOMAIN = 5;
export const USDC_DEVNET_MINT = new PublicKey(
  '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'
);

// ABIs (minimal for our needs)
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

// --------------------------------------------
// HELPERS
// --------------------------------------------

/**
 * Convert a Solana address (base58) to bytes32 format required by CCTP
 */
function solanaAddressToBytes32(address: string): `0x${string}` {
  try {
    const pubKey = new PublicKey(address);
    const buffer = pubKey.toBuffer();
    // Ensure it's exactly 32 bytes, padded if necessary
    const hex = buffer.toString('hex').padStart(64, '0');
    return `0x${hex}`;
  } catch (e) {
    console.error('Invalid Solana address:', address, e);
    throw new Error('Invalid Solana recipient address');
  }
}

// --------------------------------------------
// MAIN BRIDGE FUNCTION
// --------------------------------------------

export async function initiateCCTPBridge(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ethWallet: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider: any,
  amountUSDC: number,
  recipientSolanaAddress: string
): Promise<string> {
  console.log('=== CCTP Bridge Initiated ===');
  console.log('Amount:', amountUSDC, 'USDC');
  console.log('Recipient (Solana):', recipientSolanaAddress);
  console.log('ETH Wallet:', ethWallet.address);

  // 1. Convert amount to 6 decimals (USDC standard)
  const amountWei = parseUnits(amountUSDC.toString(), 6);

  // 2. Convert Solana address to bytes32
  const recipientBytes32 = solanaAddressToBytes32(recipientSolanaAddress);
  console.log('Recipient Bytes32:', recipientBytes32);

  // 3. APPROVE USDC spend
  console.log('Step 1: Approving USDC...');
  const approveData = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [SEPOLIA_TOKEN_MESSENGER, amountWei],
  });

  try {
    const approveTxHash = await provider.request({
     method: 'eth_sendTransaction',
     params: [{
       from: ethWallet.address,
       to: SEPOLIA_USDC,
       data: approveData,
     }],
   });
   console.log('Approval TX:', approveTxHash);
  } catch (e) {
    console.error('Approval failed:', e);
    throw new Error('Failed to approve USDC. Please try again.');
  }

  // Wait for approval to be mined
  console.log('Waiting for approval confirmation...');
  await new Promise((r) => setTimeout(r, 5000));

  // 4. DEPOSIT FOR BURN
  console.log('Step 2: Depositing for Burn...');
  const burnData = encodeFunctionData({
    abi: TOKEN_MESSENGER_ABI,
    functionName: 'depositForBurn',
    args: [
      amountWei,
      SOLANA_DESTINATION_DOMAIN,
      recipientBytes32,
      SEPOLIA_USDC,
    ],
  });

  let burnReceipt;
  try {
    burnReceipt = await sendTransaction(
      {
        to: SEPOLIA_TOKEN_MESSENGER,
        data: burnData,
        chainId: 11155111,
      },
      { wallet: ethWallet }
    );
    console.log('Burn TX:', burnReceipt);
  } catch (e) {
    console.error('Burn failed:', e);
    throw new Error('Failed to burn USDC. Please try again.');
  }

  // Extract tx hash from receipt (Privy returns different formats)
  const txHash =
    burnReceipt?.hash ||
    burnReceipt?.transactionHash ||
    (typeof burnReceipt === 'string' ? burnReceipt : null);

  if (!txHash) {
    console.error('No tx hash in receipt:', burnReceipt);
    throw new Error('Transaction submitted but no hash returned');
  }

  console.log('=== CCTP Burn Complete ===');
  console.log('TX Hash:', txHash);

  return txHash;
}

// --------------------------------------------
// ATTESTATION POLLING (Simplified for hackathon)
// --------------------------------------------

export async function pollForAttestation(txHash: string): Promise<string> {
  console.log(`Polling Circle Iris API for tx: ${txHash}`);

  // In production, you would:
  // 1. Get the MessageSent event from the tx receipt
  // 2. Hash the message bytes
  // 3. Poll https://iris-api-sandbox.circle.com/attestations/{messageHash}
  // 4. Wait for status: "complete"

  // For hackathon demo, we simulate the ~20 second wait time
  await new Promise((r) => setTimeout(r, 8000));

  console.log('Attestation received (simulated)');
  return '0xMOCK_ATTESTATION_FOR_DEMO';
}
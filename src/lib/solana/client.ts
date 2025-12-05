// src/lib/solana/client.ts
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';
import { USDC_DEVNET_MINT } from '~/lib/circle';
import { PROGRAM_ID } from './idl';


export const connection = new Connection(
  process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com',
  'confirmed'
);

const programId = new PublicKey(PROGRAM_ID);

// ============================================
// HELPERS
// ============================================

/**
 * Write a u64 (number) as little-endian bytes
 * Browser-compatible alternative to Buffer.writeBigUInt64LE
 */
function u64ToLEBytes(value: number): Uint8Array {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  // Split into low and high 32-bit parts
  view.setUint32(0, value >>> 0, true); // low 32 bits, little-endian
  view.setUint32(4, Math.floor(value / 0x100000000) >>> 0, true); // high 32 bits
  return new Uint8Array(buffer);
}

/**
 * Write a bigint as u64 little-endian bytes
 */
function bigintToLEBytes(value: bigint): Uint8Array {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  const low = Number(value & BigInt(0xffffffff));
  const high = Number((value >> BigInt(32)) & BigInt(0xffffffff));
  view.setUint32(0, low, true);
  view.setUint32(4, high, true);
  return new Uint8Array(buffer);
}

// ============================================
// PDA DERIVATION
// ============================================

export function getPoolPda(poolId: number): [PublicKey, number] {
  const poolIdBytes = u64ToLEBytes(poolId);

  return PublicKey.findProgramAddressSync(
    [Buffer.from('pool'), Buffer.from(poolIdBytes)],
    programId
  );
}

export function getNgoPda(wallet: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('ngo'), wallet.toBuffer()],
    programId
  );
}

// ============================================
// INSTRUCTION BUILDERS
// ============================================

/**
 * Build donate_to_pool instruction
 */
function buildDonateToPoolInstruction(
  donor: PublicKey,
  poolPda: PublicKey,
  amountLamports: bigint
): TransactionInstruction {
  const discriminator = new Uint8Array([219, 179, 202, 183, 26, 49, 206, 250]);
  const amountBytes = bigintToLEBytes(amountLamports);

  const data = new Uint8Array(discriminator.length + amountBytes.length);
  data.set(discriminator, 0);
  data.set(amountBytes, discriminator.length);

  return new TransactionInstruction({
    keys: [
      { pubkey: donor, isSigner: true, isWritable: true },
      { pubkey: poolPda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId,
    data: Buffer.from(data),
  });
}

/**
 * Build withdraw_from_pool instruction
 * Discriminator: [160, 72, 135, 2, 4, 117, 213, 115]
 */
function buildWithdrawFromPoolInstruction(
  ngoWallet: PublicKey,
  ngoPda: PublicKey,
  poolPda: PublicKey,
  amountLamports: bigint
): TransactionInstruction {
  const discriminator = new Uint8Array([62, 33, 128, 81, 40, 234, 29, 77]);
  const amountBytes = bigintToLEBytes(amountLamports);

  const data = new Uint8Array(discriminator.length + amountBytes.length);
  data.set(discriminator, 0);
  data.set(amountBytes, discriminator.length);

  return new TransactionInstruction({
    keys: [
      { pubkey: ngoWallet, isSigner: true, isWritable: true },
      { pubkey: ngoPda, isSigner: false, isWritable: true },
      { pubkey: poolPda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ],
    programId,
    data: Buffer.from(data),
  });
}

// ============================================
// TRANSACTION BUILDERS
// ============================================

/**
 * Build a donation transaction to a pool using the smart contract
 */
export async function buildDonateToPoolTx(
  donor: PublicKey,
  poolId: number,
  amountSol: number
): Promise<Transaction> {
  const [poolPda] = getPoolPda(poolId);
  const amountLamports = BigInt(Math.floor(amountSol * LAMPORTS_PER_SOL));

  console.log('Pool PDA:', poolPda.toBase58());
  console.log('Amount lamports:', amountLamports.toString());

  const ix = buildDonateToPoolInstruction(donor, poolPda, amountLamports);

  const tx = new Transaction().add(ix);

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.lastValidBlockHeight = lastValidBlockHeight;
  tx.feePayer = donor;

  return tx;
}

/**
 * Build a withdrawal transaction for NGOs
 */
export async function buildWithdrawFromPoolTx(
  ngoWallet: PublicKey,
  poolId: number,
  amountSol: number
): Promise<Transaction> {
  const [poolPda] = getPoolPda(poolId);
  const [ngoPda] = getNgoPda(ngoWallet);
  const amountLamports = BigInt(Math.floor(amountSol * LAMPORTS_PER_SOL));

  const ix = buildWithdrawFromPoolInstruction(
    ngoWallet,
    ngoPda,
    poolPda,
    amountLamports
  );

  const tx = new Transaction().add(ix);

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.lastValidBlockHeight = lastValidBlockHeight;
  tx.feePayer = ngoWallet;

  return tx;
}

/**
 * Fetch pool data from chain
 */
export async function fetchPoolData(poolId: number) {
  const [poolPda] = getPoolPda(poolId);

  const accountInfo = await connection.getAccountInfo(poolPda);
  if (!accountInfo) {
    return null;
  }

  // Skip 8-byte discriminator
  const data = accountInfo.data.slice(8);
  const view = new DataView(
    data.buffer,
    data.byteOffset,
    data.byteLength
  );

  // Parse Pool struct
  const idLow = view.getUint32(0, true);
  const idHigh = view.getUint32(4, true);
  const id = idLow + idHigh * 0x100000000;

  const nameLen = view.getUint32(8, true);
  const name = new TextDecoder().decode(data.slice(12, 12 + nameLen));
  const offset = 12 + nameLen;

  const totalDonatedLow = view.getUint32(offset, true);
  const totalDonatedHigh = view.getUint32(offset + 4, true);
  const totalDonated = totalDonatedLow + totalDonatedHigh * 0x100000000;

  const totalWithdrawnLow = view.getUint32(offset + 8, true);
  const totalWithdrawnHigh = view.getUint32(offset + 12, true);
  const totalWithdrawn = totalWithdrawnLow + totalWithdrawnHigh * 0x100000000;

  const isActive = data[offset + 16] === 1;
  const bump = data[offset + 17];

  return {
    id,
    name,
    totalDonated: totalDonated / LAMPORTS_PER_SOL,
    totalWithdrawn: totalWithdrawn / LAMPORTS_PER_SOL,
    isActive,
    bump,
    address: poolPda.toBase58(),
  };
}

// ============================================
// LEGACY FUNCTIONS (for USDC transfers)
// ============================================

export async function buildDirectSolTransfer(
  from: PublicKey,
  amount: number,
  to: PublicKey
): Promise<Transaction> {
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from,
      toPubkey: to,
      lamports: Math.floor(amount * LAMPORTS_PER_SOL),
    })
  );

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.lastValidBlockHeight = lastValidBlockHeight;
  tx.feePayer = from;

  return tx;
}

export async function buildUSDCTransferTx(
  from: PublicKey,
  amountUSDC: number,
  to: PublicKey
): Promise<Transaction> {
  const fromAta = await getAssociatedTokenAddress(USDC_DEVNET_MINT, from);
  const toAta = await getAssociatedTokenAddress(USDC_DEVNET_MINT, to);

  const tx = new Transaction();

  const toAccountInfo = await connection.getAccountInfo(toAta);
  if (!toAccountInfo) {
    tx.add(
      createAssociatedTokenAccountInstruction(from, toAta, to, USDC_DEVNET_MINT)
    );
  }

  tx.add(
    createTransferInstruction(
      fromAta,
      toAta,
      from,
      Math.floor(amountUSDC * 1_000_000)
    )
  );

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.lastValidBlockHeight = lastValidBlockHeight;
  tx.feePayer = from;

  return tx;
}
// src/lib/solana/client.ts
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';
import { USDC_DEVNET_MINT } from '~/lib/circle';

export const connection = new Connection(
  process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com',
  'confirmed'
);

/**
 * Build a SOL transfer transaction
 */
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

/**
 * Build a USDC SPL token transfer transaction
 */
export async function buildUSDCTransferTx(
  from: PublicKey,
  amountUSDC: number,
  to: PublicKey
): Promise<Transaction> {
  // Get Associated Token Accounts
  const fromAta = await getAssociatedTokenAddress(USDC_DEVNET_MINT, from);
  const toAta = await getAssociatedTokenAddress(USDC_DEVNET_MINT, to);

  const tx = new Transaction();

  // Check if receiver has an ATA, if not, create it
  const toAccountInfo = await connection.getAccountInfo(toAta);
  if (!toAccountInfo) {
    tx.add(
      createAssociatedTokenAccountInstruction(
        from, // payer
        toAta, // associatedToken
        to, // owner
        USDC_DEVNET_MINT // mint
      )
    );
  }

  // Add Transfer Instruction (USDC has 6 decimals)
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
import { Connection, PublicKey, clusterApiUrl, ParsedTransactionWithMeta } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import idl from './solana_aid.json';

const DEVNET_RPC = process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl('devnet');
const PROGRAM_ID = new PublicKey(idl.address);

export interface WithdrawalTransaction {
  signature: string;
  poolId: number;
  poolName: string;
  amount: number; // in SOL
  recipient: string;
  timestamp: number;
  slot: number;
}

export const TRANSACTION_POOL_NAMES: Record<number, string> = {
  0: 'Ukraine Humanitarian Fund',
  1: 'Gaza Emergency Relief',
  2: 'Sudan Displacement Support',
};

/**
 * Get pool PDA address
 */
function getPoolPda(poolId: number): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('pool'), new BN(poolId).toArrayLike(Buffer, 'le', 8)],
    PROGRAM_ID
  );
  return pda;
}

/**
 * Fetch withdrawal transactions from the blockchain
 */
export async function getWithdrawalTransactions(
  limit: number = 50
): Promise<WithdrawalTransaction[]> {
  const connection = new Connection(DEVNET_RPC, 'confirmed');
  const withdrawals: WithdrawalTransaction[] = [];

  // Check all known pools
  const poolIds = [0, 1, 2];

  for (const poolId of poolIds) {
    const poolPda = getPoolPda(poolId);

    try {
      // Get recent signatures for this pool
      const signatures = await connection.getSignaturesForAddress(poolPda, {
        limit: Math.ceil(limit / poolIds.length),
      });

      // Fetch and parse each transaction
      for (const sigInfo of signatures) {
        try {
          const tx = await connection.getParsedTransaction(sigInfo.signature, {
            maxSupportedTransactionVersion: 0,
          });

          if (!tx || !tx.meta) continue;

          // Check if this is a withdrawal (pool balance decreased)
          const preBalance = tx.meta.preBalances[1]; // Pool is usually account index 1
          const postBalance = tx.meta.postBalances[1];

          if (preBalance > postBalance) {
            // This is a withdrawal
            const amountLamports = preBalance - postBalance;
            const amountSol = amountLamports / 1e9;

            // Get recipient (the signer/ngo_wallet)
            const recipient =
              tx.transaction.message.accountKeys[0]?.pubkey?.toString() ||
              'Unknown';

            withdrawals.push({
              signature: sigInfo.signature,
              poolId,
              poolName: TRANSACTION_POOL_NAMES[poolId] || `Pool ${poolId}`,
              amount: amountSol,
              recipient,
              timestamp: (sigInfo.blockTime || 0) * 1000,
              slot: sigInfo.slot,
            });
          }
        } catch (parseError) {
          console.error('Error parsing transaction:', parseError);
        }
      }
    } catch (error) {
      console.error(`Error fetching signatures for pool ${poolId}:`, error);
    }
  }

  // Sort by timestamp descending (newest first)
  withdrawals.sort((a, b) => b.timestamp - a.timestamp);

  return withdrawals.slice(0, limit);
}

/**
 * Fetch donation transactions from the blockchain
 */
export async function getDonationTransactions(
  limit: number = 50
): Promise<WithdrawalTransaction[]> {
  const connection = new Connection(DEVNET_RPC, 'confirmed');
  const donations: WithdrawalTransaction[] = [];

  const poolIds = [0, 1, 2];

  for (const poolId of poolIds) {
    const poolPda = getPoolPda(poolId);

    try {
      const signatures = await connection.getSignaturesForAddress(poolPda, {
        limit: Math.ceil(limit / poolIds.length),
      });

      for (const sigInfo of signatures) {
        try {
          const tx = await connection.getParsedTransaction(sigInfo.signature, {
            maxSupportedTransactionVersion: 0,
          });

          if (!tx || !tx.meta) continue;

          // Check if this is a donation (pool balance increased)
          const preBalance = tx.meta.preBalances[1];
          const postBalance = tx.meta.postBalances[1];

          if (postBalance > preBalance) {
            const amountLamports = postBalance - preBalance;
            const amountSol = amountLamports / 1e9;

            const donor =
              tx.transaction.message.accountKeys[0]?.pubkey?.toString() ||
              'Anonymous';

            donations.push({
              signature: sigInfo.signature,
              poolId,
              poolName: TRANSACTION_POOL_NAMES[poolId] || `Pool ${poolId}`,
              amount: amountSol,
              recipient: donor, // In this case, it's the donor
              timestamp: (sigInfo.blockTime || 0) * 1000,
              slot: sigInfo.slot,
            });
          }
        } catch (parseError) {
          console.error('Error parsing transaction:', parseError);
        }
      }
    } catch (error) {
      console.error(`Error fetching signatures for pool ${poolId}:`, error);
    }
  }

  donations.sort((a, b) => b.timestamp - a.timestamp);
  return donations.slice(0, limit);
}

/**
 * Fetch all transactions (both donations and withdrawals)
 */
export async function getAllTransactions(
  limit: number = 100
): Promise<{
  withdrawals: WithdrawalTransaction[];
  donations: WithdrawalTransaction[];
}> {
  const [withdrawals, donations] = await Promise.all([
    getWithdrawalTransactions(limit),
    getDonationTransactions(limit),
  ]);

  return { withdrawals, donations };
}
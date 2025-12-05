import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { PublicKey, Connection, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { SolanaAid } from './solana_aid';
import idl from './solana_aid.json';

const DEVNET_RPC = process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl('devnet');

export interface PoolInfo {
  id: number;
  name: string;
  totalDonated: BN;
  totalWithdrawn: BN;
  isActive: boolean;
  balanceLamports: number;
  balanceSol: number;
}

export const POOL_NAMES: Record<number, string> = {
  0: 'Ukraine Humanitarian Fund',
  1: 'Gaza Emergency Relief',
  2: 'Sudan Displacement Support',
};

/**
 * Get pool info by ID
 */
export async function getPoolById(poolId: number): Promise<PoolInfo | null> {
  try {
    const connection = new Connection(DEVNET_RPC, 'confirmed');
    const programId = new PublicKey(idl.address);

    const [poolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('pool'), new BN(poolId).toArrayLike(Buffer, 'le', 8)],
      programId
    );

    const accountInfo = await connection.getAccountInfo(poolPda);

    if (!accountInfo) {
      return null;
    }

    // Decode account data
    const program = new Program(
      idl as never,
      new AnchorProvider(connection, {} as never, { commitment: 'confirmed' })
    ) as unknown as Program<SolanaAid>;

    const decoded = program.coder.accounts.decode('pool', accountInfo.data);

    // Get actual lamport balance of the PDA
    const balanceLamports = accountInfo.lamports;

    return {
      id: decoded.id.toNumber(),
      name: decoded.name || POOL_NAMES[poolId] || `Pool ${poolId}`,
      totalDonated: decoded.totalDonated,
      totalWithdrawn: decoded.totalWithdrawn,
      isActive: decoded.isActive,
      balanceLamports,
      balanceSol: balanceLamports / LAMPORTS_PER_SOL,
    };
  } catch (error) {
    console.error('Error fetching pool info:', error);
    return null;
  }
}

/**
 * Get all pools that an NGO has access to
 */
export async function getPoolsForNgo(
  allowedPoolIds: number[]
): Promise<PoolInfo[]> {
  const pools: PoolInfo[] = [];

  for (const poolId of allowedPoolIds) {
    const pool = await getPoolById(poolId);
    if (pool) {
      pools.push(pool);
    }
  }

  return pools;
}

/**
 * Get all pools (for display purposes)
 */
export async function getAllPools(): Promise<PoolInfo[]> {
  const poolIds = [0, 1, 2]; // Known pool IDs
  const pools: PoolInfo[] = [];

  for (const poolId of poolIds) {
    const pool = await getPoolById(poolId);
    if (pool) {
      pools.push(pool);
    }
  }

  return pools;
}
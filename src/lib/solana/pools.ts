import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import {
  PublicKey,
  Connection,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { SolanaAid } from './solana_aid';
import idl from './solana_aid.json';

const DEVNET_RPC = process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl('devnet');
const POOL_IDS = [0, 1, 2];

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

function getPoolPdas(programId: PublicKey): PublicKey[] {
  return POOL_IDS.map((poolId) => {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('pool'), new BN(poolId).toArrayLike(Buffer, 'le', 8)],
      programId
    );
    return pda;
  });
}

/**
 * Batch fetch ALL pools in a single RPC call
 */
export async function getAllPools(): Promise<PoolInfo[]> {
  const connection = new Connection(DEVNET_RPC, 'confirmed');
  const programId = new PublicKey(idl.address);
  const poolPdas = getPoolPdas(programId);

  const accounts = await connection.getMultipleAccountsInfo(poolPdas);

  const program = new Program(
    idl as never,
    new AnchorProvider(connection, {} as never, { commitment: 'confirmed' })
  ) as unknown as Program<SolanaAid>;

  const pools: PoolInfo[] = [];

  accounts.forEach((account, index) => {
    if (!account) return;

    const decoded = program.coder.accounts.decode('pool', account.data);
    const poolId = POOL_IDS[index];

    pools.push({
      id: decoded.id.toNumber(),
      name: decoded.name || POOL_NAMES[poolId] || `Pool ${poolId}`,
      totalDonated: decoded.totalDonated,
      totalWithdrawn: decoded.totalWithdrawn,
      isActive: decoded.isActive,
      balanceLamports: account.lamports,
      balanceSol: account.lamports / LAMPORTS_PER_SOL,
    });
  });

  return pools;
}

/**
 * Get single pool from batch fetch
 */
export async function getPoolById(poolId: number): Promise<PoolInfo | null> {
  const pools = await getAllPools();
  return pools.find((p) => p.id === poolId) ?? null;
}

/**
 * Get pools for specific IDs
 */
export async function getPoolsForNgo(
  allowedPoolIds: number[]
): Promise<PoolInfo[]> {
  const pools = await getAllPools();
  return pools.filter((p) => allowedPoolIds.includes(p.id));
}
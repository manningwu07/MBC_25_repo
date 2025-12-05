import { BN, Program, AnchorProvider } from '@coral-xyz/anchor';
import {
  Connection,
  PublicKey,
  clusterApiUrl,
  Transaction,
  VersionedTransaction,
} from '@solana/web3.js';
import { SolanaAid } from './solana_aid';
import idl from './solana_aid.json';

const DEVNET_RPC = process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl('devnet');

export interface WalletAdapter {
  publicKey: PublicKey;
  signTransaction<T extends Transaction | VersionedTransaction>(
    tx: T
  ): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(
    txs: T[]
  ): Promise<T[]>;
}

export interface NgoInfo {
  wallet: PublicKey;
  isActive: boolean;
  allowedPools: number[];
  dailyLimit: BN;
  withdrawnToday: BN;
  lastWithdrawDay: BN;
}

/**
 * Get the program instance with a wallet
 */
function getProgram(wallet: WalletAdapter) {
  const connection = new Connection(DEVNET_RPC, 'confirmed');
  const provider = new AnchorProvider(connection, wallet as never, {
    commitment: 'confirmed',
  });
  return new Program(idl as never, provider) as unknown as Program<SolanaAid>;
}

/**
 * Get a read-only program instance (no wallet needed)
 */
function getReadOnlyProgram() {
  const connection = new Connection(DEVNET_RPC, 'confirmed');
  return {
    connection,
    programId: new PublicKey(idl.address),
  };
}

/**
 * Check if a wallet is a registered NGO
 */
export async function getNgoInfo(
  walletAddress: string
): Promise<NgoInfo | null> {
  try {
    const { connection, programId } = getReadOnlyProgram();
    const walletPubkey = new PublicKey(walletAddress);

    // Derive the NGO PDA
    const [ngoPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('ngo'), walletPubkey.toBuffer()],
      programId
    );

    const accountInfo = await connection.getAccountInfo(ngoPda);

    if (!accountInfo) {
      return null;
    }

    // Decode the account data using Anchor
    const program = new Program(
      idl as never,
      new AnchorProvider(connection, {} as never, { commitment: 'confirmed' })
    ) as unknown as Program<SolanaAid>;

    const decoded = program.coder.accounts.decode('ngo', accountInfo.data);

    return {
      wallet: decoded.wallet,
      isActive: decoded.isActive,
      allowedPools: decoded.allowedPools.map((p: BN) => p.toNumber()),
      dailyLimit: decoded.dailyLimit,
      withdrawnToday: decoded.withdrawnToday,
      lastWithdrawDay: decoded.lastWithdrawDay,
    };
  } catch (error) {
    console.error('Error fetching NGO info:', error);
    return null;
  }
}

/**
 * Donate SOL (lamports) to a pool using the on-chain program
 */
export async function donateToPool(
  wallet: WalletAdapter,
  poolId: number,
  amountSol: number
): Promise<string> {
  const program = getProgram(wallet);

  // Derive the pool PDA
  const [poolPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('pool'), new BN(poolId).toArrayLike(Buffer, 'le', 8)],
    program.programId
  );

  // Convert SOL to lamports
  const lamports = new BN(Math.floor(amountSol * 1e9));

  // Call donate_to_pool instruction
  const tx = await (
    program.methods as unknown as {
      donateToPool: (amount: BN) => {
        accounts: (accounts: { pool: PublicKey }) => {
          rpc: () => Promise<string>;
        };
      };
    }
  )
    .donateToPool(lamports)
    .accounts({
      pool: poolPda,
    })
    .rpc();

  return tx;
}

/**
 * Withdraw from pool (for registered NGOs only)
 */
export async function withdrawFromPool(
  wallet: WalletAdapter,
  poolId: number,
  amountSol: number
): Promise<string> {
  const program = getProgram(wallet);

  // Derive PDAs
  const [poolPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('pool'), new BN(poolId).toArrayLike(Buffer, 'le', 8)],
    program.programId
  );

  const [ngoPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('ngo'), wallet.publicKey.toBuffer()],
    program.programId
  );

  const lamports = new BN(Math.floor(amountSol * 1e9));

  const tx = await (
    program.methods as unknown as {
      withdrawFromPool: (amount: BN) => {
        accounts: (accounts: { ngo: PublicKey; pool: PublicKey }) => {
          rpc: () => Promise<string>;
        };
      };
    }
  )
    .withdrawFromPool(lamports)
    .accounts({
      ngo: ngoPda,
      pool: poolPda,
    })
    .rpc();

  return tx;
}
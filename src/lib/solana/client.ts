import { ResultAsync } from 'neverthrow';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import type { FundState, DonationError } from './types';

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com';
const PROGRAM_ID = new PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

export const getFundState = (fundAddress: string): ResultAsync<FundState, DonationError> => {
  return ResultAsync.fromPromise(
    (async () => {
      const connection = new Connection(RPC_URL);
      const pubkey = new PublicKey(fundAddress);
      const accountInfo = await connection.getAccountInfo(pubkey);

      if (!accountInfo) throw new Error("Account not found");

      const totalRaisedLamports = Number(accountInfo.data.readBigUInt64LE(40));
      
      return {
        address: fundAddress,
        totalRaised: totalRaisedLamports / LAMPORTS_PER_SOL,
        authority: "Authority_Address_Here"
      };
    })(),
    (e) => ({ message: e instanceof Error ? e.message : "Unknown error fetching fund state" })
  );
};

export const createDonationTransaction = (
  donor: string,
  fund: string,
  amountSol: number
): ResultAsync<any, DonationError> => {
  return ResultAsync.fromPromise(
    (async () => {
      return {
        success: true,
        mockInstruction: `Transfer ${amountSol} SOL from ${donor} to ${fund}`
      }
    })(),
    (e) => ({ message: "Failed to construct transaction" })
  );
};

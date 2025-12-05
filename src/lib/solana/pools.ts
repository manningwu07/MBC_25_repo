import { program } from "./program";
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

import { SolanaAid } from "./solana_aid";


export interface Pool {
	name: string,
	id: number,
}

export interface PoolInfo {
	name: string,
	donated: BN,
	withdrawn: BN,
	active: boolean,
}

export const all_pools: Pool[] = [
	{ name: "Ukraine", id: 0 },
	{ name: "Gaza", id: 1 },
	{ name: "Sudan", id: 2 },
];


export async function get_pool_by_id(id: Number): Promise<PoolInfo | null> {

	const [poolPda] = PublicKey.findProgramAddressSync(
		[Buffer.from("pool"), new BN(id).toArrayLike(Buffer, "le", 8)],
		program.programId
	)

	const account = await program.provider.connection.getAccountInfo(poolPda);

	if (!account) {
		return null;
	}

	const decoded = program.coder.accounts.decode("pool", account.data);
	return {
		name: decoded.id,
		donated: decoded.totalDonated,
		withdrawn: decoded.totalWithdrawn,
		active: decoded.isActive
	}

}

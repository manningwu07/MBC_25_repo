export interface FundState {
	address: string;
	totalRaised: number;
	authority: string;
}

export interface DonationError {
	message: string;
	code?: number;
}
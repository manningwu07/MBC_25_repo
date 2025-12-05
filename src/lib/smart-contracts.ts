// lib/smart-contracts.ts
import { CAUSES, WALLETS } from "./causes";

export interface FundContract {
  id: string;
  name: string;
  address: string;
  balance: number; // In SOL
  whitelist: string[]; // List of authorized wallet addresses
}

export interface ContractTransaction {
    id: string;
    contractId: string;
    contractName: string;
    amount: number; 
    to: string;
    timestamp: number;
    status: 'Success' | 'Pending';
}

// Convert CAUSES to Contract State
const INITIAL_CONTRACTS: FundContract[] = CAUSES.map(c => ({
  id: c.id,
  name: c.name,
  address: c.wallet_address,
  balance: c.usdc_raised,
  whitelist: [WALLETS.RED_CROSS_ETH, WALLETS.RED_CROSS_SOL].filter((w): w is string => w !== undefined)
}));

export const getContracts = (): FundContract[] => {
    if (typeof window === 'undefined') return INITIAL_CONTRACTS;
    const stored = localStorage.getItem('mock_contracts_state');
    if (!stored) {
      localStorage.setItem('mock_contracts_state', JSON.stringify(INITIAL_CONTRACTS));
      return INITIAL_CONTRACTS;
    }
    return JSON.parse(stored);
};

// Helper to whitelist a user (simulates 'add_ngo' instruction)
export const joinContract = async (contractId: string, walletAddress: string) => {
  const contracts = getContracts();
  const updated = contracts.map(c => {
    if (c.id === contractId && !c.whitelist.includes(walletAddress)) {
      return { ...c, whitelist: [...c.whitelist, walletAddress] };
    }
    return c;
  });
  localStorage.setItem('mock_contracts_state', JSON.stringify(updated));
  await new Promise(r => setTimeout(r, 1000)); // Fake network delay
  return updated;
};

// Helper to withdraw (simulates 'withdraw_fund' instruction)
export const withdrawFromContract = async (
  contractId: string,
  amount: number,
  _contractName: string,
  requesterAddress: string
) => {
  const contracts = getContracts();
  const contract = contracts.find((c) => c.id === contractId);

  if (!contract) throw new Error('Contract not found');

  if (!contract.whitelist.includes(requesterAddress)) {
    throw new Error(
      `ACCESS DENIED: Wallet ${requesterAddress.slice(0, 6)}... is not whitelisted for ${contract.name}`
    );
  }

  if (amount > contract.balance)
    throw new Error('Insufficient funds in smart contract');

  const updated = contracts.map((c) => {
    if (c.id === contractId) return { ...c, balance: c.balance - amount };
    return c;
  });

  recordTransaction(contractId, contract.name, amount, requesterAddress);

  localStorage.setItem('mock_contracts_state', JSON.stringify(updated));
  await new Promise((r) => setTimeout(r, 1000));
  return true;
};

// Transactions:
export const getTransactions = (): ContractTransaction[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('mock_txs');
    return stored ? JSON.parse(stored) : [];
};

export const recordTransaction = (
    contractId: string, 
    contractName: string, 
    amount: number, 
    toAddress: string
) => {
    const txs = getTransactions();
    const newTx: ContractTransaction = {
        id: Math.random().toString(36).substring(7),
        contractId,
        contractName,
        amount,
        to: toAddress,
        timestamp: Date.now(),
        status: 'Success'
    };
    localStorage.setItem('mock_txs', JSON.stringify([newTx, ...txs]));
};
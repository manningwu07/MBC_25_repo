// lib/smart-contracts.ts

export interface FundContract {
  id: string;
  name: string;
  address: string;
  balance: number; // In SOL
  whitelist: string[]; // List of authorized wallet addresses
}

// Initial "On-Chain" State
const INITIAL_CONTRACTS: FundContract[] = [
  {
    id: 'ukraine-fund',
    name: 'Ukraine Crisis Fund',
    address: '9gb3vHPq52Z9nc9CMTNcxcqvUMLLEhor8KU3qMVKMEJK', // Your generated Fund Wallet
    balance: 1450.5,
    whitelist: ['2ypyDnf2zU8DgMtW8Urjv7G1ZddAAANjRK1WyL7QxLDv'] // Your generated NGO Wallet
  },
  {
    id: 'gaza-relief',
    name: 'Gaza Relief Wallet',
    address: '8xP2...9z1A',
    balance: 890.2,
    whitelist: []
  },
  {
    id: 'clean-water',
    name: 'Clean Water Initiative',
    address: 'C4k1...1b2D',
    balance: 3200.0,
    whitelist: []
  }
];

// Helper to get state (simulates fetching accounts)
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
export const withdrawFromContract = async (contractId: string, amount: number) => {
  const contracts = getContracts();
  const updated = contracts.map(c => {
    if (c.id === contractId) {
      return { ...c, balance: c.balance - amount };
    }
    return c;
  });
  localStorage.setItem('mock_contracts_state', JSON.stringify(updated));
  await new Promise(r => setTimeout(r, 2000)); // Fake network delay
  return updated;
};
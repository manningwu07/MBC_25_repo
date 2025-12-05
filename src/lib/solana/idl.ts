// src/lib/solana/idl.ts
export const SOLANA_AID_IDL = {
  version: '0.1.0',
  name: 'solana_aid',
  address: 'BCm48SATqUi4zUCgYav4KGgnpDqg1tnsLfw7i4HwGE3J',
  instructions: [
    {
      name: 'donateToPool',
      discriminator: [219, 179, 202, 183, 26, 49, 206, 250],
      accounts: [
        { name: 'donor', writable: true, signer: true },
        { name: 'pool', writable: true },
        { name: 'systemProgram', address: '11111111111111111111111111111111' },
      ],
      args: [{ name: 'amount', type: 'u64' }],
    },
    {
      name: 'withdrawFromPool',
      discriminator: [62, 33, 128, 81, 40, 234, 29, 77],
      accounts: [
        { name: 'ngoWallet', writable: true, signer: true },
        { name: 'ngo', writable: true },
        { name: 'pool', writable: true },
        { name: 'systemProgram', address: '11111111111111111111111111111111' },
        { name: 'clock', address: 'SysvarC1ock11111111111111111111111111111111' },
        { name: 'rent', address: 'SysvarRent111111111111111111111111111111111' },
      ],
      args: [{ name: 'amount', type: 'u64' }],
    },
  ],
  accounts: [
    {
      name: 'Pool',
      discriminator: [241, 154, 109, 4, 17, 177, 109, 188],
    },
    {
      name: 'Ngo',
      discriminator: [138, 32, 44, 252, 51, 112, 87, 39],
    },
  ],
  types: [
    {
      name: 'Pool',
      type: {
        kind: 'struct',
        fields: [
          { name: 'id', type: 'u64' },
          { name: 'name', type: 'string' },
          { name: 'totalDonated', type: 'u64' },
          { name: 'totalWithdrawn', type: 'u64' },
          { name: 'isActive', type: 'bool' },
          { name: 'bump', type: 'u8' },
        ],
      },
    },
    {
      name: 'Ngo',
      type: {
        kind: 'struct',
        fields: [
          { name: 'wallet', type: 'pubkey' },
          { name: 'isActive', type: 'bool' },
          { name: 'allowedPools', type: { vec: 'u64' } },
          { name: 'dailyLimit', type: 'u64' },
          { name: 'withdrawnToday', type: 'u64' },
          { name: 'lastWithdrawDay', type: 'i64' },
          { name: 'bump', type: 'u8' },
        ],
      },
    },
  ],
} as const;

export const PROGRAM_ID = 'BCm48SATqUi4zUCgYav4KGgnpDqg1tnsLfw7i4HwGE3J';
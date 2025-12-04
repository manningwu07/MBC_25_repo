export interface FundState {
	address: string;
	totalRaised: number;
	authority: string;
}

export interface DonationError {
	message: string;
	code?: number;
}

/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/mbc25c.json`.
 */
export type Mbc25c = {
	"address": "BCm48SATqUi4zUCgYav4KGgnpDqg1tnsLfw7i4HwGE3J",
	"metadata": {
		"name": "mbc25c",
		"version": "0.1.0",
		"spec": "0.1.0",
		"description": "Created with Anchor"
	},
	"instructions": [
		{
			"name": "initialize",
			"discriminator": [
				175,
				175,
				109,
				31,
				13,
				152,
				155,
				237
			],
			"accounts": [],
			"args": []
		}
	]
};


/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solana_aid.json` of the smart contract repository.
 */

export type SolanaAid = {
	"address": "BCm48SATqUi4zUCgYav4KGgnpDqg1tnsLfw7i4HwGE3J",
	"metadata": {
		"name": "solanaAid",
		"version": "0.1.0",
		"spec": "0.1.0",
		"description": "Created with Anchor"
	},
	"instructions": [
		{
			"name": "createPool",
			"discriminator": [
				233,
				146,
				209,
				142,
				207,
				104,
				64,
				188
			],
			"accounts": [
				{
					"name": "admin",
					"writable": true,
					"signer": true,
					"relations": [
						"globalConfig"
					]
				},
				{
					"name": "globalConfig",
					"pda": {
						"seeds": [
							{
								"kind": "const",
								"value": [
									103,
									108,
									111,
									98,
									97,
									108,
									45,
									99,
									111,
									110,
									102,
									105,
									103
								]
							}
						]
					}
				},
				{
					"name": "pool",
					"writable": true,
					"pda": {
						"seeds": [
							{
								"kind": "const",
								"value": [
									112,
									111,
									111,
									108
								]
							},
							{
								"kind": "arg",
								"path": "id"
							}
						]
					}
				},
				{
					"name": "systemProgram",
					"address": "11111111111111111111111111111111"
				}
			],
			"args": [
				{
					"name": "id",
					"type": "u64"
				},
				{
					"name": "name",
					"type": "string"
				}
			]
		},
		{
			"name": "donateToPool",
			"discriminator": [
				219,
				179,
				202,
				183,
				26,
				49,
				206,
				250
			],
			"accounts": [
				{
					"name": "donor",
					"writable": true,
					"signer": true
				},
				{
					"name": "pool",
					"writable": true,
					"pda": {
						"seeds": [
							{
								"kind": "const",
								"value": [
									112,
									111,
									111,
									108
								]
							},
							{
								"kind": "account",
								"path": "pool.id",
								"account": "pool"
							}
						]
					}
				},
				{
					"name": "systemProgram",
					"address": "11111111111111111111111111111111"
				}
			],
			"args": [
				{
					"name": "amount",
					"type": "u64"
				}
			]
		},
		{
			"name": "initializeGlobalConfig",
			"discriminator": [
				113,
				216,
				122,
				131,
				225,
				209,
				22,
				55
			],
			"accounts": [
				{
					"name": "payer",
					"writable": true,
					"signer": true
				},
				{
					"name": "globalConfig",
					"writable": true,
					"pda": {
						"seeds": [
							{
								"kind": "const",
								"value": [
									103,
									108,
									111,
									98,
									97,
									108,
									45,
									99,
									111,
									110,
									102,
									105,
									103
								]
							}
						]
					}
				},
				{
					"name": "systemProgram",
					"address": "11111111111111111111111111111111"
				}
			],
			"args": [
				{
					"name": "admin",
					"type": "pubkey"
				}
			]
		},
		{
			"name": "registerNgo",
			"discriminator": [
				5,
				168,
				204,
				75,
				108,
				93,
				89,
				244
			],
			"accounts": [
				{
					"name": "admin",
					"writable": true,
					"signer": true,
					"relations": [
						"globalConfig"
					]
				},
				{
					"name": "globalConfig",
					"pda": {
						"seeds": [
							{
								"kind": "const",
								"value": [
									103,
									108,
									111,
									98,
									97,
									108,
									45,
									99,
									111,
									110,
									102,
									105,
									103
								]
							}
						]
					}
				},
				{
					"name": "ngoWallet"
				},
				{
					"name": "ngo",
					"writable": true,
					"pda": {
						"seeds": [
							{
								"kind": "const",
								"value": [
									110,
									103,
									111
								]
							},
							{
								"kind": "account",
								"path": "ngoWallet"
							}
						]
					}
				},
				{
					"name": "systemProgram",
					"address": "11111111111111111111111111111111"
				}
			],
			"args": [
				{
					"name": "allowedPools",
					"type": {
						"vec": "u64"
					}
				},
				{
					"name": "dailyLimit",
					"type": "u64"
				}
			]
		},
		{
			"name": "withdrawFromPool",
			"discriminator": [
				62,
				33,
				128,
				81,
				40,
				234,
				29,
				77
			],
			"accounts": [
				{
					"name": "ngoWallet",
					"writable": true,
					"signer": true
				},
				{
					"name": "ngo",
					"writable": true,
					"pda": {
						"seeds": [
							{
								"kind": "const",
								"value": [
									110,
									103,
									111
								]
							},
							{
								"kind": "account",
								"path": "ngoWallet"
							}
						]
					}
				},
				{
					"name": "pool",
					"writable": true,
					"pda": {
						"seeds": [
							{
								"kind": "const",
								"value": [
									112,
									111,
									111,
									108
								]
							},
							{
								"kind": "account",
								"path": "pool.id",
								"account": "pool"
							}
						]
					}
				},
				{
					"name": "systemProgram",
					"address": "11111111111111111111111111111111"
				},
				{
					"name": "clock",
					"address": "SysvarC1ock11111111111111111111111111111111"
				},
				{
					"name": "rent",
					"address": "SysvarRent111111111111111111111111111111111"
				}
			],
			"args": [
				{
					"name": "amount",
					"type": "u64"
				}
			]
		}
	],
	"accounts": [
		{
			"name": "globalConfig",
			"discriminator": [
				149,
				8,
				156,
				202,
				160,
				252,
				176,
				217
			]
		},
		{
			"name": "ngo",
			"discriminator": [
				196,
				139,
				181,
				149,
				140,
				80,
				247,
				106
			]
		},
		{
			"name": "pool",
			"discriminator": [
				241,
				154,
				109,
				4,
				17,
				177,
				109,
				188
			]
		}
	],
	"errors": [
		{
			"code": 6000,
			"name": "unauthorizedAdmin",
			"msg": "Unauthorized admin"
		},
		{
			"code": 6001,
			"name": "poolInactive",
			"msg": "Pool is inactive"
		},
		{
			"code": 6002,
			"name": "ngoNotActive",
			"msg": "NGO is not active"
		},
		{
			"code": 6003,
			"name": "ngoNotAllowedForPool",
			"msg": "NGO not allowed for this pool"
		},
		{
			"code": 6004,
			"name": "dailyLimitExceeded",
			"msg": "Daily limit exceeded"
		},
		{
			"code": 6005,
			"name": "insufficientFunds",
			"msg": "Insufficient funds available in pool"
		},
		{
			"code": 6006,
			"name": "overflow",
			"msg": "Math overflow"
		}
	],
	"types": [
		{
			"name": "globalConfig",
			"type": {
				"kind": "struct",
				"fields": [
					{
						"name": "admin",
						"type": "pubkey"
					},
					{
						"name": "bump",
						"type": "u8"
					}
				]
			}
		},
		{
			"name": "ngo",
			"type": {
				"kind": "struct",
				"fields": [
					{
						"name": "wallet",
						"type": "pubkey"
					},
					{
						"name": "isActive",
						"type": "bool"
					},
					{
						"name": "allowedPools",
						"type": {
							"vec": "u64"
						}
					},
					{
						"name": "dailyLimit",
						"type": "u64"
					},
					{
						"name": "withdrawnToday",
						"type": "u64"
					},
					{
						"name": "lastWithdrawDay",
						"type": "i64"
					},
					{
						"name": "bump",
						"type": "u8"
					}
				]
			}
		},
		{
			"name": "pool",
			"type": {
				"kind": "struct",
				"fields": [
					{
						"name": "id",
						"type": "u64"
					},
					{
						"name": "name",
						"type": "string"
					},
					{
						"name": "totalDonated",
						"type": "u64"
					},
					{
						"name": "totalWithdrawn",
						"type": "u64"
					},
					{
						"name": "isActive",
						"type": "bool"
					},
					{
						"name": "bump",
						"type": "u8"
					}
				]
			}
		}
	]
};


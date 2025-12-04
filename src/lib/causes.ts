// src/lib/causes.ts

export interface Cause {
  id: string;
  name: string;
  description: string;
  location: { lat: number; lng: number };
  usdc_raised: number;
  wallet_address: string;
  tags: string[];
}

export const CAUSES: Cause[] = [
  {
    id: "ukraine-aid",
    name: "Ukraine Humanitarian Fund",
    description: "Medical supplies and emergency housing for displaced families in Kyiv and Kharkiv regions.",
    location: { lat: 48.3794, lng: 31.1656 },
    usdc_raised: 450200.50,
    wallet_address: "UkraineRelief...KiNg",
    tags: ["Medical", "Housing", "Emergency"]
  },
  {
    id: "gaza-relief",
    name: "Gaza Emergency Relief",
    description: "Direct food aid, water purification, and medical assistance for civilians.",
    location: { lat: 31.5, lng: 34.4667 },
    usdc_raised: 890120.00,
    wallet_address: "GazaRelief...2Sjt",
    tags: ["Food", "Water", "Medical"]
  },
  {
    id: "sudan-crisis",
    name: "Sudan Displacement Support",
    description: "Support for families fleeing conflict zones with shelter and essential goods.",
    location: { lat: 12.8628, lng: 30.2176 },
    usdc_raised: 125000.75,
    wallet_address: "SudanFund...WvtI",
    tags: ["Shelter", "Food"]
  }
];

export function getCauseById(id: string) {
  return CAUSES.find(c => c.id === id);
}
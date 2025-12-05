# Solana-Aid: Decentralized Humanitarian Giving Platform

**MBC-25 Hackathon Submission - Solana Track**

A Solana-powered platform for fast, transparent, and accountable donations to verified NGOs during global crises. Built for **MBC-25 Hackathon** with Solana Actions (Blinks), smart contracts, and real-time globe visualization.

---

## Quick Start

### Prerequisites
- **Node.js** v18 or higher
- **npm** v9 or higher
- **Git**

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd solana-aid
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

---

## Project Structure

```
solana-aid/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── api/actions/        # Solana Actions endpoints
│   │   ├── causes/            # Causes page with 3D globe
│   │   ├── ngo-signup/        # NGO registration
│   │   ├── transparency/      # Transaction transparency
│   │   └── ...                # Other pages
│   ├── components/            # React components
│   ├── lib/                   # Utilities and Solana logic
│   │   └── solana/           # Solana-specific utilities
│   └── types/                 # TypeScript definitions
├── public/                    # Static assets
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Blockchain**: Solana with Anchor framework
- **Wallets**: Solana Wallet Adapter (Phantom, Solflare)
- **Actions**: Solana Actions (Blinks) for social donations
- **Styling**: Tailwind CSS + Framer Motion
- **Visualization**: React Globe for 3D map
- **Smart Contracts**: Rust (Anchor) with PDA-based pools

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `@solana/web3.js` | Solana blockchain interactions |
| `@solana/wallet-adapter-*` | Wallet connectivity |
| `@solana/actions` | Solana Actions (Blinks) |
| `next` | React framework |
| `react-globe.gl` | 3D globe visualization |
| `tailwindcss` | Styling framework |
| `@coral-xyz/anchor` | Smart contract interaction |

---

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Lint code
```

---

## Features

### Solana Actions (Blinks)
- One-click donations via social media
- `/api/actions/donate-sol` unified endpoint
- Support for multiple causes (Ukraine, Gaza, Sudan)

### Smart Contract Pools
- PDA-based secure fund storage
- Automated accounting (donated/withdrawn tracking)
- Whitelist management for NGOs

### Real-time Visualization
- 3D globe showing active crisis zones
- Live donation tracking and impact visualization
- Interactive cause selection

### Multi-Cause Support
- Ukraine Humanitarian Fund (Pool ID: 0)
- Gaza Emergency Relief (Pool ID: 1)
- Sudan Displacement Support (Pool ID: 2)

---

## License

MIT License - See LICENSE file for details.

---

## MBC-25 Hackathon

Built for the Solana track with focus on:
- Leveraging Solana's scalability, composability, and cost efficiency
- Solving practical problems for donors and NGOs
- Demonstrating fluency with Solana's SDKs and frameworks
- Showcasing creativity, originality, and strong technical execution
```
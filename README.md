```markdown
# Solana-Aid: Decentralized Humanitarian Giving

A Solana-powered platform for fast, transparent, and accountable donations to verified NGOs during global crises. Built for **MBC-25 Hackathon** with Polymarket data integration and Circle USDC support.

---

## 📋 Prerequisites

Before starting, ensure you have installed:

- **Node.js** v18 or higher (download from https://nodejs.org/)
- **npm** v9 or higher (comes with Node.js)
- **Git** (download from https://git-scm.com/)

To verify:
```bash
node --version
npm --version
git --version
```

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd solana-aid
```

### 2. Install Dependencies with `--legacy-peer-deps`

This project uses `--legacy-peer-deps` because of peer dependency conflicts between packages (primarily between React 18, Privy, and some Web3 libraries). This flag tells npm to ignore strict peer dependency validation.

```bash
npm install --legacy-peer-deps
```

**Why `--legacy-peer-deps`?**
- Privy (wallet auth) and Solana Web3.js have specific React peer dependency requirements
- `react-globe.gl` has loose peer dependency constraints
- Without this flag, npm would reject the installation entirely

**Alternative: Using `npm ci` (recommended for CI/CD)**
```bash
npm ci --legacy-peer-deps
```

---

## 🔐 Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Or manually create `.env.local` and add:

```env
# Solana RPC (Mainnet for Jupiter swaps)
NEXT_PUBLIC_RPC_URL=https://api.mainnet-beta.solana.com

# Fund Address Configuration
NEXT_PUBLIC_FUND_BASE=<YOUR_FUND_BASE_WALLET_ADDRESS>
NEXT_PUBLIC_FUND_ADDRESS=<YOUR_FUND_DERIVED_ADDRESS>
NEXT_PUBLIC_FUND_SEED=solana-direct-fund

# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=<YOUR_PRIVY_APP_ID>

# Circle/USDC Configuration (Optional for production)
CIRCLE_API_KEY=<YOUR_CIRCLE_API_KEY>
```

### Getting Privy App ID:
1. Visit https://dashboard.privy.io/
2. Create an application
3. Copy the **App ID** to `NEXT_PUBLIC_PRIVY_APP_ID`

---

## 🏃 Running the Project

### Development Mode

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm run start
```

---

## 📂 Project Structure

```
solana-aid/
├── app/
│   ├── page.tsx                 # Home page (hero with map background)
│   ├── causes/
│   │   └── page.tsx             # Causes page (Globe + Polymarket data)
│   ├── ngo-signup/
│   │   └── page.tsx             # NGO registration form
│   ├── transparency/
│   │   └── page.tsx             # Public fund outflow ledger
│   ├── about/
│   │   └── page.tsx             # About page
│   ├── layout.tsx               # Root layout with Privy provider
│   └── globals.css              # Global styles (Tailwind)
│
├── components/
│   ├── layout/
│   │   └── main-nav.tsx         # Shared navigation header
│   ├── dashboard/
│   │   ├── live-map.tsx         # 3D Globe with Polymarket overlay
│   │   └── transaction-feed.tsx # Live transaction ticker
│   └── ui/
│       ├── button.tsx           # Reusable button component
│       └── ticker.tsx           # Footer live feed ticker
│
├── lib/
│   ├── polymarket.ts            # Polymarket API integration
│   └── solana/
│       ├── client.ts            # Solana connection & Jupiter swap logic
│       └── types.ts             # TypeScript interfaces
│
├── public/                       # Static assets
├── .env.example                 # Example environment variables
├── tailwind.config.ts           # Tailwind CSS config
├── tsconfig.json                # TypeScript config
└── package.json                 # Dependencies
```

---

## 📦 Key Dependencies

| Package | Purpose | Why `--legacy-peer-deps` Matters |
|---------|---------|----------------------------------|
| `next` | React framework | - |
| `react`, `react-dom` | UI library | Privy requires React 18.x |
| `@privy-io/react-auth` | Wallet auth | Has loose peer deps for React |
| `@solana/web3.js` | Solana SDK | Requires specific Node versions |
| `react-globe.gl` | 3D globe visualization | Loose peer dependency on React |
| `framer-motion` | Animations | - |
| `tailwindcss` | CSS framework | - |
| `lucide-react` | Icon library | - |
| `clsx` | Class name utilities | - |
| `neverthrow` | Error handling | - |

---

## 🛠️ Common Issues & Troubleshooting

### Issue: "peer dep missing" errors even with `--legacy-peer-deps`

**Solution:** Clear npm cache and reinstall:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Issue: Port 3000 already in use

**Solution:** Kill existing process or use different port:
```bash
# Use different port
npm run dev -- -p 3001

# Or kill process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9
```

### Issue: `Module not found` errors

**Solution:** Ensure `~` alias is working by checking `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "~/*": ["./*"]
    }
  }
}
```

### Issue: Privy wallet connection fails

**Solution:** Verify environment variables:
```bash
# Check that these are set
echo $NEXT_PUBLIC_PRIVY_APP_ID
echo $NEXT_PUBLIC_RPC_URL
```

### Issue: Jupiter swap endpoint returns 503

**Solution:** Jupiter API might be rate-limited. Either:
- Use devnet instead (edit `NEXT_PUBLIC_RPC_URL`)
- Implement swap queuing/retries
- Use standard SOL transfer as fallback (already implemented)

---

## 💻 Development Tips

### Hot Reload
Next.js automatically reloads when you edit files. Changes appear instantly in the browser.

### Using macOS M4 Pro (Your Setup)
Everything should work out of the box. If you encounter ARM64 issues:
```bash
# Force npm to use correct architecture
npm install --legacy-peer-deps --arch=arm64
```

### Testing Wallets
- Use Phantom Wallet (Chrome extension) connected to **Devnet** for testing
- Get devnet SOL: https://solfaucet.com/

### Debugging
```bash
# Enable verbose logging
npm run dev -- --debug

# Check what packages have conflicts
npm ls
```

---

## 🧪 Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
```

---

## 🌐 Deployment

### Vercel (Recommended for Next.js)

1. Push code to GitHub
2. Visit https://vercel.com and connect repository
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Manual Deployment

```bash
npm run build
npm run start
```

---

## 📚 Useful Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Privy Documentation](https://docs.privy.io/)
- [Polymarket API](https://docs.polymarket.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Jupiter Swap API](https://station.jup.ag/docs/apis/swap-api)

---

## 👥 Team Collaboration

### Installing for the first time?
```bash
git clone <repo>
cd solana-aid
npm install --legacy-peer-deps
cp .env.example .env.local
# Add your environment variables to .env.local
npm run dev
```

### Pulling latest changes?
```bash
git pull origin main
npm install --legacy-peer-deps
npm run dev
```

### Creating a feature branch?
```bash
git checkout -b feature/your-feature-name
# Make changes
git add .
git commit -m "feat: description of changes"
git push origin feature/your-feature-name
# Create PR on GitHub
```

---

## 📝 Notes for Team

- **Do NOT commit `.env.local`** – it contains secrets. Add it to `.gitignore` (already done).
- **Always use `--legacy-peer-deps`** when installing or updating packages.
- **Test on Devnet first** before mainnet transactions.
- **Check `NEXT_PUBLIC_` prefix** – only variables with this prefix are exposed to the browser.

---

## 🤝 Support

Having issues? Try:
1. Reading error message carefully (often contains the solution)
2. Checking this README's troubleshooting section
3. Running `npm cache clean --force && npm install --legacy-peer-deps` again
4. Asking teammates who have successfully installed

---

## 📄 License

MIT License – See LICENSE file for details.

---

**Good luck building! 🚀**
```

---

## Key Points to Highlight to Your Team:

1. **Always use `--legacy-peer-deps`** – This is the #1 thing people forget
2. **`.env.local` is not committed** – Each teammate needs their own copy
3. **Port 3000 by default** – If it's in use, use `-p 3001`
4. **Hot reload works** – No need to restart for code changes
5. **Test on Devnet first** – Use test wallets before mainnet

Would you like me to also create an `.env.example` file to include in the repo?
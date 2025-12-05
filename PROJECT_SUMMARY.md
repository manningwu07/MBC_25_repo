# Solana-Aid: Decentralized Humanitarian Giving Platform

## Inspiration

Traditional humanitarian donation systems suffer from high fees (3-8%), slow processing (days to weeks), and lack of transparency. During the Gaza crisis, Ukraine war, and Sudan conflict, billions were donated but fund distribution remained opaque and inefficient. We were inspired to leverage Solana's industry-leading performance to create a transparent, instant humanitarian giving platform that connects donors directly with verified NGOs.

## What it does

Solana-Aid enables instant, transparent donations to humanitarian causes using Solana's blockchain. Key features include:
- **Blink Donations**: One-click donations via Solana Actions from social media
- **Real-time Globe Visualization**: 3D map showing active crisis zones and donation impact
- **Smart Contract Pools**: Secure fund management with automated accounting for Ukraine, Gaza, and Sudan relief
- **NGO Dashboard**: Whitelist-based access and fund withdrawal authorization
- **Transparency Dashboard**: On-chain transaction visibility and fund tracking
- **Multiple Cause Support**: Donations to specific humanitarian crises with dedicated pools

The platform supports instant donations in SOL and includes a unified endpoint that can route donations to different causes based on pool IDs, making it easy for users to contribute to specific humanitarian efforts.

## How we built it

We built Solana-Aid using the Solana ecosystem:
- **Frontend**: Next.js 16 with TypeScript, Tailwind CSS, and React Globe for 3D visualization
- **Blockchain**: Solana with Anchor framework for secure smart contracts
- **Solana Actions (Blinks)**: Enable social media donations with one-click UX
- **Program Derived Addresses (PDA)**: Secure, isolated donation pools for each cause
- **@solana/web3.js**: Client-side blockchain interactions
- **Solana Wallet Adapter**: Universal wallet connectivity (Phantom, Solflare)
- **Smart Contracts**: PDA-based pools with automated accounting and NGO whitelisting
- **API Routes**: Next.js endpoints implementing Solana Actions standard

The architecture centers on PDA-based donation pools with secure fund isolation, cross-program invocations for complex operations, and on-chain accounting for transparency.

## Challenges we ran into

1. **Wallet Integration Complexity**: Implementing seamless wallet connections while ensuring security across multiple Solana wallet providers
2. **Smart Contract Security**: Designing secure PDA structures and access controls to prevent unauthorized fund access
3. **Solana Actions Implementation**: Understanding and implementing the Actions protocol for social media integration
4. **Real-time Data**: Creating a responsive 3D globe visualization with live donation tracking
5. **Cross-program Invocation**: Complex fund accounting logic that properly tracks donated/withdrawn amounts
6. **Testing on Devnet**: Ensuring consistent performance and functionality across different Solana network conditions

## Accomplishments that we're proud of

- **Instant Donations**: Achieved sub-second donation processing using Solana's 400ms block time
- **Seamless Social Integration**: Successfully implemented Solana Actions for one-click donations from Twitter
- **Secure Fund Management**: Built PDA-based pools with proper access controls and accounting
- **Real-time Visualization**: Created an interactive 3D globe showing live donation impact
- **Scalable Architecture**: Designed for 100,000+ TPS capacity with near-zero fees ($0.00025)
- **Multi-Cause Support**: Unified endpoint supporting different humanitarian causes with pool IDs
- **Transparent Accounting**: Complete on-chain transaction history and fund tracking

## What we learned

- Solana's performance advantages (speed, cost, scalability) make it ideal for financial applications requiring instant settlement
- Solana Actions provide an exceptional user experience for social media donations
- PDA-based architectures offer excellent security and scalability for fund management
- User experience is crucial for adoption in the humanitarian space
- Real-time visualizations significantly increase user engagement with donation platforms.
- Devnet testing is rather difficult when working crosschain.

## What's next for SolanaAid

- **Mainnet Deployment**: Launch on Solana mainnet with production smart contracts
- **Token Support**: Add USDC and other SPL tokens alongside SOL donations
- **Fiat On-ramp**: Integrate Circle API's for fiat onramping and CCTP for cross-chain donations
- **NGO Verification**: Implement comprehensive on-chain KYC for NGO partnerships
- **Impact Measurement**: Add real-world outcome tracking and reporting
- **Mobile App**: Native mobile applications for iOS and Android
- **Multi-language Support**: Global accessibility with translations
- **Corporate Giving**: Enterprise donation programs with tax documentation
- **AI Integration**: Smart matching of donations to most urgent needs
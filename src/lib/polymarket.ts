/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/polymarket.ts

const RED_CROSS_WALLET = '2ypyDnf2zU8DgMtW8Urjv7G1ZddAAANjRK1WyL7QxLDv'; // Your "NGO" key
const DIRECT_RELIEF_WALLET = 'sqBGUjzmQwhMyqpvqD14gy6ov65ujbnJiLhAmfucfq6'; // Your "Fund" key


	const REGION_MAP: Record<string, { lat: number; lng: number; id: string }> = {
	  'ukraine': { lat: 48.3794, lng: 31.1656, id: 'eastern-europe' },
	  'russia': { lat: 48.3794, lng: 31.1656, id: 'eastern-europe' },
	  'zelensky': { lat: 48.3794, lng: 31.1656, id: 'eastern-europe' },
	  'putin': { lat: 48.3794, lng: 31.1656, id: 'eastern-europe' },
	  
	  'gaza': { lat: 31.5, lng: 34.4667, id: 'middle-east' },
	  'israel': { lat: 31.5, lng: 34.4667, id: 'middle-east' },
	  'hamas': { lat: 31.5, lng: 34.4667, id: 'middle-east' },
	  'palestine': { lat: 31.5, lng: 34.4667, id: 'middle-east' },
	  
	  'sudan': { lat: 12.8628, lng: 30.2176, id: 'sudan' },
	  'yemen': { lat: 15.5527, lng: 48.5164, id: 'yemen' },
	  'taiwan': { lat: 23.6978, lng: 120.9605, id: 'taiwan' },
	  'china': { lat: 35.8617, lng: 104.1954, id: 'asia' },
	  'trump': { lat: 38.9072, lng: -77.0369, id: 'usa' }, 
	  'election': { lat: 38.9072, lng: -77.0369, id: 'usa' },
	};
	
	export interface ConflictZone {
	  id: string;
	  name: string;
	  lat: number;
	  lng: number;
	  volume: number;
	  url: string;
	  activeWallets: { name: string, address: string }[];
	}
	
	export async function fetchPolymarketData(): Promise<ConflictZone[]> {
	  try {
	    // 1. Fetch Top 50 Active Markets by Volume
	    const response = await fetch('/api/polymarket');

    if (!response.ok) throw new Error('Proxy failed');
    const data = await response.json();

    const uniqueRegions = new Set<string>();
    const zones: ConflictZone[] = [];
	
	    // 2. Iterate and Filter
	    for (const event of data) {
	        // Stop if we have top 5 distinct conflicts
	        if (zones.length >= 5) break;
	
	        const text = (event.title + " " + event.description).toLowerCase();
	        
	        // Find matching region
	        let match = null;
	        for (const [keyword, info] of Object.entries(REGION_MAP)) {
	            if (text.includes(keyword)) {
	                match = info;
	                break;
	            }
	        }
	
	        // If matched AND we haven't added this region yet
	        if (match && !uniqueRegions.has(match.id)) {
	            uniqueRegions.add(match.id);
	            
	            zones.push({
	                id: event.id,
	                name: event.title,
	                lat: match.lat,
	                lng: match.lng,
	                volume: event.volume || 0,
	                url: `https://polymarket.com/event/${event.slug}`,
	                // Assign REAL wallets for the hackathon demo
	                activeWallets: [
	                    { name: "Verified NGO Wallet", address: RED_CROSS_WALLET  },
	                    { name: "Regional Relief Fund", address: DIRECT_RELIEF_WALLET }
	                ]
	            });
	        }
	    }
	
	    // Sort by volume just in case
	    return zones.sort((a, b) => b.volume - a.volume);
	  } catch (error) {
	    console.error("Polymarket Fetch Error:", error);
	    return []; 
	  }
	}
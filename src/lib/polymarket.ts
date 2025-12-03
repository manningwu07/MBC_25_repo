/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/polymarket.ts

// A simple mapping for the hackathon to convert text to coordinates
// In a real app, you'd use a Geocoding API or LLM
const GEO_CACHE: Record<string, { lat: number; lng: number }> = {
  israel: { lat: 31.0461, lng: 34.8516 },
  gaza: { lat: 31.5, lng: 34.4667 },
  hamas: { lat: 31.5, lng: 34.4667 },
  ukraine: { lat: 48.3794, lng: 31.1656 },
  russia: { lat: 61.524, lng: 105.3188 },
  taiwan: { lat: 23.6978, lng: 120.9605 },
  china: { lat: 35.8617, lng: 104.1954 },
  sudan: { lat: 12.8628, lng: 30.2176 },
  yemen: { lat: 15.5527, lng: 48.5164 },
  usa: { lat: 37.0902, lng: -95.7129 },
  election: { lat: 38.9072, lng: -77.0369 }, // Pin to DC
};

export interface ConflictZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  volume: number; // Used for point size
  url: string;
}

export async function fetchPolymarketData(): Promise<ConflictZone[]> {
  try {
    // Fetch active markets. limiting to 20 for performance
    // We filter for 'active' and closed=false
    const response = await fetch('/api/polymarket');

    if (!response.ok) {
      console.warn('Proxy returned error, using fallback data');
      return [];
    }

    const data = await response.json();
    const zones: ConflictZone[] = [];

    // Filter relevant keywords for "Aid" context
    const keywords = [
      'war',
      'conflict',
      'invasion',
      'peace',
      'military',
      'crisis',
      'election',
    ];

    data.forEach((event: any) => {
      const title = event.title.toLowerCase();
      const description = event.description.toLowerCase();

      // 1. Check if relevant
      const isRelevant = keywords.some(
        (k) => title.includes(k) || description.includes(k)
      );
      if (!isRelevant) return;

      // 2. Extract Location via keyword matching against our Cache
      let location = null;
      for (const [key, coords] of Object.entries(GEO_CACHE)) {
        if (title.includes(key) || description.includes(key)) {
          location = coords;
          break;
        }
      }

      if (location) {
        zones.push({
          id: event.id,
          name: event.title,
          lat: location.lat,
          lng: location.lng,
          volume: event.volume || 1000, // Fallback volume
          url: `https://polymarket.com/event/${event.slug}`,
        });
      }
    });

    return zones;
  } catch (error) {
    console.error('Polymarket fetch failed', error);
    // Fallback data if API fails (likely CORS on localhost)
    return [
      {
        id: '1',
        name: 'Gaza Ceasefire Prediction',
        lat: 31.5,
        lng: 34.5,
        volume: 500000,
        url: '#',
      },
      {
        id: '2',
        name: 'Ukraine Sovereignty',
        lat: 49,
        lng: 31,
        volume: 1200000,
        url: '#',
      },
      {
        id: '3',
        name: 'Sudan Crisis',
        lat: 15,
        lng: 30,
        volume: 50000,
        url: '#',
      },
    ];
  }
}

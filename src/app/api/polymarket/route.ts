// src/app/api/polymarket/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // We fetch from the server, where CORS doesn't exist
    const response = await fetch(
      'https://gamma-api.polymarket.com/events?limit=50&closed=false&order=volume-desc',
      { headers: { 'Accept': 'application/json' } }
    );
    
    if (!response.ok) {
        throw new Error(`API responded with ${response.status}`);
    }
    
    const data = await response.json();
    
    // Return the data to our frontend
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
      }
    });
  } catch (error) {
    console.error("Polymarket Proxy Error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
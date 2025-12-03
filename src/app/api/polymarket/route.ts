import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      'https://gamma-api.polymarket.com/events?limit=20&closed=false&order=volume-desc',
      { headers: { 'Accept': 'application/json' } }
    );
    
    if (!response.ok) throw new Error('Polymarket API failed');
    
    const data = await response.json();
    
    // Add Cache-Control to prevent hammering the API
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=30' }
    });
  } catch (error) {
    console.error("Polymarket Proxy Error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
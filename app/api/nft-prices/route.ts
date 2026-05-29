import { NextResponse } from 'next/server';

export const revalidate = 300; // cache this route for 5 minutes

interface PriceEntry {
  eth: string;
  currency: string;
}

export interface TokenPrices {
  listing: PriceEntry | null;
  offer: PriceEntry | null;
}

function parsePrice(price: unknown): PriceEntry | null {
  const p = price as { current?: { value?: string; currency?: string; decimals?: number } };
  if (!p?.current?.value) return null;
  const { value, currency = 'ETH', decimals = 18 } = p.current;
  const amount = parseFloat(value) / Math.pow(10, decimals);
  const eth = amount < 0.001
    ? amount.toFixed(6)
    : amount < 1
    ? amount.toFixed(4)
    : amount.toFixed(3);
  return { eth: eth.replace(/\.?0+$/, ''), currency };
}

function tokenIdFromListing(listing: unknown): string | null {
  const l = listing as { protocol_data?: { parameters?: { offer?: Array<{ itemType?: number; identifierOrCriteria?: string }> } } };
  const items = l?.protocol_data?.parameters?.offer ?? [];
  return items.find((i) => i.itemType === 2 || i.itemType === 3)?.identifierOrCriteria ?? null;
}

function tokenIdFromOffer(offer: unknown): string | null {
  const o = offer as { protocol_data?: { parameters?: { consideration?: Array<{ itemType?: number; identifierOrCriteria?: string }> } } };
  const items = o?.protocol_data?.parameters?.consideration ?? [];
  return items.find((i) => i.itemType === 2 || i.itemType === 3)?.identifierOrCriteria ?? null;
}

export async function GET(): Promise<NextResponse> {
  const apiKey = process.env.OPENSEA_API_KEY;
  const slug = process.env.OPENSEA_COLLECTION_SLUG;

  if (!apiKey || !slug) {
    return NextResponse.json({});
  }

  const headers = { 'x-api-key': apiKey, accept: 'application/json' };
  const base = 'https://api.opensea.io';

  try {
    const [listingsRes, offersRes] = await Promise.all([
      fetch(`${base}/api/v2/listings/collection/${slug}/all?limit=100`, {
        headers,
        next: { revalidate: 300 },
      }),
      fetch(`${base}/api/v2/offers/collection/${slug}/all?limit=100`, {
        headers,
        next: { revalidate: 300 },
      }),
    ]);

    const [listingsData, offersData] = await Promise.all([
      listingsRes.ok ? listingsRes.json() : { listings: [] },
      offersRes.ok ? offersRes.json() : { offers: [] },
    ]);

    // Cheapest listing per token
    const listings: Record<string, PriceEntry> = {};
    for (const item of listingsData.listings ?? []) {
      const tokenId = tokenIdFromListing(item);
      if (!tokenId) continue;
      const price = parsePrice((item as { price?: unknown }).price);
      if (!price) continue;
      if (!listings[tokenId] || parseFloat(price.eth) < parseFloat(listings[tokenId].eth)) {
        listings[tokenId] = price;
      }
    }

    // Highest offer per token
    const offers: Record<string, PriceEntry> = {};
    for (const item of offersData.offers ?? []) {
      const tokenId = tokenIdFromOffer(item);
      if (!tokenId) continue;
      const price = parsePrice((item as { price?: unknown }).price);
      if (!price) continue;
      if (!offers[tokenId] || parseFloat(price.eth) > parseFloat(offers[tokenId].eth)) {
        offers[tokenId] = price;
      }
    }

    const allIds = Array.from(new Set([...Object.keys(listings), ...Object.keys(offers)]));
    const result: Record<string, TokenPrices> = {};
    for (const id of allIds) {
      result[id] = { listing: listings[id] ?? null, offer: offers[id] ?? null };
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('OpenSea fetch error:', err);
    return NextResponse.json({});
  }
}

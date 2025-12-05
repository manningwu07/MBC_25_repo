//file: src/app/api/actions/donate-sol-gaza/route.ts

import * as Donate from "../donate-sol/route";

export const OPTIONS = Donate.OPTIONS;

// Forward GET, setting poolId=1 if not provided
export const GET = async (req: Request) => {
  const url = new URL(req.url);
  if (!url.searchParams.has("poolId")) url.searchParams.set("poolId", "1");
  const forwarded = new Request(url.toString(), { method: "GET", headers: req.headers as any });
  return Donate.GET(forwarded);
};

// Forward POST, injecting poolId=1 if not provided
export const POST = async (req: Request) => {
  const url = new URL(req.url);
  if (!url.searchParams.has("poolId")) url.searchParams.set("poolId", "1");
  const body = await req.text();
  const forwarded = new Request(url.toString(), { method: "POST", headers: req.headers as any, body });
  return Donate.POST(forwarded as unknown as Request);
};
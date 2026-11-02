import { handleSheetsFeed } from "@/lib/sheets-feed-handler";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return handleSheetsFeed(req);
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}

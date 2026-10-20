import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = performance.now();
  const timeoutMs = 3000;

  try {
    const supabase = await createClient();

    // Query database with timeout race
    const dbPromise = supabase.from("perfumes").select("id").limit(1);
    const timeoutPromise = new Promise<{ error: { message: string } }>((_, reject) =>
      setTimeout(() => reject(new Error("Database health check timed out")), timeoutMs)
    );

    const { error } = (await Promise.race([dbPromise, timeoutPromise])) as {
      error: { message: string } | null;
    };

    const latency_ms = Math.round(performance.now() - start);

    if (error) {
      return NextResponse.json(
        {
          status: "unhealthy",
          database: "error",
          error: error.message,
          latency_ms,
          timestamp: new Date().toISOString(),
        },
        {
          status: 503,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    return NextResponse.json(
      {
        status: "healthy",
        database: "connected",
        latency_ms,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err: any) {
    const latency_ms = Math.round(performance.now() - start);
    return NextResponse.json(
      {
        status: "unhealthy",
        database: "unreachable",
        error: err?.message || "Unknown error",
        latency_ms,
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}

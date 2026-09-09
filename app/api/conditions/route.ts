import { NextRequest, NextResponse } from "next/server";
import spotsData from "@/data/spots.json";
import { getBatchConditions } from "@/lib/batchConditions";

// Node.js runtime — batchConditions uses fetch which works in Next.js server

export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get("ids");
  if (!ids) {
    return NextResponse.json({}, { status: 400 });
  }

  const idList = ids.split(",").map((s) => s.trim()).filter(Boolean);
  const spots = spotsData.filter((s) => idList.includes(s.id));

  if (spots.length === 0) {
    return NextResponse.json({}, { status: 404 });
  }

  const conditions = await getBatchConditions(spots);

  return NextResponse.json(conditions, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}

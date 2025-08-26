import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("query") || "").trim();
    const limitParam = searchParams.get("limit");
    const limit = Math.max(1, Math.min(12, Number(limitParam) || 8));

    if (q.length < 2) {
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    const where = {
      isAvailableForPurchase: true,
      OR: [
        { name: { contains: q } },
        { description: { contains: q } },
      ],
    };

    const products = await db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        name: true,
        imagePath: true,
        priceInCents: true,
      },
    });

    return NextResponse.json({ results: products }, { status: 200 });
  } catch (err) {
    console.error("GET /api/search-products error:", err);
    return NextResponse.json({ error: "Failed to Search" }, { status: 500 });
  }
}

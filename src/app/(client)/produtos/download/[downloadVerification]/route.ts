import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";

export async function GET(
  req: NextRequest,
  context: { params: { downloadVerification: string } }
) {
  const { params } = context;
  const awaitedParams = await params;
  const downloadVerification = awaitedParams.downloadVerification;

  const data = await db.downloadVerification.findUnique({
    where: { id: downloadVerification, expiresAt: { gt: new Date() } },
    select: { product: { select: { filePath: true, name: true } } },
  });

  if (data == null) {
    return NextResponse.redirect(
      new URL("/produtos/download/expirado", req.url)
    );
  }

  const { size } = await fs.stat(data.product.filePath);
  const file = await fs.readFile(data.product.filePath);
  const extension = data.product.filePath.split(".").pop();

  return new NextResponse(file, {
    headers: {
      "Content-Disposition": `attachment; filename="${data.product.name}.${extension}"`,
      "Content-Length": size.toString(),
    },
  });
}
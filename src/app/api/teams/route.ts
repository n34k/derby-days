import { prisma } from "../../../../prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const teams = await prisma.team.findMany({
    select: { name: true, id: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(teams);
}

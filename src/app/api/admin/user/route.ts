import { prisma } from "../../../../../prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId, data } = await req.json();

  await prisma.user.update({
    where: { id: userId },
    data,
  });

  return NextResponse.json({ success: true });
}

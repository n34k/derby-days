import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { prisma } from "../../../../../prisma";
import { GetUserSchema } from "../schema";

export async function GET(req: NextRequest,  { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized user" }, { status: 401 });

  const p = await params;
  const id = p.id;

  const result = GetUserSchema.safeParse({ id });
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", details: result.error.flatten() }, { status: 400 });
  }

  try {
    const user = await prisma.user.findFirst({where: { id: result.data.id },});

    if (!user) {return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } 
  catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Couldn't find user" }, { status: 500 });
  }
}

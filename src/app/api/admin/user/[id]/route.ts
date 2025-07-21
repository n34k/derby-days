import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { prisma } from "../../../../../../prisma";
import { AdminUpdateUserSchema } from "../schema";
import { User } from "@/generated/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await auth();
    const p = await params;
    const user = session?.user as User
    if (!user || user.globalRole !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized"}, { status: 401 });
    }

    let body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const result = AdminUpdateUserSchema.safeParse(body);
    if (!result.success) {
        return NextResponse.json({ error: "Validation failed", details: result.error.flatten() }, { status: 400 });
    }

    const data = result.data;

    try {
        const existingUser = await prisma.user.findUnique({ where: { id: p.id } });
        if(!existingUser) {
            return NextResponse.json({error: "User not found"}, { status: 404 });
        }
        const updatedUser = await prisma.user.update({
            where: {id: p.id },
            data,
        });
        return NextResponse.json({ success: true, user: updatedUser })
    } catch (err) {
        console.error("Update failed", err);
        return NextResponse.json({ error: "Update failed" }, {status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  const user = session?.user as User;  
  const p = await params;

  if (!user || user.globalRole !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.user.delete({
      where: { id: p.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

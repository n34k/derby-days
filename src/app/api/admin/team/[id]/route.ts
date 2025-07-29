import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { prisma } from "../../../../../../prisma";
import { AdminUpdateTeamSchema } from "../schema";
import { User } from "@/generated/prisma";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  const user = session?.user as User;
  
  if (!user || user.globalRole !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json({ error: "Missing team ID" }, { status: 400 });
  }

  let body;
  try {
    body = await req.json();
    console.log("body", body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = AdminUpdateTeamSchema.safeParse(body);
  console.log("result", result);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const data = result.data;

  try {
    const existingTeam = await prisma.team.findUnique({ where: { id } });
    if (!existingTeam) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const updatedTeam = await prisma.team.update({
      where: { id },
      data,
    });

    console.log("Updating team with data:", data);
    console.log("updated team:", updatedTeam);

    return NextResponse.json({ success: true, team: updatedTeam });
  } catch (err) {
    console.error("Update failed", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  const user = session?.user as User;

  if (!user || user.globalRole !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop(); // extract [id] from the URL path

  if (!id) {
    return NextResponse.json({ error: "Missing team ID" }, { status: 400 });
  }

  try {
    await prisma.team.delete({where: { id }});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete team:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
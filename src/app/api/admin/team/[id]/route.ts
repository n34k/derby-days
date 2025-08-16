import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { prisma } from "../../../../../../prisma";
import { AdminUpdateTeamSchema } from "../schema";
import { User } from "@/generated/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  const user = session?.user as User;

  if (!user || user.globalRole !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const teamId = url.pathname.split("/").pop();
  if (!teamId) {
    return NextResponse.json({ error: "Missing team ID" }, { status: 400 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  console.log("Received body:", body);
  const parsed = AdminUpdateTeamSchema.safeParse(body);
  console.log("Parsed data:", parsed);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  console.log("DATA", data)

  try {
    const existing = await prisma.team.findUnique({ //if existing derby darling public id is present, delete it
      where: { id: teamId },
      select: { derbyDarlingPublicId: true },
    });

    if ( existing?.derbyDarlingPublicId && existing.derbyDarlingPublicId !== data.derbyDarlingPublicId) {
      try {
        await cloudinary.uploader.destroy(existing.derbyDarlingPublicId, {
          invalidate: true,
        });
      } catch (e) {
        console.error("Cloudinary destroy failed:", e);
        // don't fail the request; proceed with DB update
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const existingTeam = await tx.team.findUnique({
        where: { id: teamId },
        select: { id: true, headCoachId: true },
      });
      if (!existingTeam) {
        throw new Error("TEAM_NOT_FOUND");
      }

      // 1) Handle head coach reassignment if present in payload
      if ("headCoachId" in data) {
        console.log("Updating head coach for team", teamId, "to", data.headCoachId);
        const newCoachId = data.headCoachId ?? null;
        const oldCoachId = existingTeam.headCoachId ?? null;

        if (newCoachId === null) {
          // Clearing the head coach
          if (oldCoachId) {
            await tx.user.update({
              where: { id: oldCoachId },
              data: { globalRole: "BROTHER" }, // keep teamId as-is
            });
          }
          await tx.team.update({
            where: { id: teamId },
            data: { headCoachId: null },
          });
        } else if (newCoachId !== oldCoachId) {
          // Replace old coach (if any)
          if (oldCoachId) {
            await tx.user.update({
              where: { id: oldCoachId },
              data: { globalRole: "BROTHER" },
            });
          }

          // Promote/move the new coach to this team
          await tx.user.update({
            where: { id: newCoachId },
            data: { globalRole: "HEAD_COACH", teamId },
          });

          // Update team pointer
          await tx.team.update({
            where: { id: teamId },
            data: { headCoachId: newCoachId },
          });
        }
      }

      // 2) Apply other team field updates (omit undefined)
      const updatable: Record<string, unknown> = {
        name: data.name,
        points: data.points,
        tshirtsSold: data.tshirtsSold,
        moneyRaised: data.moneyRaised,
        derbyDarlingName: data.derbyDarlingName,
        derbyDarlingImageUrl: data.derbyDarlingImageUrl,
        derbyDarlingPublicId: data.derbyDarlingPublicId,
      };
      Object.keys(updatable).forEach((k) => {
        if (updatable[k] === undefined) delete updatable[k];
      });

      if (Object.keys(updatable).length > 0) {
        await tx.team.update({ where: { id: teamId }, data: updatable });
      }

      // Return a fresh copy 
      return tx.team.findUnique({
        where: { id: teamId },
        include: {
          headCoach: { select: { id: true, name: true, email: true, globalRole: true } },
        },
      });
    });

    return NextResponse.json({ success: true, team: updated });
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
  const id = url.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json({ error: "Missing team ID" }, { status: 400 });
  }

  try {
    // Transaction: first unset teamId for all users in this team, then delete the team
    await prisma.$transaction([
      prisma.user.updateMany({
        where: { teamId: id },
        data: { teamId: null },
      }),
      prisma.team.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete team:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { prisma } from "../../../../prisma";
import { UpdateUserSchema } from "./schema";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized user" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = UpdateUserSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const { name, image, walkoutSong, imagePublicId } = result.data;

  try {
    // Fetch current user to get their existing imagePublicId
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user?.id },
    });

    if (existingUser?.imagePublicId && existingUser.imagePublicId !== imagePublicId) {
      // Delete the old image from Cloudinary
      await cloudinary.uploader.destroy(existingUser.imagePublicId);
    }

    // Update the user with the new data
    console.log('Setting image public Id', imagePublicId)
    await prisma.user.update({
      where: { id: session.user?.id },
      data: {
        name,
        image,
        imagePublicId,
        walkoutSong,
      },
    });

    return NextResponse.json({ success: true, name, walkoutSong });
  } catch (err) {
    console.error("Update failed", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

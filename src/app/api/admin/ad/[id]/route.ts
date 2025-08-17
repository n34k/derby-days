import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../prisma";
import { v2 as cloudinary } from "cloudinary";
import { AdUploadSchema } from "./schema";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function PATCH(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.log("Received body:", body);

  const parsed = AdUploadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { adId, adUrl, adPublicId } = parsed.data;
  console.log("Parsed data:", parsed.data);

  try {
    // Fetch current ad to get their existing adPublicId
    const existingAd = await prisma.adPurchase.findUnique({
      where: { id: adId },
    });

    if (existingAd?.adPublicId && existingAd.adPublicId !== adPublicId) {
      // Delete the old image from Cloudinary
      await cloudinary.uploader.destroy(existingAd.adPublicId);
    }

    // Update the ad with the new data
    console.log("Setting image ad Id", adPublicId);
    await prisma.adPurchase.update({
      where: { id: adId },
      data: {
        adUrl,
        adPublicId,
      },
    });

    return NextResponse.json({ success: true, adId, adUrl, adPublicId });
  } catch (err) {
    console.error("Update failed", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  const body = await request.json();
  const { paramsToSign } = body;

  // Determine preset based on body or fallback
  const uploadPreset = paramsToSign.upload_preset ?? "profilepic"; // default fallback
  const fullParams = { ...paramsToSign, upload_preset: uploadPreset };
  console.log("Signing with params:", fullParams);

  const signature = cloudinary.utils.api_sign_request(
    fullParams,
    process.env.CLOUDINARY_API_SECRET as string
  );

  return Response.json({ signature });
}

"use client";
import React, { useState } from "react";
import { CldImage, CldUploadWidget, CloudinaryUploadWidgetInfo } from "next-cloudinary";
import { AdPurchase } from "@/generated/prisma";
import { useRouter } from "next/navigation";

type Props = {
  ads: AdPurchase[];
  onAdUploaded?: (adId: string, adUrl: string, publicId: string) => void;
};

const AdTable: React.FC<Props> = ({ ads }) => {
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const router = useRouter();

  const handleUpload = async (info: CloudinaryUploadWidgetInfo, adId: string) => {
    setUploadingId(adId);
    console.log("UPLOADING AD:", adId, info);
    const res = await fetch(`/api/admin/ad/${adId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adId, adUrl: info.secure_url, adPublicId: info.public_id }),
    });

    if (res.ok) {
      setUploadingId(null);
      router.refresh();
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Ad Purchases</h2>
      <div className="overflow-x-auto w-full">
        <table className="w-full border border-base-content text-sm">
          <thead className="bg-base-200">
            <tr>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Email</th>
              <th className="border px-2 py-1">Size</th>
              <th className="border px-2 py-1">Ad</th>
            </tr>
          </thead>
          <tbody>
            {ads.map(ad => (
              <tr key={ad.id}>
                <td className="border px-2 py-1">{ad.name}</td>
                <td className="border px-2 py-1">{ad.email}</td>
                <td className="border px-2 py-1">{ad.size}</td>
                <td className="border px-2 py-1">
                  <div className="flex flex-col items-center gap-2">
                    {ad.adUrl && (
                        <CldImage
                        src={ad.adUrl}
                        alt="Ad"
                        width={200}
                        height={200}
                        className="object-contain rounded"
                        />
                    )}
                        <CldUploadWidget
                            signatureEndpoint="/api/sign-cloudinary-params"
                            uploadPreset="ad"
                            options={{ sources: ["local"], multiple: false }}
                            onSuccess={(results) => {
                                console.log("Upload successful:", results);
                                const info = results.info as CloudinaryUploadWidgetInfo;
                                handleUpload(info, ad.id);
                            }}
                        >
                            {({ open }) => (
                            <button
                                type="button"
                                className={`btn btn-secondary md:w-1/2 transition-all duration-300 ${
                                uploadingId === ad.id ? "opacity-50 pointer-events-none" : ""
                                }`}
                                onClick={() => open()}
                                disabled={uploadingId === ad.id}
                            >
                                {uploadingId === ad.id ? "Uploading..." : ad.adUrl ? "Replace Ad" : "Upload Ad"}
                            </button>
                            )}
                        </CldUploadWidget>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdTable;
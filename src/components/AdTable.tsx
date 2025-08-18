"use client";
import React, { useState } from "react";
import {
  CldImage,
  CldUploadWidget,
  CloudinaryUploadWidgetInfo,
} from "next-cloudinary";
import { AdPurchase } from "@/generated/prisma";
import { useRouter } from "next/navigation";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

type Props = {
  ads: AdPurchase[];
  onAdUploaded?: (adId: string, adUrl: string, publicId: string) => void;
};

const AdTable: React.FC<Props> = ({ ads }) => {
  const [expanded, setExpanded] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const router = useRouter();

  const handleUpload = async (
    info: CloudinaryUploadWidgetInfo,
    adId: string
  ) => {
    setUploadingId(adId);
    const res = await fetch(`/api/admin/ad/${adId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        adId,
        adUrl: info.secure_url,
        adPublicId: info.public_id,
      }),
    });
    setUploadingId(null);
    if (res.ok) router.refresh();
  };

  return (
    <div>
      {/* Header + Chevron Toggle */}
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-2xl font-semibold">Ad Purchases</h2>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls="ad-table-panel"
          className="p-1 rounded hover:bg-base-200 transition"
          title={expanded ? "Collapse" : "Expand"}
        >
          <ChevronDownIcon
            className={`w-7 h-7 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* When expanded, render everything; when collapsed, render nothing */}
      {expanded && (
        <div id="ad-table-panel">
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
                {ads.map((ad) => (
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
                          options={{
                            sources: ["local"],
                            multiple: false,
                          }}
                          onSuccess={(results) => {
                            const info =
                              results.info as CloudinaryUploadWidgetInfo;
                            handleUpload(info, ad.id);
                          }}
                        >
                          {({ open }) => (
                            <button
                              type="button"
                              className={`btn btn-secondary md:w-1/2 transition ${
                                uploadingId === ad.id
                                  ? "opacity-50 pointer-events-none"
                                  : ""
                              }`}
                              onClick={() => open()}
                              disabled={uploadingId === ad.id}
                            >
                              {uploadingId === ad.id
                                ? "Uploading..."
                                : ad.adUrl
                                ? "Replace Ad"
                                : "Upload Ad"}
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
      )}
    </div>
  );
};

export default AdTable;

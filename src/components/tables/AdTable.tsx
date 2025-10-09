"use client";
import React, { useMemo, useState } from "react";
import {
    CldImage,
    CldUploadWidget,
    CloudinaryUploadWidgetInfo,
} from "next-cloudinary";
import { AdPurchase, Team, User } from "@/generated/prisma";
import { useRouter } from "next/navigation";
import { ChevronDownIcon, PlusIcon } from "@heroicons/react/24/outline";
import { allowedFileUploads } from "@/models/allowedFileUploads";
import AddAdModal from "../modals/AddAdModal";
import greekLetters from "@/lib/greekLetters";

type Props = {
    ads: AdPurchase[];
    users: User[];
    teams: Team[];
    onAdUploaded?: (adId: string, adUrl: string, publicId: string) => void;
};

const AdTable: React.FC<Props> = ({ ads, users, teams }) => {
    const [expanded, setExpanded] = useState(false);
    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const router = useRouter();

    // Lookup for user name/email by id
    const userNameById = useMemo(() => {
        const m = new Map<string, string>();
        for (const u of users) {
            m.set(u.id, u.name ?? u.email ?? "Unnamed");
        }
        return m;
    }, [users]);

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

    const sizeMapToPresetMap = new Map<string, string>([
        ["Business Card", "card"],
        ["Quarter Page", "quarter"],
        ["Half Page", "half"],
        ["Full Page", "full"],
    ]);

    return (
        <div>
            <AddAdModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                teams={teams}
                users={users}
            />

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
                {expanded && (
                    <button
                        className="btn btn-secondary btn-circle"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <PlusIcon className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Table */}
            {expanded && (
                <div id="ad-table-panel">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full border border-base-content text-sm">
                            <thead className="bg-base-200">
                                <tr>
                                    <th className="border px-2 py-1">Date</th>
                                    <th className="border px-2 py-1">Name</th>
                                    <th className="border px-2 py-1">Email</th>
                                    <th className="border px-2 py-1">Size</th>
                                    <th className="border px-2 py-1">Team</th>
                                    <th className="border px-2 py-1">User</th>
                                    <th className="border px-2 py-1">Ad</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ads.map((ad) => {
                                    const userName =
                                        ad.userId && userNameById.get(ad.userId)
                                            ? userNameById.get(ad.userId)
                                            : null;

                                    return (
                                        <tr key={ad.id}>
                                            <td className="border px-2 py-1 text-center">
                                                {ad.createdAt.toLocaleString()}
                                            </td>
                                            <td className="border px-2 py-1 text-center">
                                                {ad.name}
                                            </td>
                                            <td className="border px-2 py-1 text-center">
                                                {ad.email}
                                            </td>
                                            <td className="border px-2 py-1 text-center">
                                                {ad.size}
                                            </td>

                                            {/* 👇 Team uses Greek letters helper */}
                                            <td className="border px-2 py-1 text-center">
                                                {ad.teamId
                                                    ? greekLetters(ad.teamId)
                                                    : "—"}
                                            </td>

                                            {/* User */}
                                            <td className="border px-2 py-1 text-center">
                                                {userName ?? "—"}
                                            </td>

                                            {/* Ad Image + Upload */}
                                            <td className="border px-2 py-1 text-center">
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
                                                        uploadPreset={sizeMapToPresetMap.get(
                                                            ad.size
                                                        )}
                                                        options={{
                                                            sources: ["local"],
                                                            multiple: false,
                                                            uploadPreset:
                                                                sizeMapToPresetMap.get(
                                                                    ad.size
                                                                ),
                                                            folder: `${
                                                                process.env
                                                                    .NEXT_PUBLIC_VERCEL_ENV
                                                            }/ads/${sizeMapToPresetMap.get(
                                                                ad.size
                                                            )}`,
                                                            clientAllowedFormats:
                                                                allowedFileUploads,
                                                            publicId: `${ad.id}`,
                                                        }}
                                                        onSuccess={(
                                                            results
                                                        ) => {
                                                            const info =
                                                                results.info as CloudinaryUploadWidgetInfo;
                                                            console.log(
                                                                "UPLOAD INFO",
                                                                info
                                                            );
                                                            handleUpload(
                                                                info,
                                                                ad.id
                                                            );
                                                        }}
                                                    >
                                                        {({ open }) => (
                                                            <button
                                                                type="button"
                                                                className={`btn btn-secondary md:w-1/4 transition ${
                                                                    uploadingId ===
                                                                    ad.id
                                                                        ? "opacity-50 pointer-events-none"
                                                                        : ""
                                                                }`}
                                                                onClick={() =>
                                                                    open()
                                                                }
                                                                disabled={
                                                                    uploadingId ===
                                                                    ad.id
                                                                }
                                                            >
                                                                {uploadingId ===
                                                                ad.id
                                                                    ? "Uploading..."
                                                                    : ad.adUrl
                                                                    ? "Replace"
                                                                    : "Upload"}
                                                            </button>
                                                        )}
                                                    </CldUploadWidget>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {ads.length === 0 && (
                                    <tr>
                                        <td
                                            className="border px-2 py-4 text-center"
                                            colSpan={6}
                                        >
                                            No ad purchases yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdTable;

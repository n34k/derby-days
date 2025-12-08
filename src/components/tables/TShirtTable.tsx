"use client";
import React, { useState } from "react";
import { TrashIcon, PlusIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { DraftStatus, Tshirt } from "@/generated/prisma";
import CreateTshirtModal from "../modals/AddTshirtModal";

interface TshirtsTableProps {
    tshirts: Tshirt[];
    draftStatus: DraftStatus | undefined;
}

export const TshirtsTable = ({ tshirts, draftStatus }: TshirtsTableProps) => {
    const [expanded, setExpanded] = useState(false);
    const [tshirtsState, setTshirtsState] = useState<Tshirt[]>(tshirts);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const changeAllowed = !draftStatus || draftStatus === "NOT_CREATED";

    const handleDelete = async (productId: string) => {
        if (!confirm("Are you sure you want to delete this t-shirt?")) return;

        try {
            const res = await fetch(`/api/admin/tshirt/${productId}`, {
                method: "DELETE",
            });

            if (!res.ok) return;

            setTshirtsState((prev) => prev.filter((t) => t.productId !== productId));
        } catch (err) {
            console.error("Error deleting t-shirt:", err);
        }
    };

    const handleTshirtCreated = (newTshirt: Tshirt) => {
        setTshirtsState((prev) => [...prev, newTshirt]);
    };

    const colCount = changeAllowed ? 7 : 6;

    return (
        <div>
            <CreateTshirtModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onTshirtCreated={handleTshirtCreated}
            />

            {/* Header / Controls */}
            <div className="flex gap-2 items-center pb-2.5">
                <h2 className="text-2xl font-semibold">T-Shirts</h2>

                {/* Chevron toggle */}
                <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    aria-expanded={expanded}
                    aria-controls="tshirts-table-panel"
                    className="p-1 rounded hover:bg-base-200 transition"
                    title={expanded ? "Collapse" : "Expand"}
                >
                    <ChevronDownIcon className={`w-7 h-7 transition-transform ${expanded ? "rotate-180" : ""}`} />
                </button>

                {expanded && changeAllowed && (
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
                <div
                    id="tshirts-table-panel"
                    className="overflow-x-auto w-full"
                >
                    <table className="w-full border border-base-content text-sm">
                        <thead className="bg-base-200">
                            <tr>
                                <th className="border px-2 py-1">Product ID</th>
                                <th
                                    className="border
                                    px-2
                                    py-1"
                                >
                                    {" "}
                                    Name
                                </th>
                                <th className="border px-2 py-1">Size</th>
                                <th className="border px-2 py-1">Price</th>
                                <th className="border px-2 py-1">Stripe Price ID</th>
                                <th className="border px-2 py-1">Quantity Available</th>
                                {changeAllowed && <th className="border px-2 py-1">Delete</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {tshirtsState.length > 0 ? (
                                tshirtsState
                                    .slice()
                                    .sort((a, b) => a.price - b.price)
                                    .map((tshirt) => (
                                        <tr
                                            key={tshirt.productId}
                                            className="hover:bg-base-200"
                                        >
                                            {/* Product ID */}
                                            <td className="border px-2 py-1">{tshirt.productId}</td>

                                            {/* Name */}
                                            <td className="border px-2 py-1">{tshirt.name}</td>

                                            {/* Size */}
                                            <td className="border px-2 py-1">{tshirt.size ?? "-"}</td>

                                            {/* Price */}
                                            <td className="border px-2 py-1">
                                                {`$${(tshirt.price / 100).toFixed(2)}`}
                                            </td>

                                            {/* Stripe Price ID */}
                                            <td className="border px-2 py-1">{tshirt.priceId}</td>

                                            {/* Quantity Available */}
                                            <td className="border px-2 py-1 text-center">
                                                {tshirt.quantityAvailable ?? "-"}
                                            </td>

                                            {/* Delete */}
                                            {changeAllowed && (
                                                <td className="text-center border px-2 py-1">
                                                    <button
                                                        className="btn btn-error btn-circle"
                                                        onClick={() => handleDelete(tshirt.productId)}
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                            ) : (
                                <tr>
                                    <td
                                        className="px-2 py-4 text-center"
                                        colSpan={colCount}
                                    >
                                        No t-shirts added yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TshirtsTable;

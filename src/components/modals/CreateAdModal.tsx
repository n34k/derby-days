"use client";

import React, { useEffect, useState } from "react";
import { Ad } from "@/generated/prisma";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onAdCreated: (ad: Ad) => void;
};

type AdValue = Ad[keyof Ad];

const adSizes: Ad["size"][] = [
    "CENTER_FOLDOUT",
    "OUTSIDE_BACK_COVER",
    "INSIDE_BACK_COVER",
    "INSIDE_FRONT_COVER",
    "TWO_PAGES",
    "FULL_PAGE",
    "HALF_PAGE",
    "QUARTER_PAGE",
    "BUSINESS_CARD",
];

const CreateAdModal: React.FC<Props> = ({ isOpen, onClose, onAdCreated }) => {
    const [currAvailAdSizes, setCurrAvailAdSizes] = useState<Ad["size"][]>([]);
    const [formData, setFormData] = useState<Ad>({
        productId: "",
        size: currAvailAdSizes[0] || "FULL_PAGE",
        price: 0,
        priceId: "",
        sizeInches: "",
        quantityAvailable: null,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchExistingAds = async () => {
            try {
                const res = await fetch("/api/ad");
                if (!res.ok) {
                    throw new Error("Failed to fetch existing ads.");
                }
                const ads: Ad[] = await res.json();
                const sizes = ads.map((ad) => ad.size);
                setCurrAvailAdSizes(adSizes.filter((s) => !sizes.includes(s)));
            } catch (err) {
                console.error("Error fetching existing ads:", err);
            }
        };
        fetchExistingAds();
    }, []);

    const resetState = () => {
        setFormData({
            productId: "",
            size: "FULL_PAGE" as Ad["size"],
            price: 0,
            priceId: "",
            sizeInches: "",
            quantityAvailable: null,
        });
        setLoading(false);
        setError(null);
    };

    const handleChange = (field: keyof Ad, value: AdValue) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/admin/ad", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                let message = "Failed to create ad.";
                try {
                    const data = await res.json();
                    message = data?.error || message;
                } catch {
                    // res body was likely empty or not JSON
                }
                throw new Error(message);
            }

            const created = (await res.json()) as Ad;

            if (created) {
                onAdCreated(created);
                resetState();
                onClose();
            }
        } catch (err) {
            console.error("Error creating ad:", err);

            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-primary p-6 rounded-xl shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Create New Ad</h2>
                <form
                    className="space-y-4"
                    onSubmit={handleSubmit}
                >
                    {/* Product ID */}
                    <div className="form-control">
                        <label className="label">Product ID</label>
                        <input
                            className="input input-bordered w-full"
                            value={formData.productId}
                            onChange={(e) => handleChange("productId", e.target.value as AdValue)}
                            required
                        />
                    </div>

                    {/* Size (enum) */}
                    <div className="form-control">
                        <label className="label">Size</label>
                        <select
                            className="input input-bordered w-full"
                            value={formData.size}
                            onChange={(e) => handleChange("size", e.target.value as AdValue)}
                            required
                        >
                            <option value="">Select ad size…</option>
                            {currAvailAdSizes.map((size) => (
                                <option
                                    key={size}
                                    value={size}
                                >
                                    {size.replace(/_/g, " ")}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Price in cents */}
                    <div className="form-control">
                        <label className="label">Price (in cents)</label>
                        <input
                            type="number"
                            className="input input-bordered w-full"
                            value={formData.price ?? 0}
                            onChange={(e) => handleChange("price", parseInt(e.target.value || "0", 10) as AdValue)}
                            required
                        />
                    </div>

                    {/* Stripe Price ID */}
                    <div className="form-control">
                        <label className="label">Stripe Price ID</label>
                        <input
                            className="input input-bordered w-full"
                            value={formData.priceId}
                            onChange={(e) => handleChange("priceId", e.target.value as AdValue)}
                            required
                        />
                    </div>

                    {/* Size in inches */}
                    <div className="form-control">
                        <label className="label">Size (inches)</label>
                        <input
                            className="input input-bordered w-full"
                            placeholder={`e.g. 8.5 x 11`}
                            value={formData.sizeInches}
                            onChange={(e) => handleChange("sizeInches", e.target.value as AdValue)}
                            required
                        />
                    </div>

                    {/* Quantity Available (optional) */}
                    <div className="form-control">
                        <label className="label">
                            Quantity Available <span className="text-xs opacity-80">(optional)</span>
                        </label>
                        <input
                            type="number"
                            className="input input-bordered w-full"
                            value={formData.quantityAvailable ?? ""}
                            onChange={(e) => {
                                const val = e.target.value === "" ? null : parseInt(e.target.value || "0", 10);
                                handleChange("quantityAvailable", val as AdValue);
                            }}
                            min={0}
                        />
                    </div>

                    {error && <p className="text-error text-sm">{error}</p>}

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            className="btn"
                            onClick={() => {
                                onClose();
                                resetState();
                            }}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-secondary"
                            disabled={loading}
                        >
                            {loading ? "Creating..." : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAdModal;

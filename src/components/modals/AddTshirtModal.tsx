"use client";

import React, { useState } from "react";
import { Tshirt } from "@/generated/prisma";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onTshirtCreated: (tshirt: Tshirt) => void;
};

type TshirtValue = Tshirt[keyof Tshirt];

const CreateTshirtModal: React.FC<Props> = ({ isOpen, onClose, onTshirtCreated }) => {
    const [formData, setFormData] = useState<Tshirt>({
        productId: "",
        name: "",
        price: 0,
        priceId: "",
        quantityAvailable: null,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const resetState = () => {
        setFormData({
            productId: "",
            name: "",
            price: 0,
            priceId: "",
            quantityAvailable: null,
        });
        setLoading(false);
        setError(null);
    };

    const handleChange = (field: keyof Tshirt, value: TshirtValue) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/admin/tshirt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                let message = "Failed to create t-shirt.";
                try {
                    const data = await res.json();
                    message = data?.error || message;
                } catch {
                    // ignore non-JSON response
                }
                throw new Error(message);
            }

            const created = (await res.json()) as Tshirt;

            if (created) {
                onTshirtCreated(created);
                resetState();
                onClose();
            }
        } catch (err) {
            console.error("Error creating t-shirt:", err);
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
                <h2 className="text-xl font-bold mb-4">Create New T-Shirt</h2>
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
                            onChange={(e) => handleChange("productId", e.target.value as TshirtValue)}
                            required
                        />
                    </div>

                    {/* Name */}
                    <div className="form-control">
                        <label className="label">Name</label>
                        <input
                            className="input input-bordered w-full"
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value as TshirtValue)}
                            required
                        />
                    </div>

                    {/* Price (in cents) */}
                    <div className="form-control">
                        <label className="label">Price (in cents)</label>
                        <input
                            type="number"
                            className="input input-bordered w-full"
                            value={formData.price ?? 0}
                            onChange={(e) => handleChange("price", parseInt(e.target.value || "0", 10) as TshirtValue)}
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
                                handleChange("quantityAvailable", val as TshirtValue);
                            }}
                            min={0}
                        />
                    </div>

                    {/* Stripe Price ID */}
                    <div className="form-control">
                        <label className="label">Stripe Price ID</label>
                        <input
                            className="input input-bordered w-full"
                            value={formData.priceId}
                            onChange={(e) => handleChange("priceId", e.target.value as TshirtValue)}
                            required
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

export default CreateTshirtModal;

"use client";

import React, { useState } from "react";
import { Product } from "@/generated/prisma";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onProductCreated: (product: Product) => void;
};

type ProductValue = Product[keyof Product];

const CreateProductModal: React.FC<Props> = ({
    isOpen,
    onClose,
    onProductCreated,
}) => {
    const [formData, setFormData] = useState<Product>({
        productId: "",
        name: "",
        price: 0,
        category: "",
        priceId: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const resetState = () => {
        setFormData({
            productId: "",
            name: "",
            price: 0,
            category: "",
            priceId: "",
        });
        setLoading(false);
    };

    const handleChange = (field: keyof Product, value: ProductValue) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                let message = "Failed to create product.";
                try {
                    const data = await res.json();
                    message = data?.error || message;
                } catch {
                    // res body was likely empty or not JSON
                }
                throw new Error(message);
            }

            const created = await res.json(); // only called if res.ok is true
            if (created) {
                onProductCreated(formData);
                resetState();
                onClose();
            }
            // now update state with `created`
        } catch (err) {
            console.error("Error creating product:", err);

            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred.");
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-primary p-6 rounded-xl shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Create New Product</h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="form-control">
                        <label className="label">Product ID</label>
                        <input
                            className="input input-bordered w-full"
                            value={formData.productId}
                            onChange={(e) =>
                                handleChange("productId", e.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">Name</label>
                        <input
                            className="input input-bordered w-full"
                            value={formData.name}
                            onChange={(e) =>
                                handleChange("name", e.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">Price (in cents)</label>
                        <input
                            type="number"
                            className="input input-bordered w-full"
                            value={formData.price ?? 0}
                            onChange={(e) =>
                                handleChange("price", parseInt(e.target.value))
                            }
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">Category</label>
                        <select
                            className="input input-bordered w-full"
                            value={formData.category}
                            onChange={(e) =>
                                handleChange("category", e.target.value)
                            }
                            required
                        >
                            <option value="ad">Ad</option>
                            <option value="shirt">Shirt</option>
                        </select>
                    </div>

                    <div className="form-control">
                        <label className="label">Stripe Price ID</label>
                        <input
                            className="input input-bordered w-full"
                            value={formData.priceId}
                            onChange={(e) =>
                                handleChange("priceId", e.target.value)
                            }
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

export default CreateProductModal;

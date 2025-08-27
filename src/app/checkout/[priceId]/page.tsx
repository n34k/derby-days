"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MetadataForm } from "@/components/MetadataForm";
import { Product } from "@/generated/prisma";
import { DefaultProduct, FormValueData } from "@/models/defaultValues";

const PurchasePage = () => {
    const params = useParams();
    const priceId = params?.priceId;
    const [product, setProduct] = useState<Product>(DefaultProduct);
    const [loading, setLoading] = useState(false);

    const handleMetadataSubmit = async (formValues: FormValueData) => {
        setLoading(true);
        const metadata = {
            ...formValues,
            category: product.category, // Inject the product's category here
            size: product.name,
        };

        const res = await fetch("/api/create-checkout-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product, metadata }),
        });

        const data = await res.json();

        if (data.url) {
            window.location.href = data.url;
        } else {
            console.error("Failed to create checkout session", data);
        }
        setLoading(false);
    };

    useEffect(() => {
        setLoading(true);
        const fetchProduct = async () => {
            const res = await fetch(`/api/products/${priceId}`);
            const data = await res.json();
            setProduct(data);
        };

        if (priceId) {
            fetchProduct();
        }
        setLoading(false);
    }, [priceId]);

    const priceInDollars = (price: number): number => {
        return price / 100;
    };

    return (
        <main className="flex justify-center items-center">
            {loading || !product.name ? (
                <div className="text-center py-10 text-xl">Loading...</div>
            ) : (
                <MetadataForm
                    onSubmit={handleMetadataSubmit}
                    productCost={priceInDollars(product.price)}
                    productName={product.name}
                    loading={loading}
                />
            )}
        </main>
    );
};

export default PurchasePage;

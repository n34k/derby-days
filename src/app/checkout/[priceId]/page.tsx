"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MetadataForm } from "@/components/MetadataForm";
import { Ad } from "@/generated/prisma";
import { FormValueData, DefaultProduct } from "@/models/defaultValues";
import adSizeDisplay from "@/lib/adSizeDisplay";

const PurchasePage = () => {
    const params = useParams();
    const priceId = params?.priceId;
    const [product, setProduct] = useState<Ad>(DefaultProduct);
    const [loading, setLoading] = useState(false);

    const handleMetadataSubmit = async (formValues: FormValueData) => {
        setLoading(true);
        const metadata = {
            ...formValues,
            category: "ad",
            size: product.size,
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
            const res = await fetch(`/api/ad/${priceId}`); //TODO: see if changing to ad is ok
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
            {loading || !product.sizeInches ? (
                <div className="text-center py-10 text-xl">Loading...</div>
            ) : (
                <MetadataForm
                    onSubmit={handleMetadataSubmit}
                    productCost={priceInDollars(product.price)}
                    productName={adSizeDisplay(product.size)}
                    loading={loading}
                />
            )}
        </main>
    );
};

export default PurchasePage;

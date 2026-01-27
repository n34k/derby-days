"use client";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { MetadataForm } from "@/components/MetadataForm";
import { FormValueData } from "@/models/defaultValues";

const DonationPage = () => {
    const searchParams = useSearchParams();
    const amount = parseFloat(searchParams.get("amount") || "0");
    const [loading, setLoading] = useState(false);

    const handleMetadataSubmit = async (formValues: FormValueData) => {
        setLoading(true);
        const metadata = {
            ...formValues,
            userData: null,
            category: "donation",
        };

        const res = await fetch("/api/create-checkout-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount, metadata }),
        });
        const data = await res.json();

        if (data.url) {
            window.location.href = data.url;
        } else {
            console.error("Failed to create checkout session", data);
        }
        setLoading(false);
    };

    return (
        <div className="flex justify-center items-center my-6">
            <MetadataForm
                onSubmit={handleMetadataSubmit}
                productCost={amount}
                productName="Donation"
                loading={loading}
            />
        </div>
    );
};

export default DonationPage;

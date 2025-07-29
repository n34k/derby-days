"use client";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { MetadataForm } from "@/components/MetadataForm";

type FormValueData = {
  email: string;
  name: string;
  note: string;
  referredBy: string;
  teamId: string;
}

const DonationPage = () => {
  const searchParams = useSearchParams();
  const amount = parseFloat(searchParams.get("amount") || "0");
  const [loading, setLoading] = useState(false);

  const handleMetadataSubmit = async (formValues:FormValueData) => {
    setLoading(true);
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, metadata: formValues }),
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
    <div className="flex justify-center p-5">
      <MetadataForm onSubmit={handleMetadataSubmit} loading={loading} />
    </div>
  );
};

export default DonationPage; //what the gel
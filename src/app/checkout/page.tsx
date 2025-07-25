"use client";
//THIS IS FOR DONATIONS SINCE THEY CAN BE A VARIABLE AMOUNT
import React, { useCallback } from "react";
import {  useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { CheckoutProvider } from "@stripe/react-stripe-js";
import { CheckoutForm } from "@/components/CheckoutForm";

// Load Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const Page = () => {
  const searchParams = useSearchParams();
  const amount = searchParams.get('amount');
  
  // Function that creates a Checkout Session
  // This is called automatically by the Checkout Provider
  const fetchClientSecret = useCallback(() => {
    return (
      fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Pass priceId to our server
        body: JSON.stringify({ amount }),
      })
        .then((res) => res.json())
        // Return the checkout session client secret
        .then((data) => data.clientSecret)
    );
  }, [amount]);

  // Wrap your custom CheckoutForm component with CheckoutProvider
  return (
    <CheckoutProvider
      stripe={stripePromise}
      options={{
        fetchClientSecret,
        elementsOptions: {
          appearance: {
            variables: {
              colorPrimary: "#556cd6",
            },
          },
        },
      }}
    >
      <div className="flex justify-center p-5">
          <CheckoutForm/>
      </div>
    </CheckoutProvider>
  );
}

export default Page

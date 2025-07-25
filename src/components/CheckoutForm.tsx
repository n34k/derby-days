import React, { useState } from "react";
import { PaymentElement, useCheckout } from "@stripe/react-stripe-js";

export const CheckoutForm = () => {
  const checkout = useCheckout();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Get the email address and update the customer
    const email = e.target.email.value;
    const updateResult = await checkout.updateEmail(email);
    if (updateResult.error) {
      setError(updateResult.error);
      setIsLoading(false);
      return;
    }

    // Confirm the payment
    // The user will be redirected automatically if successful
    const result = await checkout.confirm();

    // Display any errors
    if (result.type === "error") {
      setError(result.error);
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: "tabs",
  };

  return (
    <form className="flex flex-col gap-5 items-center justify-center min-h-screen" onSubmit={handleSubmit}>
      {/* Stripe requires reading the total amount and displaying in the UI */}
      <h1 className='text-3xl md:text-7xl font-bold'>Donation Amount: {checkout.total.total.amount}</h1>
      {/* Email address input */}
      <div className="email">
        <label>Email</label>
        <input className="input" type="text" name="email" />
      </div>
      <div>
        <label>Reffered By</label>
      </div>

      {/* Embed an iframe that collects payment details for a variety of payment methods */}
      <PaymentElement
        className=""
        options={paymentElementOptions}
      />

      {/* Submit button */}
      <button className="btn btn-secondary" disabled={isLoading}>
        <span id="button-text">
          {isLoading ? <div className="spinner"></div> : "Pay now"}
        </span>
      </button>

      {/* Show an error message */}
      {error && <div className="checkout-form-error">{error.message}</div>}
    </form>
  );
};
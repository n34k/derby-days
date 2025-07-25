"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, redirect } from "next/navigation";


export default function Page() {
  // Get the checkout session ID from the URL
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState(null);

  useEffect(() => {
    // Retrieve the checkout session status as soon as the page loads
    if (sessionId) {
      fetch(`/api/session-status?session_id=${sessionId}`)
        .then((res) => res.json())
        // Set the checkout session status in state
        .then((data) => setStatus(data.status));
    }
  }, [sessionId]);

  // Show loading indicator until we get checkout session status
  if (!status) {
    return <div className="spinner" />;
  }

  // Redirect if payment failed or was canceled
  if (status === "open") {
    return redirect("/");
  }

  return (
    <div className="container">
      <p className="message">Your purchase was successful</p>

      <Link href="/" className="button">
        Back to products
      </Link>
    </div>
  );
}
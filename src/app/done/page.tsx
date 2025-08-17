"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, redirect } from "next/navigation";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

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
    <main className="flex flex-col items-center justify-center px-4 pt-50 text-center">
      <div className="w-full max-w-xl space-y-6">
        <div className="flex items-center justify-center gap-2 md:gap-3">
          <h1 className="text-lg md:text-4xl font-semibold">
            Your transaction was successful
          </h1>
          <CheckCircleIcon className="h-6 w-6 md:h-8 md:w-8 text-success" />
        </div>
        <p className="text-base md:text-2xl text-info-content">
          Thank you for the support!
        </p>
        <Link href="/standings" className="btn btn-secondary">
          View Updated Standings
        </Link>
      </div>
    </main>
  );
}

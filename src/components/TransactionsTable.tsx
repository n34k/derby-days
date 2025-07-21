"use client"
import React, { useState } from "react";
import { ExternalTransaction } from "@/generated/prisma";

export const TransactionsTable = ({
  transactions,
}: {
  transactions: ExternalTransaction[];
}) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Transactions</h2>
      <div className="overflow-x-auto w-full">
          <table className="md:table-fixed w-full border border-base-content text-sm">
            <thead className="bg-base-200">
              <tr>
                <th className="border px-2 py-1">Amount</th>
                <th className="border px-2 py-1">Stripe ID</th>
                <th className="border px-2 py-1">Type</th>
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">Email</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id}>
                  <td className="border px-2 py-1">${txn.amount.toFixed(2)}</td>
                  <td className="border px-2 py-1">{txn.stripeId}</td>
                  <td className="border px-2 py-1">{txn.type}</td>
                  <td className="border px-2 py-1">{txn.name ?? "—"}</td>
                  <td className="border px-2 py-1">{txn.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
  );
};

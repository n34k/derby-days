import React from "react";
import { prisma } from "../../prisma";
import { auth } from "../../auth";
import { redirect } from "next/navigation";
import { User } from "@/generated/prisma";
import { UserTable } from "@/components/UsersTable";

const AdminPanel = async () => {
  const session = await auth();
  const user = session?.user as User

  if (user.globalRole !== "ADMIN") {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    include: {
      team: true,
    },
  });

  const teams = await prisma.team.findMany({
    include: {
      headCoach: true,
      derbyDarling: true,
    },
  });

  const transactions = await prisma.externalTransaction.findMany();

  return (
    <div className="flex flex-col bg-primary p-10 rounded-[var(--radius-box)] gap-10">
      <h1 className="text-2xl font-bold mb-5">Admin Dashboard</h1>

      {/* Users table */}
      <UserTable users={users}/>

      {/* Teams table */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Teams</h2>
        <table className="table-auto w-full border border-base-content text-sm">
          <thead className="bg-base-200">
            <tr>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">T-Shirts Sold</th>
              <th className="border px-2 py-1">Money Raised</th>
              <th className="border px-2 py-1">Points</th>
              <th className="border px-2 py-1">Head Coach</th>
              <th className="border px-2 py-1">Derby Darling</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <tr key={team.id}>
                <td className="border px-2 py-1">{team.name}</td>
                <td className="border px-2 py-1">{team.tshirtsSold}</td>
                <td className="border px-2 py-1">${team.moneyRaised.toFixed(2)}</td>
                <td className="border px-2 py-1">{team.points}</td>
                <td className="border px-2 py-1">
                  {team.headCoach?.name ?? "—"}
                </td>
                <td className="border px-2 py-1">
                  {team.derbyDarling?.name ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Transactions table */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Transactions</h2>
        <table className="table-auto w-full border border-base-content text-sm">
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

export default AdminPanel;

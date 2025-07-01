// components/UserTable.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { User } from "@/generated/prisma";

export const UserTable = ({ users }: { users: User[] }) => {
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<{ [key: string]: string | number | null }>({});

  const handleEdit = (user: User) => {
    setEditingUserId(user.id);
    setEditedData({
      name: user.name,
      walkoutSong: user.walkoutSong,
      moneyRaised: user.moneyRaised,
      globalRole: user.globalRole,
    });
  };

  const handleChange = (field: string, value: any) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (userId: string) => {
    await fetch(`/api/admin/user`, {
      method: "POST",
      body: JSON.stringify({
        userId,
        data: editedData,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    setEditingUserId(null);
  };

  return (
    <table className="table-auto w-full border border-base-content text-sm">
      <thead className="bg-base-200">
        <tr>
          <th className="border px-2 py-1">Name</th>
          <th className="border px-2 py-1">Email</th>
          <th className="border px-2 py-1">Image</th>
          <th className="border px-2 py-1">Money Raised</th>
          <th className="border px-2 py-1">Walkout Song</th>
          <th className="border px-2 py-1">Role</th>
          <th className="border px-2 py-1">Team</th>
          <th className="border px-2 py-1">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td className="border px-2 py-1">
              {editingUserId === user.id ? (
                <input
                  value={editedData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              ) : (
                user.name ?? "—"
              )}
            </td>
            <td className="border px-2 py-1">{user.email}</td>
            <td className="border px-2 py-1">
              {user.image ? (
                <Image
                  src={user.image}
                  alt="User Image"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                "—"
              )}
            </td>
            <td className="border px-2 py-1">
              {editingUserId === user.id ? (
                <input
                  type="number"
                  value={editedData.moneyRaised}
                  onChange={(e) =>
                    handleChange("moneyRaised", parseFloat(e.target.value))
                  }
                />
              ) : (
                `$${user.moneyRaised.toFixed(2)}`
              )}
            </td>
            <td className="border px-2 py-1">
              {editingUserId === user.id ? (
                <input
                  value={editedData.walkoutSong}
                  onChange={(e) => handleChange("walkoutSong", e.target.value)}
                />
              ) : (
                user.walkoutSong || "—"
              )}
            </td>
            <td className="border px-2 py-1">
              {editingUserId === user.id ? (
                <select
                  value={editedData.globalRole}
                  onChange={(e) => handleChange("globalRole", e.target.value)}
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="JUDGE">JUDGE</option>
                  <option value="HEAD_COACH">HEAD_COACH</option>
                  <option value="DERBY_DARLING">DERBY_DARLING</option>
                  <option value="BROTHER">BROTHER</option>
                </select>
              ) : (
                user.globalRole
              )}
            </td>
            <td className="border px-2 py-1">{user.team?.name ?? "—"}</td>
            <td className="border px-2 py-1">
              {editingUserId === user.id ? (
                <button onClick={() => handleSave(user.id)}>Save</button>
              ) : (
                <button onClick={() => handleEdit(user)}>Edit</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

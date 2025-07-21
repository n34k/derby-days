"use client"
import React, { useState } from "react";
import Image from "next/image";
import { User } from "@/generated/prisma";

import { PencilIcon, XMarkIcon, CheckIcon, TrashIcon } from "@heroicons/react/24/outline";

export const UsersTable = ({ users }: { users: User[] }) => {
  const [editing, setEditing] = useState(false)
  const [editedUsers, setEditedUsers] = useState<Record<string, Partial<User>>>({});
  const [usersState, setUsersState] = useState<User[]>(users);

  const toggleEditing = () => {
    setEditing(!editing)
  }

  const handleChange = (userId: string, field: keyof User, value: any) => {
    setEditedUsers(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    const updates = Object.entries(editedUsers)

    for (const [userId, updatedFields] of updates) {
      try {
        const response = await fetch(`/api/admin/user/${userId}`, {
          method: "PATCH",
          headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFields),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to update user ${userId}:`, errorData);
        continue;
      }

      const result = await response.json();
      console.log('Result:', result)
      setUsersState(prev => prev.map(user => user.id === userId ? { ...user, ...updatedFields }: user))

      } catch (error) {
        console.error(`Error updating user ${userId}:`, error);
      }
    }

    setEditing(false);
    setEditedUsers({});
  }

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`/api/admin/user/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Failed to delete user:", error);
        return;
      }

      setUsersState(prev => prev.filter(user => user.id !== userId));
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  

  return (
    <div>
      <div className="flex gap-5 items-center pb-5">
        <h2 className="text-xl font-semibold mb-2">Users</h2>
        {editing ? 
          <>
            <button className='btn btn-secondary w-1/6 self-center' onClick={toggleEditing}>
              Cancel
              <XMarkIcon className='h-4 w-4'/>
            </button>
            <button className='btn btn-secondary w-1/6 self-center' onClick={handleSave}>
              Save
              <CheckIcon className='h-4 w-4'/>
            </button>
          </>
        : 
        <button className='btn btn-secondary w-1/6 self-center' onClick={toggleEditing}>
          Edit  
          <PencilIcon className='h-4 w-4'/>
        </button>}
      </div>
      <div className="overflow-x-auto w-full">
        <table className="md:table-fixed w-full  border border-base-content text-sm">
          <thead className="bg-base-200">
            <tr>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Email</th>
              <th className="border px-2 py-1 md:w-[55px]">Image</th>
              <th className="border px-2 py-1">Money Raised</th>
              <th className="border px-2 py-1">Walkout Song</th>
              <th className="border px-2 py-1 ">Role</th>
              <th className="border px-2 py-1">Team</th>
              {editing && <th className="border px-2 py-1">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {usersState.map(user => {
              const isUserEdited = editedUsers[user.id];
              return (
                <tr key={user.id}>
                  <td className="border px-2 py-1">
                    {editing ? (
                      <input
                        className="w-full max-w-[150px] truncate"
                        value={isUserEdited?.name ?? user.name}
                        onChange={e => handleChange(user.id, "name", e.target.value)}
                      />
                    ) : (user.name ?? "—")}
                  </td>
                  <td className="border px-2 py-1"><div className="md:overflow-x-auto md:whitespace-nowrap">{user.email}</div></td>
                  <td className="border px-2 py-1">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt="User"
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : ("—")}
                  </td>
                  <td className="border px-2 py-1">
                    <div className="md:flex md:justify-center">
                      {editing ? (
                        <input
                          className="w-full max-w-[50px] truncate"
                          type="number"
                          value={isUserEdited?.moneyRaised ?? user.moneyRaised}
                          onChange={e =>
                            handleChange(user.id, "moneyRaised", parseFloat(e.target.value))
                          }
                        />
                      ) : (`$${user.moneyRaised.toFixed(2)}`)}
                    </div>
                  </td>
                  <td className="border px-2 py-1">
                    <div className="md:overflow-x-auto md:whitespace-nowrap">
                      {editing ? (
                        <input
                          className="w-full max-w-[150px] truncate"
                          value={isUserEdited?.walkoutSong ?? user.walkoutSong}
                          onChange={e =>
                            handleChange(user.id, "walkoutSong", e.target.value)
                          }
                        />
                      ) : (user.walkoutSong ?? "—")}
                    </div>
                  </td>
                  <td className="border px-2 py-1">
                    {editing ? (
                      <select
                        className="w-full max-w-[150px] truncate"
                        value={isUserEdited?.globalRole ?? user.globalRole}
                        onChange={e =>
                          handleChange(user.id, "globalRole", e.target.value)
                        }
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="JUDGE">JUDGE</option>
                        <option value="HEAD_COACH">HEAD_COACH</option>
                        <option value="DERBY_DARLING">DERBY_DARLING</option>
                        <option value="BROTHER">BROTHER</option>
                      </select>
                    ) : (user.globalRole)}
                  </td>
                  <td className="border px-2 py-1">{user.team?.name ?? "—"}</td>
                  {editing && (
                    <td className="border px-2 py-1">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="btn btn-error btn-xs text-white"
                        >
                          Delete
                          <TrashIcon className="h-4 w-4 ml-1"/>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

"use client";
import React, { useState } from "react";
import { Team } from "@/generated/prisma";
import { PencilIcon, XMarkIcon, CheckIcon, TrashIcon } from "@heroicons/react/24/outline";

export const TeamsTable = ({ teams }: { teams: Team[] }) => {
  const [editing, setEditing] = useState(false);
  const [editedTeams, setEditedTeams] = useState<Record<string, Partial<Team>>>({});
  const [teamState, setTeamState] = useState<Team[]>(teams);

  const toggleEditing = () => setEditing(!editing);

  const handleChange = (teamId: string, field: keyof Team, value: any) => {
    setEditedTeams(prev => ({
      ...prev,
      [teamId]: {
        ...prev[teamId],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    const updates = Object.entries(editedTeams);

    for (const [teamId, updatedFields] of updates) {
      try {
        const response = await fetch(`/api/admin/team/${teamId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedFields),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Failed to update team ${teamId}:`, errorData);
          continue;
        }

        setTeamState(prev => prev.map(team => team.id === teamId ? { ...team, ...updatedFields } : team));
      } catch (error) {
        console.error(`Error updating team ${teamId}:`, error);
      }
    }

    setEditing(false);
    setEditedTeams({});
  };

  const handleDelete = async (teamId: string) => {
    if (!confirm("Are you sure you want to delete this team?")) return;

    try {
      const res = await fetch(`/api/admin/team/${teamId}`, { method: "DELETE" });
      if (!res.ok) {
        const error = await res.json();
        console.error("Failed to delete team:", error);
        return;
      }
      setTeamState(prev => prev.filter(team => team.id !== teamId));
    } catch (err) {
      console.error("Error deleting team:", err);
    }
  };

  return (
    <div>
      <div className="flex gap-5 items-center pb-5">
        <h2 className="text-xl font-semibold mb-2">Teams</h2>
        {editing ? (
          <>
            <button className="btn btn-secondary w-1/6 self-center" onClick={toggleEditing}>
              Cancel <XMarkIcon className="h-4 w-4" />
            </button>
            <button className="btn btn-secondary w-1/6 self-center" onClick={handleSave}>
              Save <CheckIcon className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button className="btn btn-secondary w-1/6 self-center" onClick={toggleEditing}>
            Edit <PencilIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="overflow-x-auto w-full">
        <table className="md:table-fixed w-full border border-base-content text-sm">
          <thead className="bg-base-200">
            <tr>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">T-Shirts</th>
              <th className="border px-2 py-1">Money Raised</th>
              <th className="border px-2 py-1">Points</th>
              <th className="border px-2 py-1">Head Coach</th>
              <th className="border px-2 py-1">Derby Darling</th>
              {editing && <th className="border px-2 py-1">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {teamState.map(team => {
              const isTeamEdited = editedTeams[team.id];
              return (
                <tr key={team.id}>
                  <td className="border px-2 py-1">
                    {editing ? (
                      <input
                        className="w-full max-w-[150px] truncate"
                        value={isTeamEdited?.name ?? team.name}
                        onChange={e => handleChange(team.id, "name", e.target.value)}
                      />
                    ) : (team.name)}
                  </td>
                  <td className="border px-2 py-1">
                    {editing ? (
                      <input
                        type="number"
                        className="w-full max-w-[80px]"
                        value={isTeamEdited?.tshirtsSold ?? team.tshirtsSold ?? 0}
                        onChange={e => handleChange(team.id, "tshirtsSold", parseInt(e.target.value))}
                      />
                    ) : (team.tshirtsSold ?? "—")}
                  </td>
                  <td className="border px-2 py-1">
                    {editing ? (
                      <input
                        type="number"
                        step="0.01"
                        className="w-full max-w-[100px]"
                        value={isTeamEdited?.moneyRaised ?? team.moneyRaised ?? 0}
                        onChange={e => handleChange(team.id, "moneyRaised", parseFloat(e.target.value))}
                      />
                    ) : (`$${team.moneyRaised.toFixed(2)}`)}
                  </td>
                  <td className="border px-2 py-1">
                    {editing ? (
                      <input
                        type="number"
                        className="w-full max-w-[80px]"
                        value={isTeamEdited?.points ?? team.points ?? 0}
                        onChange={e => handleChange(team.id, "points", parseInt(e.target.value))}
                      />
                    ) : (team.points ?? "—")}
                  </td>
                  <td className="border px-2 py-1">
                    {editing ? (
                      <input
                        className="w-full max-w-[200px] truncate"
                        value={isTeamEdited?.headCoachId ?? team.headCoachId ?? ""}
                        onChange={e => handleChange(team.id, "headCoachId", e.target.value)}
                      />
                    ) : (team.headCoach?.name ?? "—")}
                  </td>
                  <td className="border px-2 py-1">
                    {editing ? (
                      <input
                        className="w-full max-w-[200px] truncate"
                        value={isTeamEdited?.derbyDarlingId ?? team.derbyDarlingId ?? ""}
                        onChange={e => handleChange(team.id, "derbyDarlingId", e.target.value)}
                      />
                    ) : (team.derbyDarling?.name ?? "—")}
                  </td>
                  {editing && (
                    <td className="border px-2 py-1">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleDelete(team.id)}
                          className="btn btn-error btn-xs text-white"
                        >
                          Delete <TrashIcon className="h-4 w-4 ml-1" />
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

"use client";
import { DerbyStats } from "@/generated/prisma";
import getYear from "@/lib/getYear";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AdminDerbyButtonsProps {
    derby: DerbyStats | null;
    users: { id: string; name: string | null }[];
}
//test push
export default function AdminDerbyButtons({ derby, users }: AdminDerbyButtonsProps) {
    const router = useRouter();
    const year = getYear();

    const [loading, setLoading] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string>("");

    const createDerbyDays = async () => {
        const confirmed = window.confirm(
            `Are you sure you want to create Derby Days for ${year}? This will delete all ads, tshirst purshases, donations, teams, judge accounts, and reset user stats from last Derby Days. This action cannot be undone.`
        );
        if (!confirmed) return;
        setLoading(true);
        await fetch("/api/admin/derby/create", {
            method: "POST",
            body: JSON.stringify({ year }),
            credentials: "include",
        });

        router.refresh();
        setLoading(false);
    };

    const endDerbyDays = async () => {
        const phrase = `END DERBY DAYS ${year}`;
        const input = window.prompt(
            `Are you sure you want to end Derby Days? Only do this after you have added points for the last event. To confirm, type:\n\n${phrase}\n\nThis action cannot be undone.`
        );
        if (input !== phrase) {
            alert("Derby Days not ended — confirmation phrase did not match.");
            return;
        }

        await fetch("/api/admin/derby/end", {
            method: "POST",
            body: JSON.stringify({ year }),
            credentials: "include",
        });

        router.refresh();
    };

    const transferAdmin = async () => {
        if (!selectedUserId) {
            alert("Please select a user to promote to admin.");
            return;
        }

        const ok = window.confirm("This will demote you to BROTHER and promote the selected user to ADMIN. Continue?");
        if (!ok) return;

        const res = await fetch("/api/admin/user/transferAdmin", {
            method: "POST",
            body: JSON.stringify({ newAdminId: selectedUserId }),
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            alert(`Failed to transfer admin: ${err.error || "Unknown error"}`);
            return;
        }

        alert("Admin role transferred successfully.");
        setSelectedUserId("");
        router.refresh();
    };

    if (derby?.status === "CREATED") return null;

    return (
        <div className="flex justify-center items-center bg-primary border rounded-2xl p-5 w-[90vw] flex-col gap-4">
            {!derby && (
                <>
                    <button
                        className="text-4xl font-bold bg-base-100 rounded-xl border w-[75vw] h-[100px] transition duration-300 transform hover:scale-110 hover:bg-secondary hover:bg-opacity-10"
                        onClick={createDerbyDays}
                    >
                        {loading ? "Loading..." : `Create ${year} Derby Days`}
                    </button>

                    {/* Transfer Admin UI */}
                    <div className="w-[75vw] flex flex-col gap-3 bg-base-100 rounded-xl border p-4">
                        <label
                            htmlFor="new-admin"
                            className="font-semibold text-lg"
                        >
                            Transfer Derby Daddy to:
                        </label>
                        <select
                            id="new-admin"
                            className="select select-bordered w-full"
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                        >
                            <option
                                value=""
                                disabled
                            >
                                Select a user…
                            </option>
                            {users.map((u) => (
                                <option
                                    key={u.id}
                                    value={u.id}
                                >
                                    {u.name}
                                </option>
                            ))}
                        </select>

                        <button
                            className="btn btn-error text-white font-bold"
                            onClick={transferAdmin}
                            disabled={!selectedUserId}
                        >
                            Confirm Transfer
                        </button>
                    </div>
                </>
            )}

            {derby?.status === "POST_DRAFT" && (
                <button
                    className="text-4xl font-bold bg-base-100 rounded-xl border w-[75vw] h-[100px] transition duration-300 transform hover:scale-110 hover:bg-secondary hover:bg-opacity-10"
                    onClick={endDerbyDays}
                >
                    End {year} Derby Days
                </button>
            )}

            {derby?.status === "COMPLETE" && (
                <div>
                    Derby Days is complete for {year}. Please wait for {Number(year) + 1} to pass the app to the next
                    Derby Daddy.
                </div>
            )}
        </div>
    );
}

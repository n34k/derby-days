"use client";
import { signOut } from "next-auth/react";

const SignOutButton = () => (
    <button
        className="btn btn-error w-[175px]"
        onClick={() => signOut({ callbackUrl: "/" })}
    >
        Sign Out
    </button>
);

export default SignOutButton;

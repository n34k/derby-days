"use client";

import React from "react";
import { signIn } from "next-auth/react";

type SignInProps = {
    children: React.ReactNode;
    provider?: Parameters<typeof signIn>[0]; // e.g. "google"
    callbackUrl?: Parameters<typeof signIn>[1] extends { callbackUrl?: infer U }
        ? U
        : string | undefined;
};

const SignIn: React.FC<SignInProps> = ({
    children,
    provider = "google",
    callbackUrl,
}) => {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await signIn(provider, { callbackUrl }, { prompt: "select_account" });
    };

    return <form onSubmit={handleSubmit}>{children}</form>;
};

export default SignIn;

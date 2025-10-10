import SignIn from "@/components/SignIn";
import React from "react";

const page = () => {
    return (
        <main className="flex items-center justify-center px-4 py-40 text-center">
            <div className="flex flex-col gap-5 items-center justify-center rounded-lg border border-secondary bg-primary py-5 px-10">
                <h1 className="font-semibold text-6xl">Brothers Only</h1>
                <p className="text-lg text-info-content">
                    Signing in is reserved for Sigma Chi brothers only. Only
                    continue if you are one.
                </p>
                <SignIn callbackUrl="/account">
                    <button className="btn btn-secondary btn-lg">
                        Sign In
                    </button>
                </SignIn>
            </div>
        </main>
    );
};

export default page;

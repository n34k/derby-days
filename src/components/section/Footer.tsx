import getYear from "@/lib/getYear";
import Link from "next/link";
import React from "react";

export default function Footer() {
    return (
        <div>
            <div className="flex gap- justify-center items-center shadow-lg bg-base z-50 border-t-1 border-info-content py-5">
                <p className="text-subText text-info-content">
                    &copy; {getYear()} Fresno State Sigma Chi. All rights reserved. &nbsp;
                    <Link
                        className="text-blue-600 underline mb-2"
                        href={"/disclosures"}
                    >
                        Disclosures and Policies
                    </Link>
                </p>
            </div>
        </div>
    );
}

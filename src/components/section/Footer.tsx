import getYear from "@/lib/getYear";
import React from "react";

export default function Footer() {
    return (
        <div>
            <div className="flex justify-center items-center shadow-lg bg-base z-50 border-t-1 border-info-content py-5">
                <p className="text-subText text-info-content">
                    &copy; {getYear()} Fresno State Sigma Chi. All rights reserved.
                </p>
            </div>
        </div>
    );
}

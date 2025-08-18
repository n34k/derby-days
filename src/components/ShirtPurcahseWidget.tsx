import Image from "next/image";
import Link from "next/link";
import React from "react";

const ShirtPurcahseWidget = () => {
    return (
        <div className="w-[320px] h-[450px] flex flex-col items-center justify-between gap-5 bg-primary p-5 rounded-2xl border-2 border-secondary shadow-lg">
            <div className="flex flex-col text-center">
                <h1 className="text-4xl font-bold text-secondary">
                    Buy T-Shirt
                </h1>
                <p className="text-info-content text-sm md:text-base">
                    PREVIEW
                </p>
            </div>
            <div className="relative w-[240px] h-[240px] mx-auto">
                <Image
                    src="/images/shirtplaceholder.webp"
                    alt="shirt picture"
                    fill
                    className="border-2 border-primary rounded-md"
                />
            </div>
            <Link
                href="/checkout/shirt"
                className="btn btn-secondary btn-lg p-3 transition duration-300 hover:text-secondary hover:scale-110"
            >
                Buy Shirt
            </Link>
        </div>
    );
};

export default ShirtPurcahseWidget;

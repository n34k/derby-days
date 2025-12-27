import Image from "next/image";
import Link from "next/link";
import React from "react";
import { prisma } from "../../prisma";

const ShirtPurcahseWidget = async () => {
    const shirts = await prisma.tshirt.findMany();
    return (
        <div className="w-[320px] h-[450px] flex flex-col items-center justify-between gap-5 bg-primary p-5 rounded-2xl border shadow-lg">
            <div className="flex flex-col text-center">
                <h1 className="text-4xl font-bold text-secondary">Buy T-Shirt</h1>
                <p className="text-info-content text-sm md:text-base">PREVIEW</p>
            </div>
            <div className="relative w-[240px] h-[240px] mx-auto">
                <Image
                    src="/images/shirtplaceholder.webp"
                    alt="shirt picture"
                    fill
                    className="border-1 border-primary rounded-md"
                />
            </div>
            {shirts.length > 0 ? (
                <Link
                    href="/checkout/shirt"
                    className="btn btn-secondary btn-lg p-3 transition duration-300 hover:text-secondary hover:scale-110"
                >
                    Buy Shirt
                </Link>
            ) : (
                <div className="btn btn-info btn-lg p-3">Coming Soon</div>
            )}
        </div>
    );
};

export default ShirtPurcahseWidget;

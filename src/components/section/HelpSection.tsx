import React from "react";
import Service from "@/components/Service";
import { BanknotesIcon, GiftIcon, ShoppingBagIcon, MegaphoneIcon } from "@heroicons/react/24/solid";

const HelpSection = () => {
    return (
        <section className="flex flex-col bg-base items-center justify-start relative w-full gap-8 px-6">
            <div className="flex flex-col items-center gap-3">
                <p className="font-bold text-base-content text-3xl md:text-5xl text-center">How to Help</p>
                <p className="text-info-content text-sm md:text-base">SUPPORT US</p>
            </div>
            <div className="flex flex-col gap-10 w-full max-w-4xl">
                <Service
                    title="Donate Directly"
                    Icon={GiftIcon}
                >
                    The easiest way to support us is to donate money directly. Every donor will have the choice to show
                    their name on our donors page and Derby Days book. All donations go direclty to Valley
                    Children&apos;s Hospital
                </Service>
                <Service
                    title="Purchase an Ad"
                    Icon={BanknotesIcon}
                >
                    Purchase an ad to show of your business or anything you&apos;d like. We offer ads of varying sizes.
                    All purchasers will get a copy of the Derby Days Book. All ads will be featrued on our donors page
                    and Derby Days book.
                </Service>
                <Service
                    title="Purchase a Shirt"
                    Icon={ShoppingBagIcon}
                >
                    Buy a Derby Days shirt. We have sizes from S to XL. Sales will open during Derby Days season.
                </Service>
                <Service
                    title="Spread the Word"
                    Icon={MegaphoneIcon}
                >
                    Tell friends and family about what we are doing. Help raise awareness for the cause we are fighting
                    for.
                </Service>
            </div>
        </section>
    );
};

export default HelpSection;

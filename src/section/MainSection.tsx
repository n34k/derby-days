import React from "react";
import Image from "next/image";

const MainSection = () => {
    const year = new Date().getFullYear();
    return (
        <section className="relative h-[92vh] w-full overflow-hidden">
            {/* Background Image */}
            <Image
                src="/images/chapterhouse.jpg"
                alt="Logo"
                fill
                className="object-cover"
                priority
            />

            {/* Tint Overlay */}
            <div className="absolute inset-0 bg-black/70 mix-blend-multiply z-10" />

            {/* Content on top */}
            <div className="relative z-20 flex flex-col gap-5 items-center top-30 h-full text-base-content text-center">
                <p>The Epsilon Eta chapter of Sigma Chi presents:</p>
                <h1 className="text-base-content text-8xl font-bold">
                    Derby Days {year}
                </h1>
                <p>Fresno, CA</p>
            </div>
        </section>
    );
};

export default MainSection;

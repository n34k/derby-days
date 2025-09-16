import React from "react";
import { prisma } from "../../../prisma";
import Image from "next/image";

const page = async () => {
    const derbyDaddy = await prisma.user.findFirst({
        where: { globalRole: "ADMIN" },
    });

    const judges = await prisma.user.findMany({
        where: { globalRole: "JUDGE" },
    });

    const year = new Date().getFullYear();

    return (
        <main className="flex flex-col items-center justify-evenly py-10 px-10 gap-10">
            <div className="flex flex-col md:flex-row items-center justify-center gap-5 p-5 bg-primary rounded-lg border-1 border-secondary w-[85vw]">
                {/* Text side */}
                <div className="flex flex-col gap-3 w-full md:max-w-1/2 text-center">
                    <h1 className="text-5xl text-base-content font-bold">
                        {year} Derby Daddy
                    </h1>
                    <h2 className="text-3xl text-info-content">
                        {derbyDaddy?.name}
                    </h2>
                    <p className="text-base-content">
                        Hello everyone, my name is Nick Davis, and I am proud to
                        serve as the Sigma Chi Epsilon Eta 2026 Philanthropy
                        Chair and the leader of this year’s Derby Days. Derby
                        Days is one of the most fun, impactful, and rewarding
                        events I have ever had the privilege of being a part of,
                        and it has shown me the true power of community when
                        people come together for a cause bigger than themselves.
                    </p>
                    <p>
                        This year, I’ve poured countless hours of time and
                        dedication not only into planning Derby Days but also
                        into creating this website as a way to leave a lasting
                        impact on our chapter’s philanthropy. My goal was to
                        build a space that not only showcases the spirit of
                        Derby Days but also makes it easier for everyone to get
                        involved, support our mission, and see the difference we
                        are making together.
                    </p>
                    <p>
                        For me, Derby Days is more than just a tradition—it’s an
                        opportunity to make a meaningful contribution to Valley
                        Children’s Hospital and to ensure that our chapter’s
                        efforts live on in a way that inspires future brothers,
                        sisters, and supporters. I hope this site helps capture
                        that passion and continues to grow the legacy of giving
                        back through Sigma Chi.
                    </p>
                </div>

                {/* Image side */}
                <div className="flex justify-center items-center w-full md:w-1/2">
                    <Image
                        alt="Derby Daddy Picture"
                        src={derbyDaddy?.image ?? "none"}
                        width={500}
                        height={500}
                        className="object-cover rounded-lg md:h-[500px] md:w-[500px] border-1 border-info-content"
                    />
                </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-5 p-5 bg-primary rounded-lg border-1 border-secondary w-[85vw]">
                <h1 className="text-5xl text-base-content font-bold mb-5">
                    Judges
                </h1>
                {judges.length > 0 ? (
                    <div className="w-full flex-1 overflow-y-auto">
                        <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {judges.map((judge, idx) => (
                                <li
                                    key={`${judge.name ?? "judge"}-${idx}`}
                                    className="flex flex-col items-center gap-2.5"
                                >
                                    {judge.image ? (
                                        <Image
                                            src={judge.image}
                                            alt={`${
                                                judge.name ?? "judge"
                                            }'s profile photo`}
                                            width={300}
                                            height={300}
                                            className="rounded-full h-[150px] w-[150px] md:w-[300px] md:h-[300px]"
                                        />
                                    ) : (
                                        <p className="w-[150px] h-[150px] md:w-[300px] md:h-[300px] rounded-full bg-secondary/20 flex items-center justify-center text-sm">
                                            X
                                        </p>
                                    )}
                                    <h3 className="text-lg text-info-content text-center">
                                        {judge.name}
                                    </h3>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p>Judges coming soon.</p>
                )}
            </div>
        </main>
    );
};

export default page;

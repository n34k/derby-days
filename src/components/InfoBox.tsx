import { SaleInfo, TextColors } from "@/models/DefaultValues";
import React from "react";

interface InfoBoxProps {
    title: string;
    info?: { textColor: TextColors; text: string };
    saleInfo?: SaleInfo[];
}

const InfoBox = ({ title, info, saleInfo = [] }: InfoBoxProps) => {
    const hasItems = saleInfo.length > 0;

    return (
        <div className="flex flex-col h-fit md:max-h-[17.5vh] overflow-scroll items-center bg-base-200 rounded-lg p-5 shadow">
            <h2 className="text-2xl font-semibold text-center text-info-content mb-2">
                {title}
            </h2>
            {/* Normal info box to display one thing*/}
            {info ? (
                <p
                    className={`text-2xl font-bold text-center ${info.textColor}`}
                >
                    {info.text}
                </p>
            ) : !hasItems ? (
                <p className="text-error">None</p>
            ) : (
                <div className="w-full space-y-2">
                    {/* Area to display ad info, first check if they have any yet */}
                    {saleInfo.map((item) => {
                        const created =
                            item.createdAt instanceof Date
                                ? item.createdAt
                                : new Date(item.createdAt);
                        return (
                            <div
                                key={
                                    created.toISOString() +
                                    ":" +
                                    String(item.name)
                                }
                                className="flex flex-col items-center w-full rounded-md bg-base-100 p-3"
                            >
                                <p className="font-semibold text-center">
                                    From {item.name}
                                </p>
                                <p>
                                    $
                                    {typeof item.amount === "number"
                                        ? item.amount.toFixed(2)
                                        : Number(item.amount).toFixed(2)}
                                </p>
                                <p>
                                    {created.toLocaleString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                        hour: "numeric",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default InfoBox;

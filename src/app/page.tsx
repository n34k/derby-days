import React from "react";
import MainSection from "@/section/MainSection";
import WhatSection from "@/section/WhatSection";
import HelpSection from "@/section/HelpSection";
import DoneSection from "@/section/DoneSection";
import TotalRaisedDisplay from "@/components/TotalRaisedDisplay";

const HomePage = () => {
    return (
        <div className="flex flex-col pb-15 gap-15">
            <MainSection />
            <WhatSection />
            <TotalRaisedDisplay />
            <DoneSection />
            <HelpSection />
        </div>
    );
};

export default HomePage;

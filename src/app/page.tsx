import React from "react";
import MainSection from "@/components/section/MainSection";
import WhatSection from "@/components/section/WhatSection";
import HelpSection from "@/components/section/HelpSection";
import DoneSection from "@/components/section/DoneSection";
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

import { $Enums } from "@/generated/prisma";

export const adUploadPresets = (size: $Enums.AdSize) => {
    switch (size) {
        case $Enums.AdSize.BUSINESS_CARD:
            return "card";
        case $Enums.AdSize.QUARTER_PAGE:
            return "quarter";
        case $Enums.AdSize.HALF_PAGE:
            return "half";
        case $Enums.AdSize.FULL_PAGE:
            return "full";
        case $Enums.AdSize.TWO_PAGES:
            return "two";
        case $Enums.AdSize.CENTER_FOLDOUT:
            return "center";
        default:
            return "full";
    }
};

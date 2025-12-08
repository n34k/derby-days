import { $Enums } from "@/generated/prisma";

export default function adSizeDisplay(size: $Enums.AdSize): string {
    const sizeMap: Record<string, string> = {
        BUSINESS_CARD: "Business Card",
        QUARTER_PAGE: "Quarter Page",
        HALF_PAGE: "Half Page",
        FULL_PAGE: "Full Page",
        CENTER_FOLDOUT: "Center Foldout",
        OUTSIDE_BACK_COVER: "Outside Back Cover",
        INSIDE_BACK_COVER: "Inside Back Cover",
        INSIDE_FRONT_COVER: "Inside Front Cover",
        TWO_PAGES: "Two Pages",
    };

    return sizeMap[size] || size;
}

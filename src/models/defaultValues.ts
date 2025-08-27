import { Product } from "@/generated/prisma";

export const DefaultProduct: Product = {
    productId: "",
    name: "",
    price: 0,
    priceId: "",
    category: "",
};

export type FormValueData = {
    //move this to types folder if i need to make one
    email: string;
    name: string;
    note: string;
    referredBy: string;
    teamId: string;
};
export type TextColors =
    | "text-base-content"
    | "text-secondary"
    | "text-info-content"
    | "text-success"
    | "text-error";

export type InfoBoxText = {
    text: string;
    textColor: TextColors;
};

export type SaleInfo = {
    amount: number;
    name: string;
    createdAt: Date;
};

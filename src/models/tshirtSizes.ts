export const tshirtSizes = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export type Size = (typeof tshirtSizes)[number];

export const CLOSE_SHIRT_SALES_DATE = new Date("2026-03-21T00:00:00Z");

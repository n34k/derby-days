export const tshirtSizes = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export type Size = (typeof tshirtSizes)[number];

export const PRODUCTS = {
    ads: {
        fullPage: {
            name: "Full Page",
            price: 500,
            priceId: "price_1RoaJMJV1UZkzYN0NHbbjK2F",
        },
        halfPage: {
            name: "Half Page",
            price: 250,
            priceId: "price_1RoaOuJV1UZkzYN0ESCqzxKm",
        },
        quarterPage: {
            name: "Quarter Page",
            price: 150,
            priceId: "price_1RoaPOJV1UZkzYN0ItKCO4E4",
        },
        businessCard: {
            name: "Business Card",
            price: 50,
            priceId: "price_1RoaQ6JV1UZkzYN01CTsKZw4",
        },
    },
    tshirt: {
        name: "T-Shirt",
        price: 20,
        priceId: "price_1RoaQTJV1UZkzYN0pNhGL0rV",
    },
};

export const adPriceMap = new Map<string, number>([
    ["Business Card", 50],
    ["Quarter Page", 100],
    ["Half Page", 250],
    ["Full Page", 500],
]);

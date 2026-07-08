const MS_IN_DAY = 24 * 60 * 60 * 1000;

export interface FoodDiscount {
    percent: number;
    startDate: Date;
    endDate: Date;
}

// Дата окончания включительно: акция действует до конца дня endDate
export const isDiscountActive = (discount: FoodDiscount | null | undefined): boolean => {
    if (!discount) return false;

    const now = Date.now();
    const start = new Date(discount.startDate).getTime();
    const endExclusive = new Date(discount.endDate).getTime() + MS_IN_DAY;

    return now >= start && now < endExclusive;
};

export const getEffectivePrice = (price: number, discount: FoodDiscount | null | undefined): number => {
    if (!isDiscountActive(discount)) return price;

    const discounted = price * (100 - discount!.percent) / 100;
    return Math.round(discounted * 100) / 100;
};

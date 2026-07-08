import type { Discount, Food } from '../types/food';

const MS_IN_DAY = 24 * 60 * 60 * 1000;

// Дата окончания включительно: акция действует до конца дня endDate
export const isDiscountActive = (discount: Discount | null | undefined): boolean => {
  if (!discount) return false;

  const now = Date.now();
  const start = new Date(discount.startDate).getTime();
  const endExclusive = new Date(discount.endDate).getTime() + MS_IN_DAY;

  return now >= start && now < endExclusive;
};

export const getActiveDiscount = (food: Food): Discount | null => {
  return isDiscountActive(food.discount) ? food.discount! : null;
};

export const getDiscountedPrice = (price: number, percent: number): number => {
  const discounted = price * (100 - percent) / 100;
  return Math.round(discounted * 100) / 100;
};

export const getEffectivePrice = (food: Food): number => {
  const discount = getActiveDiscount(food);
  return discount ? getDiscountedPrice(food.price, discount.percent) : food.price;
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
};

export const formatDiscountPeriod = (discount: Discount): string => {
  return `${formatDate(discount.startDate)} – ${formatDate(discount.endDate)}`;
};

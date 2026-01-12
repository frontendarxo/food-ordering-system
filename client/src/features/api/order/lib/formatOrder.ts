import type { Order } from '../../../../types/order';

export const getDeliveryMethodText = (method: Order['deliveryMethod']): string => {
  const methodMap = {
    'самовызов': 'Самовызов',
    'доставка': 'Доставка',
  };
  return methodMap[method] || method;
};

export const getPaymentMethodText = (method: Order['paymentMethod']): string => {
  const methodMap = {
    'наличка': 'Наличными',
    'карта': 'Картой',
  };
  return methodMap[method] || method;
};


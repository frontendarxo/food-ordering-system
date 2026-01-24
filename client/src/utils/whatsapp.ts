import type { Location } from '../contexts/locationContext';
import { formatPrice } from '../features/api/cart/lib';

const WHATSAPP_PHONES: Record<Location, string> = {
  гикало: '+79667296868',
  шатой: '+79656329595',
};

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderData {
  phoneNumber: string;
  total: number;
  deliveryMethod: 'самовызов' | 'доставка';
  address?: string;
  paymentMethod: 'наличка' | 'карта';
  orderItems: OrderItem[];
  location: Location;
}

export const sendOrderToWhatsApp = (orderData: OrderData) => {
  const { phoneNumber, total, deliveryMethod, address, paymentMethod, location, orderItems } = orderData;
  
  const whatsappPhone = WHATSAPP_PHONES[location];
  
  let message = 'Ассаламу алайкум!\n\n';
  message += `Номер телефона: ${phoneNumber}\n`;
  
  if (deliveryMethod === 'доставка' && address) {
    message += `Адрес доставки: ${address}\n`;
  }
  
  if (deliveryMethod === 'самовызов') {
    message += 'Способ получения: Самовывоз\n';
  }
  
  message += `\nТовары:\n`;
  orderItems.forEach(item => {
    const itemTotal = item.price * item.quantity;
    message += `- ${item.name} x${item.quantity} = ${formatPrice(itemTotal)}\n`;
  });
  
  message += `\nСумма заказа: ${formatPrice(total)}\n`;
  message += `Метод оплаты: ${paymentMethod === 'наличка' ? 'Наличными' : 'Картой'}`;
  
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${whatsappPhone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
  
  window.location.href = whatsappUrl;
};

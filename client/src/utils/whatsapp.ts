import type { Location } from '../contexts/locationContext';
import { formatPrice } from '../features/api/cart/lib';

const WHATSAPP_PHONES: Record<Location, string> = {
  гикало: '+79667296868',
  шатой: '+79656329595',
};

interface OrderData {
  phoneNumber: string;
  total: number;
  deliveryMethod: 'самовызов' | 'доставка';
  address?: string;
  paymentMethod: 'наличка' | 'карта';
  location: Location;
}

export const sendOrderToWhatsApp = (orderData: OrderData) => {
  const { phoneNumber, total, deliveryMethod, address, paymentMethod, location } = orderData;
  
  const whatsappPhone = WHATSAPP_PHONES[location];
  
  let message = 'Ассаламу алайкум!\n\n';
  message += `Номер телефона: ${phoneNumber}\n`;
  
  if (deliveryMethod === 'доставка' && address) {
    message += `Адрес доставки: ${address}\n`;
  }
  
  message += `Сумма заказа: ${formatPrice(total)}\n`;
  message += `Метод оплаты: ${paymentMethod === 'наличка' ? 'Наличными' : 'Картой'}`;
  
  if (deliveryMethod === 'самовызов') {
    message += '\nСпособ получения: Самовывоз';
  }
  
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${whatsappPhone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
  
  window.open(whatsappUrl, '_blank');
};

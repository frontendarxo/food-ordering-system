import { BASE_URL } from '../api/config';

export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  if (imagePath.startsWith('/')) {
    return `${BASE_URL}${imagePath}`;
  }
  
  return `${BASE_URL}/${imagePath}`;
};


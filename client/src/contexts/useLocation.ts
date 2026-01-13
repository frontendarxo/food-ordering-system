import { useContext } from 'react';
import { LocationContext, type LocationContextType } from './locationContext';

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
};


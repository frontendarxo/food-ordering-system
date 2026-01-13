import { useState, useEffect, type ReactNode } from 'react';
import { LocationContext as LocationCtx, type Location } from './locationContext';

const LOCATION_STORAGE_KEY = 'selected_location';

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocationState] = useState<Location | null>(() => {
    try {
      const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (saved && (saved === 'шатой' || saved === 'гикало')) {
        return saved as Location;
      }
      return null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (location) {
      localStorage.setItem(LOCATION_STORAGE_KEY, location);
    } else {
      localStorage.removeItem(LOCATION_STORAGE_KEY);
    }
  }, [location]);

  const setLocation = (newLocation: Location) => {
    setLocationState(newLocation);
  };

  return (
    <LocationCtx.Provider value={{ location, setLocation }}>
      {children}
    </LocationCtx.Provider>
  );
};


import { createContext } from 'react';

export type Location = 'шатой' | 'гикало';

export interface LocationContextType {
  location: Location | null;
  setLocation: (location: Location) => void;
}

export const LocationContext = createContext<LocationContextType | undefined>(undefined);


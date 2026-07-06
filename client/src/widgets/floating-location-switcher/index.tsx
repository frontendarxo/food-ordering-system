import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from '../../contexts/useLocation';
import type { Location } from '../../contexts/locationContext';
import './style.css';

type LocationOption = {
  value: Location;
  label: string;
};

const LOCATION_OPTIONS: LocationOption[] = [
  { value: 'шатой', label: 'Шатой' },
  { value: 'гикало', label: 'Гикало' },
];

const getLocationLabel = (location: Location | null): string => {
  const option = LOCATION_OPTIONS.find((item) => item.value === location);
  return option?.label ?? 'Выбрать';
};

export const FloatingLocationSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { location, setLocation } = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  const locationLabel = useMemo(() => getLocationLabel(location), [location]);

  const handleLocationSelect = (newLocation: Location) => {
    setLocation(newLocation);
    setIsOpen(false);
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (!containerRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <div className="floating-location" ref={containerRef}>
      {isOpen && (
        <div className="floating-location-menu">
          {LOCATION_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`floating-location-option ${location === option.value ? 'active' : ''}`}
              onClick={() => handleLocationSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
      <button type="button" className="floating-location-button" onClick={handleToggle}>
        <span className="floating-location-icon">📍</span>
        <span className="floating-location-label">{locationLabel}</span>
      </button>
    </div>
  );
};

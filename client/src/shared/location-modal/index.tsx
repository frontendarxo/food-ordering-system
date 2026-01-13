import { useLocation } from '../../contexts/useLocation';
import './style.css';

export const LocationModal = () => {
  const { location, setLocation } = useLocation();

  if (location) {
    return null;
  }

  const handleSelectLocation = (selectedLocation: 'шатой' | 'гикало') => {
    setLocation(selectedLocation);
  };

  return (
    <div className="location-modal-overlay">
      <div className="location-modal">
        <div className="location-modal-header">
          <h2 className="location-modal-title">Выберите ваше местоположение</h2>
        </div>
        <div className="location-modal-body">
          <button
            className="location-modal-button"
            onClick={() => handleSelectLocation('шатой')}
          >
            Шатой
          </button>
          <button
            className="location-modal-button"
            onClick={() => handleSelectLocation('гикало')}
          >
            Гикало
          </button>
        </div>
      </div>
    </div>
  );
};


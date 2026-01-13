import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../shared/button';
import './style.css';

const REDIRECT_DELAY = 3;

export const NotFound = () => {
  const [countdown, setCountdown] = useState(REDIRECT_DELAY);
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown === 0) {
      navigate('/');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <h1 className="not-found-title">404</h1>
        <p className="not-found-message">Страница не найдена</p>
        <p className="not-found-description">
          Переход на главную страницу через {countdown} секунд
        </p>
        <Button onClick={handleGoHome}>На главное меню</Button>
      </div>
    </div>
  );
};



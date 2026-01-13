import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import { Button } from '../../shared/button';
import './style.css';

export const Login = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login: loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!login || !password) {
      setError('Заполните все поля');
      setIsLoading(false);
      return;
    }

    try {
      const success = await loginUser(login, password);
      if (success) {
        navigate('/');
      } else {
        setError('Неверный логин или пароль');
      }
    } catch (err) {
      if(err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ошибка входа. Попробуйте снова.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Вход</h1>
        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="login">Логин</label>
            <input
              id="login"
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Введите логин"
              autoComplete="username"
              disabled={isLoading}
            />
          </div>
          <div className="login-field">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>
          {error && <div className="login-error">{error}</div>}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Вход...' : 'Войти'}
          </Button>
        </form>
        <div className="login-footer">
          <Button type="button" onClick={() => navigate('/')}>
            На главное меню
          </Button>
        </div>
      </div>
    </div>
  );
};


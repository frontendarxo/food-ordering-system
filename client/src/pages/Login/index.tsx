import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import { Field } from '../../shared/field';
import { Button } from '../../shared/button';
import './style.css';

export const Login = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login: loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!login || !password) {
      setError('Заполните все поля');
      return;
    }

    const success = loginUser(login, password);
    if (success) {
      navigate('/');
    } else {
      setError('Неверный логин или пароль');
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
            />
          </div>
          {error && <div className="login-error">{error}</div>}
          <Button type="submit">Войти</Button>
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


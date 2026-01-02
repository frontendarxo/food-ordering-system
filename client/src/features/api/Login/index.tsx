import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Title } from '../../../shared/title';
import { Button } from '../../../shared/button';
import { Field } from '../../../shared/field';
import { PasswordField } from '../../../shared/password-field';
import { useLogin } from './model';
import './style.css';

export const Login = () => {
  const [number, setNumber] = useState('');
  const [password, setPassword] = useState('');
  const { handleLogin, error } = useLogin();

  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    
    if (digits.length === 0) {
      return '';
    }
    
    if (digits.startsWith('7')) {
      return '8' + digits.slice(1);
    }
    
    if (digits.startsWith('8')) {
      return digits;
    }
    
    return '8' + digits;
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setNumber(formatted);
  };

  const handleNumberFocus = () => {
    if (!number) {
      setNumber('8');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleLogin(number, password);
  };

  return (
    <div className="login">
      <Title level={2}>Вход</Title>
      <form onSubmit={handleSubmit} className="login-form">
        {error && <div className="error-message">{error}</div>}
        <Field
          label="Номер"
          type="tel"
          id="number"
          value={number}
          onChange={handleNumberChange}
          onFocus={handleNumberFocus}
        />
        <PasswordField
          label="Пароль"
          id="password"
          value={password}
          onChange={handlePasswordChange}
        />
        <Button type="submit">Войти</Button>
        <div className="login-link">
          Нет аккаунта? <Link to="/auth/register">Зарегистрироваться</Link>
        </div>
      </form>
    </div>
  );
};

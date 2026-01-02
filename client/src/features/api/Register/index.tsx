import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Title } from '../../../shared/title';
import { Button } from '../../../shared/button';
import { Field } from '../../../shared/field';
import { useRegister } from './model';
import './style.css';

export const Register = () => {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [password, setPassword] = useState('');
  const { handleRegister, error } = useRegister();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

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
    await handleRegister(name, number, password);
  };

  return (
    <div className="register">
      <Title level={2}>Регистрация</Title>
      <form onSubmit={handleSubmit} className="register-form">
        {error && <div className="error-message">{error}</div>}
        <Field
          label="Имя"
          type="text"
          id="name"
          value={name}
          onChange={handleNameChange}
        />
        <Field
          label="Номер"
          type="tel"
          id="number"
          value={number}
          onChange={handleNumberChange}
          onFocus={handleNumberFocus}
        />
        <Field
          label="Пароль"
          type="password"
          id="password"
          value={password}
          onChange={handlePasswordChange}
        />
        <Button type="submit">Зарегистрироваться</Button>
        <div className="register-link">
          Уже есть аккаунт? <Link to="/auth/login">Войти</Link>
        </div>
      </form>
    </div>
  );
};

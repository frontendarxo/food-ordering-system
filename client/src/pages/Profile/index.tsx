import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateName, updatePassword, clearError } from '../../store/slices/authSlice';
import { Title } from '../../shared/title';
import { Button } from '../../shared/button';
import { Field } from '../../shared/field';
import { PasswordField } from '../../shared/password-field';
import './style.css';

export const Profile = () => {
  const dispatch = useAppDispatch();
  const { user, isLoading, error } = useAppSelector((state) => state.auth);
  
  const [name, setName] = useState(user?.name || '');

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameSuccess, setNameSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleUpdateName = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNameError('');
    setNameSuccess('');
    dispatch(clearError());

    if (!name.trim()) {
      setNameError('Имя не может быть пустым');
      return;
    }

    if (name.length < 4) {
      setNameError('Имя должно быть не менее 4 символов');
      return;
    }

    try {
      await dispatch(updateName(name)).unwrap();
      setNameSuccess('Имя успешно обновлено');
      setTimeout(() => setNameSuccess(''), 3000);
    } catch (err: any) {
      setNameError(err.message || 'Ошибка обновления имени');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    dispatch(clearError());

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Все поля обязательны');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Пароль должен быть не менее 6 символов');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Новые пароли не совпадают');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('Новый пароль должен отличаться от текущего');
      return;
    }

    try {
      await dispatch(updatePassword({ currentPassword, newPassword })).unwrap();
      setPasswordSuccess('Пароль успешно обновлен');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err: any) {
      setPasswordError(err.message || 'Ошибка обновления пароля');
    }
  };

  if (!user) {
    return (
      <div className="profile">
        <div className="profile-error">Пользователь не найден</div>
      </div>
    );
  }

  return (
    <div className="profile">
      <Title level={2}>Мой профиль</Title>
      
      <div className="profile-info">
        <div className="profile-info-item">
          <span className="profile-info-label">Имя:</span>
          <span className="profile-info-value">{user.name}</span>
        </div>
        <div className="profile-info-item">
          <span className="profile-info-label">Номер:</span>
          <span className="profile-info-value">{user.number}</span>
        </div>
      </div>

      <div className="profile-sections">
        <div className="profile-section">
          <Title level={3}>Изменить имя</Title>
          <form onSubmit={handleUpdateName} className="profile-form">
            {nameError && <div className="error-message">{nameError}</div>}
            {nameSuccess && <div className="success-message">{nameSuccess}</div>}
            <Field
              label="Новое имя"
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button type="submit" className="profile-button" disabled={isLoading}>
              {isLoading ? 'Сохранение...' : 'Сохранить имя'}
            </Button>
          </form>
        </div>

        <div className="profile-section">
          <Title level={3}>Изменить пароль</Title>
          <form onSubmit={handleUpdatePassword} className="profile-form">
            {passwordError && <div className="error-message">{passwordError}</div>}
            {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}
            <PasswordField
              label="Текущий пароль"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <PasswordField
              label="Новый пароль"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <PasswordField
              label="Подтвердите новый пароль"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button type="submit" className="profile-button" disabled={isLoading}>
              {isLoading ? 'Сохранение...' : 'Сохранить пароль'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};


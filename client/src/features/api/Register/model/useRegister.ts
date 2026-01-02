import { useState } from 'react';
import { useAppDispatch } from '../../../../store/hooks';
import { register } from '../../../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

export const useRegister = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (name: string, number: string, password: string) => {
    try {
      setError(null);
      await dispatch(register({ name, number, password })).unwrap();
      navigate('/');
    } catch (err: unknown) {
      // Redux Toolkit сериализует ошибки, поэтому они теряют прототип Error
      // Проверяем наличие свойства message напрямую
      if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
        setError(err.message);
      } else {
        setError('Ошибка регистрации');
      }
    }
  };

  return {
    handleRegister,
    error,
  };
};


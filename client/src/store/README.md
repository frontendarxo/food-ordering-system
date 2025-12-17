# Redux Toolkit Store

## Установка

```bash
npm install @reduxjs/toolkit
```

## Использование

1. Оберните приложение в Provider:

```tsx
import { Provider } from 'react-redux';
import { store } from './store/redux-toolkit/store';

<Provider store={store}>
  <App />
</Provider>
```

2. Используйте хуки в компонентах:

```tsx
import { useAppDispatch, useAppSelector } from './store/redux-toolkit/hooks';
import { fetchCart } from './store/redux-toolkit/slices/cartSlice';

const Cart = () => {
  const dispatch = useAppDispatch();
  const { items, isLoading } = useAppSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  return <div>...</div>;
};
```

## Структура

- `store.ts` - конфигурация store
- `slices/` - слайсы для каждого домена:
  - `authSlice.ts` - авторизация
  - `cartSlice.ts` - корзина
  - `menuSlice.ts` - меню
  - `orderSlice.ts` - заказы
- `hooks.ts` - типизированные хуки





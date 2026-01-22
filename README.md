# Qatar Food Delivery

Приложение для приема и обработки заказов с разделением по локациям. Клиенты выбирают блюда из меню, оформляют заказ, а работники соответствующей локации видят свои заказы и обрабатывают их.

## Основные возможности

- Просмотр меню с категориями и блюдами
- Добавление товаров в корзину с выбором опций
- Оформление заказа с указанием локации доставки
- Админ-панель для управления меню и просмотра всех заказов
- Рабочая панель для сотрудников с фильтрацией заказов по локации
- Интеграция с WhatsApp для уведомлений
- Кеширование данных через Redis
- Загрузка и оптимизация изображений

## Технологии

### Фронтенд

- **React 19** — интерфейс
- **TypeScript** — типизация
- **Redux Toolkit** — управление состоянием (корзина, меню, заказы)
- **React Router 7** — навигация
- **Vite** — сборка проекта

### Бэкенд

- **Node.js + Express** — API сервер
- **TypeScript** — типизация
- **MongoDB + Mongoose** — база данных
- **Redis** — кеширование меню и категорий
- **JWT** — авторизация (httpOnly cookies)
- **bcryptjs** — хеширование паролей
- **Multer + Sharp** — загрузка и оптимизация изображений

### Инфраструктура

- **Docker Compose** — локальный запуск MongoDB и Redis
- **MongoDB 7.0** — основная БД
- **Redis 7** — кеш

## Структура проекта

```
qatar-project/
├── client/           # фронтенд (React + Vite)
│   ├── src/
│   │   ├── api/                # HTTP клиенты
│   │   ├── app/                # роутинг
│   │   ├── contexts/           # React contexts (auth, location)
│   │   ├── features/           # фичи (cart, menu, order)
│   │   ├── pages/              # страницы
│   │   ├── shared/             # переиспользуемые компоненты
│   │   ├── store/              # Redux store
│   │   ├── types/              # типы
│   │   └── widgets/            # сложные компоненты (layouts, navbar)
│   └── package.json
│
├── server/           # бэкенд (Node.js + Express)
│   ├── src/
│   │   ├── controllers/        # контроллеры
│   │   ├── middlewares/        # middleware (auth, cache, upload)
│   │   ├── modules/            # Mongoose схемы
│   │   ├── routers/            # роуты
│   │   ├── utils/              # утилиты (jwt, redis, image optimizer)
│   │   └── app.ts              # точка входа
│   └── package.json
│
└── docker-compose.yml  # MongoDB + Redis
```

## Установка и запуск

### 1. Клонировать репозиторий

```bash
git clone <repo-url>
cd qatar-project
```

### 2. Поднять базы данных

```bash
docker-compose up -d
```

Это запустит MongoDB на порту 27017 и Redis на 6379.

### 3. Настроить переменные окружения

Скопируй `env.example` и отредактируй значения:

```bash
cp env.example .env
```

Обязательно задай:
- `JWT_SECRET` — секрет для JWT токенов
- `ADMIN_LOGIN`, `ADMIN_PASSWORD` — доступ в админку
- `WORKER_SHATOY_LOGIN`, `WORKER_SHATOY_PASSWORD` — доступ для работника локации Шатой
- `WORKER_GIKALO_LOGIN`, `WORKER_GIKALO_PASSWORD` — доступ для работника локации Гикало

Для фронтенда создай `client/.env`:

```bash
echo "VITE_BASE_URL=http://localhost:3000" > client/.env
```

### 4. Установить зависимости и запустить

**Бэкенд:**

```bash
cd server
npm install
npm run dev
```

Сервер стартует на `http://localhost:3000`

**Фронтенд:**

```bash
cd client
npm install
npm run dev
```

Приложение откроется на `http://localhost:5173`

## API Endpoints

### Публичные

- `GET /api/menu` — получить меню с категориями и блюдами
- `GET /api/categories` — список категорий
- `POST /api/orders` — создать заказ

### Авторизация

- `POST /api/auth/login` — вход (возвращает httpOnly cookie)
- `POST /api/auth/logout` — выход
- `GET /api/auth/me` — получить текущего пользователя

### Защищенные (требуют авторизации)

- `GET /api/orders` — список заказов (фильтруется по роли)
- `PATCH /api/orders/:id` — обновить заказ
- `POST /api/food` — добавить блюдо (admin)
- `PATCH /api/food/:id` — изменить блюдо (admin)
- `DELETE /api/food/:id` — удалить блюдо (admin)
- `POST /api/categories` — добавить категорию (admin)

## Роли пользователей

- **admin** — полный доступ ко всем заказам и управлению меню
- **worker** — видит заказы только своей локации (Шатой или Гикало)

## Кеширование

Запросы к меню и категориям кешируются в Redis на 1 час. Кеш автоматически сбрасывается при изменении данных (добавление/удаление блюд или категорий).

## Деплой

Есть готовые скрипты для деплоя на сервер через SCP:

```bash
# Фронтенд
cd client
npm run deploy

# Бэкенд
cd server
npm run deploy
```

Не забудь настроить продакшен переменные окружения на сервере.

## Особенности реализации

- **httpOnly cookies** — токены хранятся в безопасных cookie, недоступных для JS
- **Feature-Sliced Design** — фронт структурирован по фичам
- **Оптимизация изображений** — загруженные фото автоматически сжимаются через Sharp
- **Миграции** — есть скрипт для добавления полей локации в старые заказы
- **Error boundaries** — обработка ошибок React компонентов
- **Private routes** — защита роутов через HOC

## Что можно улучшить

- Добавить тесты (unit + e2e)
- Настроить CI/CD
- Добавить логирование (Winston/Pino)
- Настроить мониторинг (Prometheus + Grafana)

---

Проект разработан для автоматизации приема заказов в точках общепита.

# Настройка Nginx для проекта Qatar Project

## Проблема: 413 Request Entity Too Large

Если вы получаете ошибку `413 Request Entity Too Large`, это означает, что nginx блокирует запросы с телом больше 1MB (значение по умолчанию).

## Решение

### Вариант 1: Изменение конфигурации nginx (рекомендуется)

1. Найдите файл конфигурации nginx для вашего сайта:
   ```bash
   # Обычно находится в одном из этих мест:
   /etc/nginx/sites-available/your-site
   /etc/nginx/nginx.conf
   /etc/nginx/conf.d/default.conf
   ```

2. Добавьте или измените директиву `client_max_body_size` в блоке `server`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       # Увеличиваем максимальный размер тела запроса до 10MB
       client_max_body_size 10M;
       
       # ... остальная конфигурация ...
   }
   ```

3. Проверьте конфигурацию nginx:
   ```bash
   sudo nginx -t
   ```

4. Перезагрузите nginx:
   ```bash
   sudo systemctl reload nginx
   # или
   sudo service nginx reload
   ```

### Вариант 2: Глобальная настройка в nginx.conf

Если вы хотите установить лимит для всех сайтов:

1. Откройте основной конфигурационный файл:
   ```bash
   sudo nano /etc/nginx/nginx.conf
   ```

2. Добавьте в блок `http`:
   ```nginx
   http {
       # Увеличиваем максимальный размер тела запроса до 10MB
       client_max_body_size 10M;
       
       # ... остальная конфигурация ...
   }
   ```

3. Проверьте и перезагрузите nginx (см. шаги 3-4 выше)

### Пример полной конфигурации

См. файл `nginx.conf.example` в корне проекта для полного примера конфигурации.

## Проверка

После применения изменений попробуйте загрузить файл снова. Ошибка `413 Request Entity Too Large` должна исчезнуть.

## Примечания

- Лимит `10M` (10 мегабайт) установлен для соответствия настройкам Express сервера
- Если вам нужно загружать файлы больше 10MB, увеличьте значение в обоих местах:
  - В nginx: `client_max_body_size 20M;` (или другое значение)
  - В Express: `express.json({ limit: '20mb' })` в `server/src/app.ts`
  - В Multer: `limits: { fileSize: 20 * 1024 * 1024 }` в `server/src/middlewares/upload.ts`

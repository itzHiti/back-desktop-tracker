# Desktop Tracker Backend

Backend-сервис на NestJS для сбора и хранения чанков активности пользователя.

## 1. Стек

- NestJS 11
- TypeScript
- PostgreSQL
- TypeORM
- Docker / Docker Compose
- Swagger (OpenAPI)

## 2. Что реализовано

- Прием чанка активности: `POST /api/activity`
- Получение списка чанков: `GET /api/activity`
- Валидация входящих данных через `class-validator`
- Проверка `duration` на расхождение с `(endedAt - startedAt)` более чем 5 секунд
- Уникальное ограничение по комбинации `(startedAt, appName, appUrl)`
- Глобальный `ExceptionFilter`
- Swagger UI и OpenAPI JSON
- Запуск в Docker Compose (`app + postgres`)

## 3. Быстрый старт

### 3.1 Локально (без Docker)

1. Установить зависимости:

```bash
pnpm install
```

2. Создать `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

3. Заполнить переменные окружения:

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_NAME`

4. Запустить приложение:

```bash
pnpm run start:dev
```

Приложение будет доступно на `http://localhost:3000`.

### 3.2 Через Docker Compose

```bash
docker compose up --build
```

Сервисы:

- `app` на порту `3000`
- `postgres` на порту `5432`

## 4. Конфигурация

Используются следующие переменные окружения:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=desk_tracker
```

## 5. API

Базовый префикс API: `/api`

### 5.1 POST /api/activity

Создает чанк активности.

Пример тела запроса:

```json
{
	"startedAt": "2025-03-20T14:30:00.000Z",
	"endedAt": "2025-03-20T14:40:00.000Z",
	"duration": 600,
	"appName": "Visual Studio Code",
	"appUrl": null
}
```

![img.png](readme-assets/img.png)

Успешный ответ (201):

```json
{
	"id": "550e8400-e29b-41d4-a716-446655440000",
	"message": "Chunk saved successfully"
}
```

![img_1.png](readme-assets/img_1.png)

А также новая строка в базе данных:

![img_2.png](readme-assets/img_2.png)

### 5.2 GET /api/activity

Возвращает все сохраненные чанки.

Пример ответа (200):

```json
{
	"data": [
		{
			"id": "550e8400-e29b-41d4-a716-446655440000",
			"startedAt": "2025-03-20T14:30:00.000Z",
			"endedAt": "2025-03-20T14:40:00.000Z",
			"duration": 600,
			"appName": "Visual Studio Code",
			"appUrl": null,
			"createdAt": "2025-03-20T14:41:00.000Z"
		}
	],
	"total": 1
}
```

![img_3.png](readme-assets/img_3.png)

## 6. Swagger

- Swagger UI: `http://localhost:3000/api/docs`
- OpenAPI JSON: `http://localhost:3000/api/docs-json`

## 7. Полезные команды

```bash
pnpm run build
pnpm run start:dev
pnpm run lint
pnpm run test
pnpm run test:e2e
pnpm run migration:run
pnpm run migration:revert
pnpm run migration:show
```

## 8. Проверка соответствия ТЗ

### 8.1 Обязательные требования

1. NestJS (контроллеры, сервисы, DTO, валидация) - выполнено
2. PostgreSQL - выполнено
3. Валидация входных данных - выполнено
4. Глобальный ExceptionFilter - выполнено
5. Логирование запросов INFO/ERROR - частично (есть только `console.log` при старте и `console.error` при падении bootstrap)
6. Запуск через `docker compose up` (`app + postgres`) - выполнено

### 8.2 Желательные требования

1. Swagger / OpenAPI - выполнено
2. Unit-тесты (Jest) - не выполнено (тестовые файлы отсутствуют)
3. Уникальный индекс + обработка ошибки - выполнено
4. Конфигурация через `.env` - выполнено

### 8.3 Соответствие бизнес-правилам

1. Прием чанка и сохранение в БД - выполнено
2. Выдача всех чанков по REST - выполнено
3. Проверка `duration` на допустимое расхождение - выполнено
4. Обработка дубликатов как `409` - частично
5. Возврат `422` для пустого/отсутствующего `appName` - частично (сейчас валидация отдает стандартную ошибку `400`)
6. Фильтрация `GET /api/activity?from=...&to=...` (бонус) - не выполнено

### 8.4 Технический долг и рекомендации

1. Миграции TypeORM добавлены; использовать только `migration:run` для изменения схемы БД.
2. Доработать `ExceptionFilter` для корректной обработки `QueryFailedError`:
	 - `23505` -> `409 Conflict`.
3. Добавить middleware/interceptor для request-логов на каждый запрос:
	 - INFO: метод, путь, статус, время.
	 - ERROR: исключения и stack trace (без чувствительных данных).
4. Добавить unit/e2e тесты для базовых сценариев из ТЗ.
5. Добавить фильтрацию по диапазону дат в `GET /api/activity`.

## 9. Примеры curl

Создать чанк:

```bash
curl -X POST http://localhost:3000/api/activity \
	-H "Content-Type: application/json" \
	-d '{
		"startedAt":"2025-03-20T14:30:00.000Z",
		"endedAt":"2025-03-20T14:40:00.000Z",
		"duration":600,
		"appName":"Visual Studio Code",
		"appUrl":null
	}'
```

Получить чанки:

```bash
curl http://localhost:3000/api/activity
```
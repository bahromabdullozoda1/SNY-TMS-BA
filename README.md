# SNY TMS (Transportation Management System)

MVP-платформа для логистики в стиле Dispatch Board:
- JWT аутентификация и роли (Admin, Manager, Driver, Accountant)
- Управление грузами и водителями (CRUD)
- Диспетчерская доска (MON-SUN) с drag-and-drop назначением грузов
- История изменений груза, заметки, базовые отчеты
- Реальные обновления через WebSocket

## Стек
- **Backend:** Node.js + Express
- **Frontend:** React + Tailwind CSS (Vite)
- **Database:** PostgreSQL (schema migration included) + in-memory seed for local MVP
- **Auth:** JWT

## Структура
```
backend/
  src/{routes,controllers,models,middleware,utils,config}
  db/migrations
  server.js
frontend/
  src/{components,pages,services,utils,styles}
docs/
```

## Запуск
### 1) Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

> Тестовый пользователь: `admin@tms.local` / `Admin123!`

### 2) Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:3000

## Базовые API
См. `docs/API.md`.

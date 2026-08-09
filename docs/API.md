# API (MVP)

## Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

## Drivers
- `GET /api/drivers`
- `POST /api/drivers`
- `PUT /api/drivers/:id`
- `DELETE /api/drivers/:id`

## Loads
- `GET /api/loads`
- `POST /api/loads`
- `PUT /api/loads/:id`
- `DELETE /api/loads/:id`

## Dispatch
- `GET /api/dispatch/board`

## Reports
- `GET /api/reports/summary`

## Auth Header
Use an authorization header containing a valid JWT token.

# Finanças

Plataforma educativa de finanças pessoais. A aplicação registra valores informados pela pessoa e acompanha investimentos feitos fora da plataforma; não movimenta dinheiro nem acessa bancos ou corretoras.

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

Vite serves the app at `http://localhost:5173` and proxies `/api` to `http://localhost:3000` during development. `frontend/.env.example` documents the optional production API URL.

## API local

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Fill `DATABASE_URL` with the pooled Neon connection string, `DIRECT_URL` with its direct connection string, and replace `JWT_ACCESS_SECRET` with a random value of at least 32 characters. Then run:

```powershell
npm run db:generate
npm run db:migrate -- --name init
npm run dev
```

The API listens on port `3000`; `GET /health` is the health check. Do not put real secrets in `.env.example` or commit `.env`.

The dashboard and catalog currently contain clearly marked sample data. Account registration, login, refresh-token rotation, logout, and `/users/me` are the first API-backed flows. The remaining financial data endpoints are planned for later phases.

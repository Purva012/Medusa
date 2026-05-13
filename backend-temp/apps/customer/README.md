# Customer App

Customer-facing storefront for the Medusa backend.

## Development

Start the backend:

```powershell
pnpm.cmd backend:dev
```

Start the customer app:

```powershell
pnpm.cmd customer:dev
```

The customer app runs on `http://localhost:8000` and calls the backend at `http://localhost:9000`.

If your Store API requires a publishable API key, create `apps/customer/.env` from `.env.example` and set `VITE_MEDUSA_PUBLISHABLE_KEY`.

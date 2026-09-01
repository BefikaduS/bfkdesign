# Bfkdesign

A secure static portfolio and contact site with a basic production-ready backend API.

## Local development

```bash
npm install
npm run dev
```

Open: http://localhost:3000

## Production build

```bash
docker build -t bfkdesign .
docker run -p 3000:3000 --env-file .env bfkdesign
```

## Endpoints

- GET /health
- POST /api/contact

## Environment variables

- PORT (default: 3000)
- CONTACT_LIMIT_PER_HOUR (default: 10)

## Notes

This site currently includes secure local contact handling and a basic health endpoint. Additional production hardening such as database-backed workflows, Sentry, and user auth should be added before serving paying customers.

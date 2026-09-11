# fiteasy.ro

Aplicație separată de bookeasy, pentru instructori de fitness: antrenamente, nutriție și mesaje (cu apel video Jitsi) cu clienții lor.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Prisma · PostgreSQL (Neon) · Cloudflare Workers (OpenNext) · NextAuth

## Setup local

```
npm install
cp .env.example .env
# completează .env cu DATABASE_URL (Neon) și AUTH_SECRET

npx prisma migrate deploy
npm run dev
```

## Primul cont de instructor

Nu există înregistrare publică — se creează o singură dată, prin `/api/setup`:

```
curl -X POST https://fiteasy.ro/api/setup \
  -H "Content-Type: application/json" \
  -d '{"secret":"SETUP_SECRET-ul tău","email":"tu@exemplu.ro","password":"parola-ta","name":"Numele tău"}'
```

Endpoint-ul refuză să mai creeze un al doilea cont odată ce există unul.

## Deploy pe Cloudflare Workers

```
npm run build:cloudflare
npm run deploy:cloudflare
```

Sau conectează repo-ul în dashboard-ul Cloudflare (Workers & Pages → Create → Workers Builds) pentru deploy automat la fiecare push.

## Structură

```
app/
  login/          → autentificare instructor
  dashboard/       → lista de clienți + planuri antrenamente/nutriție/mesaje (instructor)
  portal/          → portalul clientului (același workspace, fără drepturi de editare)
  api/
    entries/       → CRUD planuri antrenament/nutriție
    messages/       → chat instructor-client + invitații apel video (Jitsi)
    clients/        → listă clienți, creare, link de acces, revocare
    session/        → activare portal client din link de invitație
lib/
  auth.ts            → NextAuth (Credentials, JWT) pentru instructor
  client-auth.ts      → autorizare request-uri (instructor vs. client din portal)
  prisma.ts            → client Prisma per-request (Cloudflare Workers safe)
  validation.ts         → scheme zod
```

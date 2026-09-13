# fiteasy.ro

Aplicație separată de bookeasy, pentru instructori de fitness: antrenamente, nutriție și mesaje (cu apel video Jitsi) cu clienții lor.

## Roluri și funcționalități

- **Superadmin** — creează și editează administratori, activează/dezactivează accesul și vede numărul de clienți gestionați.
- **Administrator / instructor** — gestionează clienți, programe structurate pe săptămâni și zile, obiective nutriționale, reminders, note, recorduri de progres și mesaje.
- **Client** — vede programul atribuit, calendarul, nutriția, reminders, progresul, notele și conversația cu instructorul.

FitEasy nu include plăți sau recenzii.

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

După actualizarea aplicației, rulează întotdeauna `npx prisma migrate deploy` înainte de pornirea noii versiuni; funcțiile de programe, reminders, note și recorduri folosesc tabelele din migrarea `20260913090000_coach_management`.

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

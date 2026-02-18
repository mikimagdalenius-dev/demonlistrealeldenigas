# Private DemonList

Minimal private DemonList app for a small group of friends.

## Stack
- Next.js (App Router, TypeScript)
- PostgreSQL
- Prisma ORM
- TailwindCSS

## Pages
1. `/` Demonlist (ranked demons)
2. `/submit` Submit Demon form
3. `/players` Player stats (completed demons + points)

## Data model
- `Demon`: ranked levels with proof + difficulty
- `Player`: players
- `Completion`: join table between player and demon
- `Submission`: records submitted demon payloads

## Local run
1. Copy envs:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```
4. Push schema:
   ```bash
   npm run prisma:push
   ```
5. Optional seed:
   ```bash
   npm run prisma:seed
   ```
6. Start app:
   ```bash
   npm run dev
   ```

## Docker
```bash
docker compose up --build
```

The app will run on `http://localhost:3000` and PostgreSQL on `localhost:5432`.

# Demonlist

Demonlist privada estilo Pointercrate / Geometry Dash. Next.js 15 + Prisma + PostgreSQL.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- TailwindCSS
- Prisma ORM
- PostgreSQL (Neon en producción)
- Vercel para deploy

## Páginas

- `/` — lista de demons ordenada por posición
- `/demon/[id]` — detalle de un demon
- `/players` — ranking de jugadores por puntos
- `/submit` — formulario público (demon / completion / progress)
- `/admin` — panel admin (acceso por URL directa, no en navbar)

## Modelos

- `Demon` — `position` única, `name`, `videoUrl`, `publisherName`
- `Player` — `name` único
- `Completion` — relación player↔demon con vídeo, da puntos
- `Progress` — porcentaje 1-100 (se borra al completar)
- `Submission` — log append-only de envíos públicos
- `PositionHistory` — auditoría de cambios de posición

## Variables de entorno

Copiar `.env.example` a `.env.local` y rellenar:

- `DATABASE_URL` — string de Postgres (Neon en prod)
- `ADMIN_PASSWORD` — contraseña del panel `/admin`
- `ADMIN_SECRET` — valor de la cookie de sesión admin (cualquier string aleatorio largo)

## Arrancar en local

```bash
npm install
npm run prisma:generate
npm run prisma:push     # sincroniza el schema con la DB
npm run prisma:seed     # opcional, datos de ejemplo
npm run dev
```

App en `http://localhost:3000`.

## Comandos

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción (incluye `prisma generate`)
- `npm run prisma:push` — sync de schema sin migración (útil en dev)
- `npm run prisma:migrate` — `prisma migrate deploy` (prod)
- `npm run prisma:seed` — seed de datos
- `npm run lint` — lint

## Puntos

Curva exponencial en `lib/points.ts`: posición #1 da 500 puntos, #75 da 10. Top más alto = más puntos.

## Auth admin

No usa NextAuth. Cookie httpOnly de 8h con valor `ADMIN_SECRET`. Cada server action privada empieza por `if (!(await isAdminAuthed())) return;`. Lógica en `lib/admin-auth.ts`.

## Convenciones a tener en cuenta

- **Reordenar demons sin violar `position @unique`**: el patrón en `app/admin/actions.ts` mueve primero a una posición temporal grande (`total + 999`), luego desplaza vecinos con `updateMany { increment/decrement: 1 }`, y finalmente asigna la posición definitiva. Respetar este patrón si añades mutaciones nuevas.
- **Validación manual** dentro de cada server action — sin Zod. Helpers en los propios `actions.ts`: `toPositiveInt`, `toPercentInt`, `normalizeUrl`, `MAX_NAME_LEN=100`, `MAX_URL_LEN=500`.
- **Mutaciones multi-tabla** dentro de `prisma.$transaction`. El historial de posiciones va a `PositionHistory`.
- **Submissions = audit log.** El modelo `Submission` se escribe en `submitDemon` pero la UI pública nunca lo lee.
- **Progress vs Completion**: tablas separadas con `@@unique([playerId, demonId])`. Al registrar una completion se borra el progress previo del par.
- **Revalidación manual**: cada server action llama a `revalidatePath("/")`, `"/admin"`, `"/players"` según toque.
- **`dynamic = "force-dynamic"`** en `app/page.tsx` y `app/admin/page.tsx` — sin caché SSR.

## Deploy

Vercel + Neon. Variables de entorno en el dashboard de Vercel: `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_SECRET`.

```bash
vercel --prod
```

## Estructura

```
app/
  page.tsx + demon-list.tsx     home
  demon/[id]/                   detalle público
  players/                      ranking
  submit/                       formulario público
  admin/                        panel admin (login + CRUD)
components/                     navbar, theme-toggle
lib/
  admin-auth.ts                 cookie de sesión admin
  points.ts                     curva exponencial
  prisma.ts                     singleton PrismaClient
  url.ts                        safeHref() — bloquea javascript: URLs
  youtube.ts                    extracción de ID y thumbnails
  rate-limit.ts                 rate limiting básico
prisma/
  schema.prisma                 modelos
  seed.ts                       datos de ejemplo
```

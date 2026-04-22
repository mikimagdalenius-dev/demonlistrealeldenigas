# Demonlist Eldenigas

Demonlist privada estilo Pointercrate / Geometry Dash en Next.js 15 (App Router, React 19) + Prisma/PostgreSQL (Neon). Deploy manual a Vercel (proyecto `demonlist-eldenigas`). UI inspirada en Pointercrate (clases `pc-*` en `app/globals.css`).

## Rutas y archivos clave

- `app/page.tsx` — home: lista de demons ordenada por `position` con completions embebidas.
- `app/demon-list.tsx` — client component que renderiza la lista principal.
- `app/demon/[id]/page.tsx` — detalle público de un demon.
- `app/players/page.tsx` — ranking de jugadores por puntos (ver `lib/points.ts`).
- `app/submit/page.tsx` + `submit-form.tsx` — formulario público: submit demon / completion / progress.
- `app/submit/actions.ts` — server actions `submitDemon`, `submitCompletion`, `submitProgress` (no-auth).
- `app/admin/page.tsx` — panel admin (gated por cookie); login si no autenticado.
- `app/admin/login-form.tsx` — formulario password.
- `app/admin/actions.ts` — login/logout + CRUD de demons / completions / progress. Todas las mutaciones chequean `isAdminAuthed()`.
- `app/admin/demon-drag-list.tsx` — drag-and-drop (`@dnd-kit`) que llama a `reorderDemonsAction`.
- `app/admin/demon/[id]/edit-form.tsx` + `page.tsx` — edición individual de demon.
- `components/navbar.tsx`, `components/theme-toggle.tsx` — chrome global.
- `lib/admin-auth.ts` — cookie `admin_token` (httpOnly, 8h) con valor `ADMIN_SECRET`.
- `lib/prisma.ts` — singleton PrismaClient.
- `lib/points.ts` — curva exponencial (k=6): pos #1=500 pts, #75=10 pts.
- `lib/youtube.ts` — extrae ID YT, genera thumbnail/embed.
- `lib/url.ts` — `safeHref()` bloquea `javascript:` URLs en hrefs cliente.
- `prisma/schema.prisma`, `prisma/seed.ts`.

## Variables de entorno (.env.local)

- `DATABASE_URL` — Postgres (Neon en prod, Docker local según `docker-compose.yml`).
- `ADMIN_PASSWORD` — password del panel (literal `"Flow"` en prod).
- `ADMIN_SECRET` — valor de la cookie admin; cámbialo y expira todas las sesiones.

## Comandos

- `npm run dev` — Next dev server.
- `npm run build` — `prisma generate && next build` (build fallará sin schema generado).
- `npm run prisma:migrate` — `prisma migrate deploy` (prod).
- `npm run prisma:push` — sync schema sin migración (dev rápido).
- `npm run prisma:seed` — `tsx prisma/seed.ts`.
- `npm run lint` — next lint. No hay script `typecheck` separado; usa `tsc --noEmit` si lo necesitas.
- **Deploy: manual a Vercel** (`vercel --prod` desde `.vercel/` ya linkeado). No hay auto-deploy por git.

## Convenciones y gotchas

- **Auth admin es cookie-only, sin NextAuth**: `checkAdminPassword` compara plano contra `ADMIN_PASSWORD`; éxito setea cookie `admin_token=ADMIN_SECRET` (8h). Toda server action privada empieza con `if (!(await isAdminAuthed())) return;`.
- **Validación: sin Zod.** Se hace manual dentro de cada server action (`toPositiveInt`, `toPercentInt`, `normalizeUrl`, `MAX_NAME_LEN=100`, `MAX_URL_LEN=500`). `normalizeUrl` antepone `https://` si falta protocolo y rechaza no-http(s).
- **Reordenar demons sin violar `@unique` en `position`**: el patrón en `actions.ts` es mover primero a posición temporal grande (`total + 999` / `total + 1000 + i`), luego desplazar vecinos con `updateMany { increment/decrement: 1 }`, luego asignar final. Respeta este patrón en cualquier mutación nueva.
- **Todo dentro de `prisma.$transaction`** para mutaciones que tocan varias tablas; historial de posiciones va a `PositionHistory`.
- **Submissions = auditoría.** El modelo `Submission` se crea en `submitDemon` solo como log; la UI pública no lo lee. `submitDemon` crea directamente `Demon` + upsert `Player` + `Completion` (el publisher cuenta como completer).
- **Progress vs Completion**: son tablas separadas con `@@unique([playerId, demonId])`. Al registrar una completion para un par (player, demon), se borra el progress previo con `deleteMany`.
- **Revalidación manual**: cada server action llama `revalidatePath("/")`, `"/admin"`, `"/players"` según toque. Añádelo al crear nuevas.
- **`dynamic = "force-dynamic"`** en `app/page.tsx` y `app/admin/page.tsx` — no cachear SSR.
- **Sin tests** y sin pipeline CI. Verifica manualmente tras cambios en reordering.

## Modelos Prisma

- `Demon` — `position @unique`, `name`, `videoUrl`, `thumbnailVideoUrl?`, `publisherName`. Raíz de todo.
- `Player` — `name @unique`. Se upserta por nombre (sin auth de usuarios).
- `Completion` — (player, demon) `@@unique`, `videoUrl`. Da puntos vía `pointsFromDemon(position)`.
- `Progress` — (player, demon) `@@unique`, `percentage` 1-100. Se borra al completar.
- `Submission` — log append-only de envíos públicos (no se muestra en UI).
- `PositionHistory` — snapshots de cambios de posición; log de auditoría.

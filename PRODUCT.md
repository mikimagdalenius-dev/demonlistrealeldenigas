# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Un grupo privado de amigos que juega a Geometry Dash (Miki, Isma, Luksan, Robert, Adri, Meri y los que se añadan). La consultan sobre todo desde el PC, a menudo mientras juegan, para ver la lista, quién ha pasado qué y cómo va el ranking.

## Product Purpose
Demonlist privada del grupo "Eldenigas": ranking propio de los demons que han superado entre ellos, ordenados por dificultad, con puntos por posición y ranking de jugadores. Éxito = que el grupo la mire, se pique y envíe sus completions y progresos.

## Positioning
No es Pointercrate: es la lista de un grupo concreto, con sus propios niveles, sus vídeos y su orden decidido por ellos.

## Operating Context
- `/` lista de demons por posición (miniatura de YouTube, nombre, publisher, puntos, vídeos de prueba), con buscador y contador de demons/players/completions.
- `/demon/[id]` detalle: vídeo embebido, completions, records (%), historial de posiciones.
- `/players` ranking por puntos, top 5 hardest, progresos.
- `/submit` formulario público: nuevo demon, completion o % de progreso.
- `/admin` panel privado por URL directa (login, reordenar por drag, editar, borrar).

## Capabilities and Constraints
- Next.js 15 App Router + React 19 + Tailwind 3 + Prisma/Postgres (Neon), deploy en Vercel.
- Puntos: curva exponencial en `lib/points.ts` (#1 = 500, #75 = 10).
- Las miniaturas salen de YouTube; no hay más imágenes propias.
- La UI mezcla inglés (etiquetas) y español (mensajes); no se ha decidido unificar.

## Brand Commitments
- Nombre: "Demonlist Eldenigas". Firma "by @miki.ls".

## Evidence on Hand
- Datos reales en la base de datos de producción (demons, jugadores, vídeos). No inventar jugadores ni récords fuera de datos de ejemplo marcados como tal.

## Product Principles
- La lista es lo primero: posición, nombre y vídeo se leen de un vistazo.
- Picar al grupo: puntos y ranking visibles.
- Enviar tiene que ser rápido y sin fricción.

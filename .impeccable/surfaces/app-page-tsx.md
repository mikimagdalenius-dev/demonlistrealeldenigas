---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: ["app/players/page.tsx","app/submit/page.tsx","app/demon/[id]/page.tsx","app/admin/page.tsx"]
---

Scope: whole public app (`/`, `/demon/[id]`, `/players`, `/submit`) plus `/admin` restyled in the same system. Mode: Operate.
Audience/job: a private group of GD friends checks the list and ranking on PC while playing, and submits completions/progress.
Constraints: keep every page, function and copy; Next 15 + Tailwind 3; thumbnails come from YouTube.

## Direction contract

THESIS: The demonlist as a record label's catalogue: every demon is a catalogue number, and the position number is the headline. It refuses the category default of pale cards with blue buttons (the Pointercrate clone).

OWN-WORLD: Matte black ground (#0a0a0a), bone-white hairline ink, 1px white rules and square-cornered boxes with no radius and no shadows. A five-block industrial colour code (grey/blue/yellow/red/white) is the mark. Red is reserved for active/selected, yellow for progress %, and blue for video links. The type is Archivo: expanded light numerals for positions and wide tracked caps for labels.

STORY: The visitor sees the order at a glance (#01 is the biggest numeral) and knows who has beaten what. They open proofs or the detail, and submit their own run.

FIRST VIEWPORT: A sticky top bar with the wordmark plus colour strip on the left and boxed nav segments on the right (active = white fill with a red edge block). Below it, a stats line in tracked caps and a hairline search. Then #01 is a featured catalogue entry: huge expanded numeral, name in wide caps, publisher, points readout, proofs button, with a large thumbnail on the right. Rows #02+ follow as hairline boxes: numeral, thumbnail, name, publisher, readout, points.

FORM: catalog-sleeve challenger (brand-identity-canon-saville-catalog-sleeve), chosen by the user over the assigned grounded direction. seed:be04f4b37a740d76

SIGNATURE: "decoding". At rest the thumbnails are monochrome and dim. The hovered or focused entry decodes to full colour, its numeral turns red and its 10-cell points readout lights up. Motion: a 400ms ease-out filter/colour transition only; nothing animates under reduced motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

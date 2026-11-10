---
name: Demonlist Eldenigas
description: A private Geometry Dash demonlist styled as a record label's catalogue on matte black.
colors:
  ground: "#0a0a0a"
  panel: "#101010"
  raise: "#171717"
  ink: "#ecebe6"
  ink-2: "#bdbcb6"
  ink-3: "#8d8c88"
  rule: "rgba(236, 235, 230, 0.2)"
  rule-strong: "rgba(236, 235, 230, 0.42)"
  signal-red: "#e0352b"
  link-blue: "#5b8cff"
  progress-yellow: "#e8b923"
  code-grey: "#7a7a7a"
  success-green: "#4fbf6a"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(72px, 9vw, 128px)"
    fontWeight: 200
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontVariation: "'wdth' 125"
    fontFeature: "'tnum'"
  headline:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "44px"
    fontWeight: 200
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 125"
    fontFeature: "'tnum'"
  title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.06em"
    fontVariation: "'wdth' 112"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    letterSpacing: "0.22em"
    fontVariation: "'wdth' 125"
rounded:
  none: "0px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "16px"
  lg: "24px"
  xl: "28px"
  2xl: "32px"
components:
  button-primary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "11px 36px 11px 18px"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "11px 18px"
  button-danger:
    backgroundColor: "transparent"
    textColor: "{colors.signal-red}"
    rounded: "{rounded.none}"
    padding: "11px 18px"
  button-danger-hover:
    backgroundColor: "{colors.signal-red}"
    textColor: "#ffffff"
  nav-tab:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    padding: "10px 22px"
  nav-tab-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    padding: "10px 34px 10px 22px"
  catalog-entry:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "16px 20px 16px 16px"
  input-field:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "11px 14px"
  form-panel:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.none}"
    padding: "28px"
---

# Design System: Demonlist Eldenigas

## Overview

**Creative North Star: "The Catalogue Sleeve"**

The list is a record label's back catalogue printed on matte black. Every demon is a catalogue number, and the position numeral is the headline: an expanded, ultra-light Archivo figure that reads before anything else on the row. Everything around it is hairline: bone-white 1px rules, square boxes, no radius, no shadow. The surface feels printed and filed, not app-like.

Density is moderate and list-first. Rows are full-width hairline boxes stacked 12px apart; the #01 entry gets a featured sleeve with a 128px numeral and a large thumbnail. Labels speak in wide tracked caps, the "engraved" voice of the catalogue; body text stays plain sentence-case Archivo at 15px.

Colour is a code, not a decoration. A five-block industrial strip (grey, blue, yellow, red, white) under the wordmark is the mark, and each of those colours has one job across the whole app. The signature move is **decoding**: thumbnails sit in slightly muted colour at rest, and the hovered or focused entry resolves to full, saturated colour with a white border while its numeral turns red and its ten-cell points readout (white at rest) lights red. The #01 entry keeps its numeral red at all times and carries the five-block code strip.

**Key Characteristics:**
- Matte black ground, bone-white ink, 1px hairline rules, zero radius, zero shadow.
- Archivo variable with the width axis: expanded light numerals, wide tracked caps labels.
- Position numeral is always the largest thing on an entry.
- One job per colour: red = active/selected, yellow = progress %, blue = links/video, green = success only.
- Decoding on hover/focus-within: greyscale to colour, ink numeral to red, 400ms ease-out.

## Colors

A near-monochrome black-and-bone palette with four signal colours rationed by role.

### Primary
- **Signal Red** (signal-red): The active/selected signal. The 10px edge block on the active nav tab and active submit tab; the 14px edge block on the primary button on hover, focus, press and pending; the decoded numeral and lit readout cells; the focus outline; the text caret; text selection; the selected thumbnail picker border; invalid input border.

### Secondary
- **Progress Yellow** (progress-yellow): Only progress percentages (records, progress tables).
- **Link Blue** (link-blue): Links and video destinations (inline anchors, proof links).

### Tertiary
- **Success Green** (success-green): Only the success toast text and border.
- **Code Grey** (code-grey): Only the first block of the five-block colour code.

### Neutral
- **Matte Ground** (ground): Page, sticky top bar, inputs, dropdown lists.
- **Panel Black** (panel): Catalogue entries, cards, forms, detail head.
- **Raised Black** (raise): Hover fill for tabs and table rows, thumbnail placeholder, skeleton blocks.
- **Bone Ink** (ink): Primary text, numerals, button outlines, active tab fill.
- **Ink 2** (ink-2): Labels, meta lines, secondary buttons, inactive tabs.
- **Ink 3** (ink-3): Placeholders, footer, unlit-but-earned readout cells, drag handles.
- **Hairline** (rule): Default 1px box and divider rule.
- **Strong Hairline** (rule-strong): Tab group borders, input borders, featured and hovered entry borders, table header rule.

### Named Rules
**The One Job Rule.** Each signal colour has exactly one role. Red never marks progress, yellow never marks a link, blue never marks state. A new surface picks a role, not a colour.

**The Red Is State Rule.** Red appears only in response to active, selected, focused or decoding state, plus destructive admin actions. Nothing is red at rest except the active tab's edge block and the colour-code mark.

## Typography

**Display Font:** Archivo (variable, `wdth` axis loaded via next/font; fallback system-ui, sans-serif)
**Body Font:** Archivo
**Label Font:** Archivo at 125% width

**Character:** One family stretched across its width axis does all the work: expanded hairline numerals for catalogue numbers, widened tracked caps for engraved labels, plain normal-width text for reading.

### Hierarchy
- **Display** (200, clamp(72px, 9vw, 128px), 1, 125% width, tabular): The #01 featured numeral and the demon detail numeral.
- **Headline** (200, 44px, 1, 125% width, tabular): Row numerals #02 onward; stays 44px on mobile.
- **Title** (500, 20px, 1.2, 112% width, 0.06em, uppercase): Demon and player names; clamp(22px, 2.2vw, 30px) on featured/detail; 16px with 0.04em under 900px.
- **Points** (300, 22px, 125% width, tabular): Points figure beside the readout, with a 10px tracked "PTS" suffix.
- **Body** (400, 15px, 1.5): Sentence-case text; meta lines drop to 13px in ink-2 with names at 500 in ink.
- **Label** (500, 11px, 0.22em, 125% width, uppercase): Nav, buttons, stats bar, section heads, form labels, table headers (10px), footer.

### Named Rules
**The Numeral Leads Rule.** On any entry the position numeral is the largest, lightest type present. Nothing competes with it, including the name.

**The Width Carries Voice Rule.** Hierarchy comes from width and tracking, not weight. Caps are always expanded (125%) and tracked (0.16em to 0.28em); body text is never widened.

## Layout

A single centred column, max 1220px, with 24px side gutters (16px under 560px) and 32px top / 72px bottom page padding. The sticky top bar holds the wordmark and colour code on the left and a boxed segmented nav on the right, wrapping when needed.

Catalogue rows are a four-column grid: 112px numeral, 176px thumbnail, flexible body, auto side (points, readout, proofs), with 24px gaps and 12px between rows. The #01 featured entry splits into two columns (1fr / 1.15fr) with 28px padding and 32px gap; the demon detail head mirrors it (1fr / 1.2fr). Player rows reorder to numeral, body, side, then a 176px hardest-demon thumbnail.

Under 900px, rows collapse to numeral plus name on the first line, the thumbnail full-width below, and the side block as a wrapping row; featured, detail and two-column sections go single-column. Under 560px nav tabs stretch to equal widths and forms pad 18px.

Spacing rhythm clusters at 6, 10, 16, 24, 28 and 32px; section heads sit on a hairline with 10px below and 14px after.

## Elevation & Depth

Flat. There are no shadows anywhere. Depth is conveyed by three near-black tones (ground, panel, raise) and by hairline weight: a box gains emphasis by moving from the 16% rule to the 42% rule, never by lifting.

### Named Rules
**The Hairline Not Shadow Rule.** Emphasis is a stronger 1px rule or a step from ground to panel to raise. No box-shadow, no blur, no glow.

## Shapes

Every box is square-cornered (0px radius), inputs included. Borders are always 1px solid. The recurring silhouette is the edge block: a solid red bar flush to the right edge of an active tab (10px) or primary button (14px). The only non-rectangular marks are the CSS chevrons on the select and the top-5 disclosure, drawn from 1px strokes.

## Components

### Buttons
Outlined, engraved, inverted on hover.
- **Shape:** Square (0px), 1px ink outline, label type, 11px 18px padding.
- **Primary:** Transparent with ink outline and text, extra 36px right padding reserving a 14px red edge block that is hidden at rest.
- **Hover / Focus:** Fill inverts to ink with ground text (200ms). On the primary, the red edge block appears on hover, focus-visible, active and disabled-while-pending.
- **Secondary:** Strong-hairline outline, ink-2 text, no edge block.
- **Small:** 7px 12px padding, 10px label.
- **Danger (admin):** Red outline and text; fills red with white text on hover.
- **Disabled:** 45% opacity, no fill change.

### Catalogue Entry (signature)
- **Container:** Panel fill, 1px hairline, square; border steps to strong hairline on hover/focus-within (400ms ease-out).
- **Contents:** Headline numeral, 16:9 thumbnail with 1px hairline, title-caps name, 13px meta, points figure, ten-cell readout, proofs control.
- **Readout:** Ten 9px squares, 3px apart; unearned cells #2a2a2a, earned cells ink-3, earned cells turn red on decode.
- **Decoding:** Thumbnail filter `saturate(0.85) brightness(0.86)` at rest (`none` on touch devices), `saturate(1.15) brightness(1.04)` on hover/focus-within; numeral ink to red. 400ms `cubic-bezier(0.16, 1, 0.3, 1)`; nothing transitions under reduced motion.
- **Featured (#01):** Strong hairline, 28px padding, display numeral, larger thumbnail on the right.

### Inputs / Fields
- **Search:** Borderless except a strong-hairline bottom rule, transparent, 16px text, red caret; bottom rule turns ink on focus.
- **Form fields and select:** Ground fill, 1px strong hairline, square, 11px 14px padding, red caret; border turns ink on focus; invalid border red. Select uses a drawn 1px chevron.
- **Labels:** Label type in ink-2, 8px above the field.

### Navigation
- **Top bar:** Sticky, ground fill, hairline bottom rule.
- **Tabs:** A boxed segmented group with strong-hairline outline and dividers; inactive ink-2, hover raises to `raise` with ink text; active inverts to ink fill with ground text and a 10px red edge block on the right. The submit-type tabs use the same pattern.
- **Mark:** Wordmark in 13px, 0.28em tracked expanded caps above the five-block colour code (18x8px blocks, 4px gap).

### Tables and Lists
- Header in 10px label type over a strong hairline; rows on 1px hairlines; row hover fills `raise`. Progress cells in yellow tabular figures.

### Toasts
- Inline outlined box, 13px text. Success: green text and border. Error: light red text on a red border.

## Do's and Don'ts

### Do:
- **Do** make the position numeral the largest, lightest type on every entry (200 weight, 125% width).
- **Do** keep thumbnails slightly muted at rest and push them to full colour with a red numeral and lit readout on hover and focus-within.
- **Do** mark active and selected state with a solid red edge block flush to the right edge (10px tabs, 14px primary button).
- **Do** give emphasis with the 42% hairline or a ground-to-panel-to-raise tone step.
- **Do** set every label, button and header in expanded tracked caps (125% width, 0.16em to 0.28em).
- **Do** limit motion to 200ms colour/fill changes and the 400ms ease-out decode, and drop all of it under reduced motion.

### Don't:
- **Don't** round corners or add shadows; every box is square and flat.
- **Don't** use red at rest or for anything other than state, focus, decode or destructive actions.
- **Don't** use yellow for anything but progress percentages, blue for anything but links and video, or green for anything but success.
- **Don't** fill primary buttons with colour at rest; they are ink outlines that invert on hover.
- **Don't** let a thumbnail sit in full colour at rest in a catalogue list.

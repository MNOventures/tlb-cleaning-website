# Sections inventory

This is the map of what exists. **Before adding a new component, check here
first** — if something close already exists, extend it with a prop/variant
instead of forking a new file. That's the whole point of this exercise.

Every section is brand-agnostic: it reads only from `src/styles/tokens.css`
(the semantic layer) and its own props. Re-skinning the whole page for a
different brand means replacing `tokens.css` — nothing in `src/components/`
should ever need to change.

**Content editing.** On the TLB site, each section's CONTENT props (words,
photos, alt text, links) have a schema in `src/lib/cms-schemas.ts` and a
matching editor component in `.pages.yml`; design props (variant, theme,
ratio, tone) stay in the page. When a section gains or loses a content prop
here, change those two as well. See the root `README.md`, "Content and Pages
CMS".

This repo is the library itself, not a deployed brand site — see the root
`README.md`. Every variant documented below traces back to a wireframe at
`design-refs/wireframes/<section>/<variant>.png`; that's where a new
wireframe gets dropped before it turns into a `variant` prop here.

---

## UI primitives — `src/components/ui/`

### `Placeholder.astro`

Purpose: reserve space for an image that doesn't exist yet, with zero layout
shift and a label real asset briefs can be written from.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `ratio` | `string` | `"4/3"` | Any valid CSS `aspect-ratio` value, e.g. `"16/9"`, `"1/1"`, `"4/1"`. |
| `label` | `string` | — required | Descriptive, e.g. `"Support worker with participant"`. Rendered as visible text while this is a placeholder, and as the image's `alt` once `src` is set. |
| `src` | `ImageMetadata` | — | A statically-imported image (`import img from '../../assets/…png'`). Omit to keep the dashed placeholder box; set it and the component swaps to an optimized `<Image>` filling the exact same box, so nothing else has to change. |
| `eager` | `boolean` | `false` | Set for above-the-fold images (a hero's) so they load eagerly at high fetch priority instead of lazily. |
| `fit` | `'cover' \| 'contain' \| 'contain-bottom'` | `'cover'` | How the image fills its box. `cover` suits a photo — it bleeds edge to edge and can lose a little off the sides. `contain` is for an asset whose whole frame has to survive: a cut-out figure on a transparent backdrop is visibly clipped by `cover` the moment the box's ratio drifts from the file's. Nothing shows in the leftover space, since the `--image` branch keeps no background of its own. `contain-bottom` is the same fit anchored to the bottom edge, for a cut-out whose subject is already flush with the bottom of its own frame — centred, that cut edge floats mid-box and reads as a mistake. Implemented as two inline custom properties on the wrapper rather than a modifier class: the declarations have to reach the `<Image />` element, which Astro stamps with *its* scope, not this file's, and a custom property inherits across that boundary where a class selector wouldn't match. |
| `caption` | `string` | — | Optional bottom-edge caption on a gradient scrim — mirrors `VideoPlaceholder.astro`'s own caption bar exactly (same CSS, same class naming), extended here once a photo (not just a video) needed the same "short message over the image" treatment. `ImageBand.astro` is built entirely around this. |
| `class` | `string` | — | Extra class for layout (radius, sizing) from the parent. |

```astro
<Placeholder ratio="4/3" label="Support coordinator meeting with a group of participants" />
<Placeholder ratio="21/9" label="Team at the annual conference" caption="Building stronger communities together." />

<!-- real asset, above the fold -->
<Placeholder ratio="16/9" label="Descriptive alt text" src={heroImg} eager />
<!-- cut-out figure standing on the section's bottom edge -->
<Placeholder ratio="1364/1032" label="Descriptive alt text" src={heroImg} fit="contain-bottom" eager />
```

Use this when: any section needs an image slot before real photography exists.

### `VideoPlaceholder.astro`

Purpose: same contract as `Placeholder`, plus a play-button affordance and an
optional caption bar, so a video embed can drop in later without touching
layout.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `ratio` | `string` | `"16/9"` | |
| `label` | `string` | — required | |
| `caption` | `string` | — | Optional caption bar pinned to the bottom edge. |
| `class` | `string` | — | |

```astro
<VideoPlaceholder ratio="16/9" label="Client testimonial video — support worker at home" caption="Top of the Leaderboard!" />
```

Use this when: a section needs a video slot (`VideoFeature` is the only
current consumer, but it's generic).

### `Button.astro`

Purpose: the one pill-button implementation for the whole system. Four
variants cover every button treatment that appears in the reference — don't
add a fifth without checking these first.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | — required | |
| `href` | `string` | — | Renders `<a>` if present, `<button>` otherwise. |
| `type` | `'button' \| 'submit'` | `'button'` | Only used when `href` is absent. `CallToAction.astro`'s `form` variant is the one caller that needs `'submit'` — a plain `type="button"` inside a `<form>` never submits it. |
| `variant` | `'brand' \| 'inverse' \| 'inverse-accent' \| 'surface'` | `'brand'` | See table below. |
| `size` | `'md' \| 'sm'` | `'md'` | |
| `fullWidth` | `boolean` | `false` | |
| `class` | `string` | — | |

| Variant | Rest state | Hover state | Used by |
|---|---|---|---|
| `brand` | yellow fill / charcoal text | charcoal fill / white text | Header CTA, PathwayCards CTAs |
| `inverse` | charcoal fill / white text | white fill / charcoal text | Hero CTA |
| `inverse-accent` | charcoal fill / yellow text | white fill / charcoal text | StatBand "Submit a Referral" |
| `surface` | white fill / charcoal text | charcoal fill / white text | StatBand "Not Quite Ready?" |

```astro
<Button label="Submit a Referral" href="#referral" variant="inverse-accent" />
```

Use this when: any section needs a call-to-action pill. Never hand-roll a
button in a section's scoped `<style>`.

### `ServiceIcon.astro`

Purpose: small inline-SVG icon set shared by `ServiceBlocks.astro`'s
`icon-grid` and `list` variants — extracted here because it's used by two
variants, not on the speculation that it might be someday (same bar
`StatBand.astro`'s own inline icon set was held to, which stayed local since
nothing else needs it yet).

| Prop | Type | Notes |
|---|---|---|
| `name` | `'idea' \| 'spark' \| 'bloom' \| 'puzzle' \| 'target' \| 'chart-pie' \| 'chart-bars'` | Add a new `case` here for a brand that needs another icon — same pattern as `StatBand.astro`. The last two were added for `ContentGrid.astro`'s "mixed media" wireframe, which is now this icon set's second consumer alongside `ServiceBlocks.astro`. |
| `class` | `string` | |

```astro
<ServiceIcon name="idea" class="service-blocks__icon" />
```

Use this when: `ServiceBlocks.astro` or `ContentGrid.astro` needs an icon —
now a genuinely shared primitive across two sections, not just one.

### `StarRating.astro`

Purpose: the 5-star rating row, extracted from `TestimonialCarousel.astro`
once `LogoBar.astro`'s featured quote needed the exact same thing — real
reuse, same bar as `ServiceIcon.astro`.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `rating` | `number` | — required | |
| `max` | `number` | `5` | |

```astro
<span class="testimonial-card__stars">
  <StarRating rating={item.rating} />
</span>
```

Deliberately sets no `color` itself — it renders `currentColor` fills/strokes
and lets the *caller's own wrapper* set color (which inherits down fine).
Passing a `class` straight into `<StarRating>` for color wouldn't work
anyway — see the Placeholder-scoping gotcha under `Hero.astro` below; this
component was designed from the start to avoid that trap rather than hit it.

Use this when: any section needs a star rating — currently
`TestimonialCarousel.astro`'s cards and `LogoBar.astro`'s featured quote.

---

## Shared page data — `src/data/`

Not components — the content every page repeats. `types.ts` holds the
structural prop shapes the components read (`NavItem`, `ImageBlock`,
`ButtonData`, …) and stays free of brand-specific content.

`navigation.ts` holds the site chrome: `primaryNav`, `headerNav` (the teal
service band and its mega-menus), `headerSecondaryCta`, `quoteCta`,
`serviceLinks` / `footerServiceLinks`, `footerContact`, `footerCopyright`.
It was inline in `index.astro` until `house-cleaning.astro` needed the
identical header and footer — two real consumers, the same bar
`ServiceIcon.astro` and `StarRating.astro` were held to. Page-specific
section content still lives in each page file; only the repeated chrome
moved here.

⚠️ `headerNav` mixes real service pages with non-service ones ("Meet the
team", "Why TLB", "Guides"), so the footer's Services column must **not**
be derived from it — that's what `serviceLinks` is for.

`outsideYourHome.ts` holds the five-page "Outside your home" cluster (window,
gutter, roof, high pressure, exterior house washing) and one helper,
`otherOutsideServices(currentHref)`, which returns the other four shaped for
`ServiceBlocks.astro`'s `list` variant. All five pages render that
cross-link row, so the list lives in one place and a page cannot link to
itself — five real consumers, well past this file's two-consumer bar.
`label`/`href` are `navigation.ts`' own mega-menu values verbatim, so the
menu and the page bodies can't drift into two names for one service.

`premises.ts` holds the thirteen-page "By type of premises" cluster under
`/commercial-cleaning/` (office, strata, aged care, medical/clinic/salon,
construction, hospitality, commercial kitchen, schools/childcare, gyms,
retail, warehouses, factories, breweries) and four things all thirteen
share:

| Export | What it is |
|---|---|
| `premisesPages` | The thirteen, in mega-menu order, each with a `blurb` so the pages describe each other in one voice. |
| `relatedPremises(self, extras?)` | The "Other premises we clean" pill list for one page: the other twelve, then any page-specific extras, then the two commercial services, then the hub. **Excluding `self` is why this is a function** — a page that links to itself in its own related band reads as an unchecked template and wastes a slot. |
| `commercialBusiness(description)` | The `LocalBusinessInfo` every commercial page hands `Base.astro`. ⚠️ Almost every field is still empty, inherited from the sibling pages built before this cluster; one fix here fills all thirteen. |
| `walkthroughCtaLabel` | `'Book a site walkthrough'` — the commercial CTA that replaces the sitewide `quoteCta` label, because commercial work is priced on a walkthrough rather than a form. One line changes it for the whole cluster. |

`PremisesHref` is a string-literal union of the thirteen slugs rather than
`string`, so a page cross-linking a sibling that doesn't exist is an `astro
check` error instead of a 404 a reader finds. Fourteen real consumers,
counting the hub — well past this file's two-consumer bar, and the
alternative was 156 hand-typed hrefs.

⚠️ Every href in it is still the flat kebab-case guess `navigation.ts` made
from its literal menu label, same as the rest of the site's slugs. Two are
menu labels rather than search terms (`/construction-site/`, `/factories/`);
both pages lead their `<title>` and `<h1>` with the real head term ("builders
clean", "factory cleaning") and say so in their file headers.

`meetTheTeam.ts` holds the four pages under the header's "Meet the team"
mega-menu (`/about/`, `/work-with-us/`, `/reviews/`,
`/how-booking-works/`) and the three things all four share:

| Export | What it is |
|---|---|
| `meetTheTeamPages` | The four, in mega-menu order, each with the `group` it sits in ("The people" / "Proof") and a `blurb` so the pages describe each other in one voice. |
| `otherMeetTheTeamPages(self)` | The other three, shaped for `ServiceBlocks`' `list` variant. **Excluding `self` is why this is a function** — the same call `relatedPremises` and `otherOutsideServices` make. |
| `meetTheTeamBusiness(description)` | The `LocalBusinessInfo` all four hand `Base.astro`. ⚠️ Still mostly empty, inherited from every page built before them; `sameAs` matters most here, since `/reviews/` is a page about third-party proof with no profile to link. |

`MeetTheTeamHref` is a string-literal union of the four slugs rather than
`string`, same guard as `PremisesHref`. Four real consumers, each
cross-linking the other three.

⚠️ These four pages had no content plan in `content-plans/`, unlike every
other page on the site. Each one's file header records what its copy was
built from and what it deliberately holds back (headcount, pay, insurance,
background checks, payment terms, any review score) — read those before
editing the copy.

`guides.ts` holds the nine editorial pages under the header's "Guides"
mega-menu, plus the hub at `/guides/`:

| Export | What it is |
|---|---|
| `guidePages` | The nine, in mega-menu order, each with the full-question `label`, a `shortLabel` for cross-link rows (the full question wraps to three lines and stops being scannable), the `cluster` it sits in ("End of lease & tenancy" / "Homes, hosting & commercial"), a `blurb`, and an `icon`. |
| `relatedGuides(self, extras?)` | The "More guides" pill list: the other eight, then any page-specific extras (usually the service pages that guide leans on), then the hub. **Excluding `self` is why this is a function** — same call `relatedPremises` and `otherOutsideServices` make. |
| `otherGuides(self, only?)` | The richer "Read next" row, shaped for `ServiceBlocks`' `list` variant. `only` narrows it to the handful that genuinely follow on, because eight rows is a wall; pass `self` as `null` on the hub, which legitimately wants all of them. |
| `guidesBusiness(description)` | The `LocalBusinessInfo` all ten hand `Base.astro`. ⚠️ Still mostly empty, inherited from every page built before them. `areaServed` names both states here, unlike `premises.ts`' NSW-only string — two of the guides are specifically about the NSW/QLD difference. |
| `lastReviewed` | The review-date line the two *regulatory* guides carry. ⚠️ A real editorial commitment: a page stamped with a date nobody reviews is worse than an undated one. |

`GuideHref` is a string-literal union of the nine slugs, same guard as
`PremisesHref` and `MeetTheTeamHref`. Ten real consumers.

⚠️ **The hub at `src/pages/guides/index.astro` derives its two sections from
`guidePages` by `cluster`** rather than hand-listing them, so a tenth guide
added to this file appears on the hub with no edit. It exists because
`navigation.ts` gives the Guides mega-menu item its own `href: '/guides/'`,
and without it that header link — and every "All guides" pill on the nine
leaf pages — is a 404.

⚠️ **Two of the nine describe live law or planning policy** (the NSW/QLD end
of lease guide, the Byron Shire cap guide) and **must not publish without
verification**. Both file headers carry a numbered list of exactly what to
check and against which authority. Both also state on the page, to the
reader, that they are not legal or planning advice.

⚠️ **The two cost guides publish the *structure* of a price with the numbers
as visible `[CONFIRM]` brackets**, because inventing a range is a misleading
price representation under BFD 5.3 and "contact us" wastes the query. Those
brackets cannot ship half-filled: fill them, or delete the section and keep
the rest of the page.

⚠️ **These pages are editorial and `Base.astro` only emits `LocalBusiness`
JSON-LD.** An `Article`/`FAQPage` prop would be additive and would not touch
the other pages, but it is a shared-layout change and was deliberately not
made — raise it before launch.

`contactForm.ts` holds the contact form's options, copy and endpoint — the
content half of `ContactForm.astro`. Two things in it matter beyond the form
itself:

- **`areaOptions` is derived from `locations.ts`' `locationGroups`**, not
  retyped, so the form cannot start naming regions the mega-menu and the 47
  "Where we clean" bands do not. Same rule, same reason, as everything else
  that reads that file.
- **`enquiryEndpoint` fails closed**, in the same spirit as `site-env.ts`.
  It is empty until `PUBLIC_ENQUIRY_WEBHOOK_URL` is set in the host's build
  environment, the build prints one `[FORM]` line saying which state it
  produced, and the form refuses to submit rather than showing a thank-you it
  has not earned. See `MONDAY-FORM-SETUP.md`.

⚠️ `serviceOptions` and `areaOptions` labels are submitted **verbatim** and
must match the Monday.com dropdown labels exactly. Monday drops an unknown
label silently — no error, just an empty cell — so renaming one here without
renaming it on the board loses that field on every enquiry from then on.

---

## Sections — `src/components/sections/`

### `SiteHeader.astro`

Purpose: two-bar site header (white utility bar + brand-color service bar),
collapsing to a hamburger panel below 900px.

| Prop | Type | Notes |
|---|---|---|
| `logo` | `{ label: string }` | Rendered as a `4/1` `Placeholder`. |
| `primaryNav` | `NavItem[]` | `{ label, href, hasDropdown? }`. `hasDropdown` here is still just a decorative chevron — no panel. For a real dropdown, use `serviceNav`'s `megaMenu` instead. |
| `serviceNav` | `MegaMenuNavItem[]` | `NavItem` plus an optional `megaMenu: MegaMenuGroup[]` (`{ label?: string, items: NavItem[] }[]` — `label` is a grouping heading only, never a link; omit it for an ungrouped flat column). Rendered twice (service bar at ≥900px, folded into the mobile panel below it) so nothing is lost when it collapses. An item's own `href` still points at its own real page — the mega-menu is additive, not a replacement destination. |
| `secondaryCta` | `ButtonData` | Optional. Rendered *before* `cta` (both desktop and the mobile panel) as an outline-style `Button` variant `"inverse"` (override via `secondaryCta.variant`), size `"sm"` — e.g. a "Book online" link beside the main "Get a quote" button. Omit for the original single-CTA header. |
| `cta` | `ButtonData` | Rendered with `Button` variant `"brand"`, size `"sm"`. |

```astro
<SiteHeader
  logo={header.logo}
  primaryNav={header.primaryNav}
  serviceNav={[
    { label: 'Home Cleaning', href: '/home-cleaning/', megaMenu: [
      { label: 'Inside your home', items: [{ label: 'Deep cleaning', href: '/deep-cleaning/' }] },
    ]},
    { label: 'Guides', href: '/guides/' }, // no megaMenu — plain link
  ]}
  secondaryCta={{ label: 'Book your clean online', href: '/book/' }}
  cta={header.cta}
/>
```

**Mega-menu, desktop:** a real `<a>` for the item's own page, plus a
separate `<button>` (chevron) that toggles a `position: absolute` panel
below it. The panel is split into two nested elements on purpose:
- `.site-header__mega-panel` — the hoverable hit area. No visible styling,
  `top: 100%` flush against the trigger, and critically **`padding-top`
  for the gap to the visible card, not `margin-top`.** A margin gap was a
  real bug: the instant the pointer crosses empty margin space, it's over
  neither the trigger's box nor the panel's, `:hover` on
  `.site-header__mega-item` goes false, the panel `display: none`s itself,
  and the pointer can never actually arrive at a Level-B link. Padding is
  still part of the element's own box for hit-testing, so it bridges the
  gap without breaking the hover chain.
- `.site-header__mega-panel-inner` — the actual visible card (background,
  radius, shadow, padding). Deliberately **not width-capped**: columns use
  `grid-template-columns: repeat(var(--mega-cols), minmax(220px, 1fr))`,
  with `--mega-cols` set inline per item from that item's own
  `megaMenu.length` — not `auto-fit`. `auto-fit` needs a definite
  container width to know how many tracks fit, but this container's own
  width is `max-content` (sized to fit its content) — a circular
  dependency that reliably collapsed to a single tall column instead of
  laying out side by side. A fixed repeat count has an unambiguous
  max-content size, so it actually renders as N real columns.
- `.site-header__mega-panel` also carries `z-index: 10`: once a panel can
  be genuinely wide (no cap), it can extend under *later* sibling nav
  items (e.g. Home Cleaning's panel reaching under Commercial's trigger).
  Those siblings are also `position: relative` but `z-index: auto`, so
  without this they'd paint on top of an open panel wherever they
  overlap — later DOM order wins at equal stacking level otherwise.

Opens on hover/`:focus-within` with **zero JS** for mouse and keyboard;
the small amount of JS this component carries is only for touch (no hover
state to reveal it otherwise) via a `.is-open` class, mutually exclusive
across panels, closed on outside-click or Escape — the same
click-toggle-layered-on-CSS-hover pattern, not a JS-only menu.
`.site-header` itself gets `position: relative; z-index: 30` so the panel
(nested several `position` levels down) reliably paints above `<main>`
instead of behind it — an absolutely-positioned descendant with the
default `z-index: auto` has no guarantee of out-painting a later,
also-`auto` sibling like `<main>` otherwise; DOM order alone doesn't
settle that for positioned boxes.

**Edge-safe positioning:** `left: 50%; transform: translateX(-50%)` centers
a panel under its trigger, which clips past the viewport edge once a panel
is wide and a trigger sits near the left/right edge (Home Cleaning's
4-column panel, centered under a trigger near the header's own left edge,
did exactly this live). Fixed with a small measure-and-nudge script, not
more CSS: on `mouseenter`/`focusin` of the trigger (and the click-toggle
path, and `resize`), `positionMegaPanel()` measures the now-visible panel's
`getBoundingClientRect()` against `.site-header .container`'s own inner
edges (that container's `getBoundingClientRect()` plus its live
`getComputedStyle(...).paddingLeft`/`paddingRight`) — not the raw window
edge with a guessed gutter, which was tried first and read as too tight/
arbitrary. Using the header's own container means the panel lines up with
the logo's left edge / the CTA's right edge specifically, and stays
correct if `--space-md` (the container's `padding-inline`) ever changes,
since the padding is read live rather than mirrored as a second px value
to keep in sync. If it overflows either inner edge, sets a
`--mega-shift: Npx` custom property that the `transform` above already
reads (`translateX(calc(-50% + var(--mega-shift, 0px)))`) — 0 by default,
so an already-fitting panel is untouched. Guards against measuring a
currently-hidden panel (`display: none` → an all-zero rect, which would
compute and cache a bogus shift for next time it opens) and against
compounding shifts on repeated opens (resets the property before every
fresh measurement). This is positioning-only JS layered on the
hover-is-still-pure-CSS behavior above — it never controls whether a panel
is open, only where it sits once it already is.

**Mega-menu, mobile:** a native `<details>`/`<summary>` accordion per item
(same "reach for the native element" call `Faq.astro` already makes) —
no JS needed there at all. Its content leads with an "All {label}" link to
the item's own page (since `<summary>` itself can't cleanly host a nested
real link without click conflicts), then each group as a small heading +
list, single column (no `auto-fit` grid — mobile is already narrow).

Variant: none yet — the two-bar shape is the only one built. If a brand ever
needs a single-bar header, add a `bars: 1 | 2` prop rather than a new
component.

Use this when: this is *the* header for any page in this system. Reach for
`serviceNav`'s `megaMenu` specifically when a top-level item has real
Level-B children to expose, not just a visual chevron.

### `Hero.astro` — variants `split-mosaic` (default) | `full-width-photo` | `split-single-image` | `split-collage` | `minimal`

Purpose: one hero component, five layouts, selected with a `variant` prop.
Extend this with a new `variant` value for the next hero look a wireframe
calls for — don't fork a new component.

| Prop | Type | Notes |
|---|---|---|
| `variant` | `'split-mosaic' \| 'full-width-photo' \| 'split-single-image' \| 'split-collage' \| 'minimal'` | Default `'split-mosaic'`. |
| `kicker` | `string` | Optional short eyebrow label rendered **above** the `<h1>`, outside it — e.g. "WHY TLB". All variants. Deliberately not folded into `headingLines`: those all render *inside* the single page H1, so a kicker there becomes part of the heading text. Same idea `PhotoGallery.astro`'s `story` steps already have as `step`; added for the Why TLB page, which needs one here and one on `CallToAction.astro`. |
| `headingLines` | `string[]` | Each entry is one `<br>`-separated line inside the single page H1. All variants. |
| `lead` | `string` | Rendered at `--text-big`. All variants. |
| `cta` | `ButtonData` | Defaults to variant `"inverse"` if unset. All variants. |
| `logo` | `ImageBlock` | Optional small badge/logo above the heading. All variants; omit to render nothing. |
| `badges` | `ImageBlock[]` | `split-mosaic` only: trust badges inside the white card under the copy (Google Reviews, Registered NDIS Provider in this build). |
| `images` | `MosaicImage[]` | `split-mosaic` only: `{ ratio, label, span?: 'wide', offset?: boolean }`. One `span: 'wide'` image spans the top row; the rest flow into a row beneath; `offset: true` nudges an image down for the cascading look. Works with any count ≥1. |
| `image` | `ImageBlock` | `full-width-photo` / `split-single-image` only: the one hero image. Required for those two variants — nothing renders without it. `split-single-image` honours the block's own `ratio` (default `4/3`); that ratio only shows below `--bp-lg`, since on desktop the panel stretches to the copy column's height and the photo covers it. |
| `imageFit` | `'cover' \| 'contain' \| 'contain-bottom'` | `full-width-photo` / `split-single-image` only. Default `'cover'`, which is what a photo wants. Use `'contain'` for a cut-out figure on a transparent backdrop: the panel stretches to the copy column's height, so `cover` crops the sides off a frame meant to be seen whole. `'contain-bottom'` anchors that fit to the panel's bottom edge — for a cut-out whose subject is already flush with the bottom of its own frame, so it stands on the section edge rather than floating above a visible cut line (the homepage hero). Passes straight through to `Placeholder`'s own `fit` prop. |
| `cardWidth` | `'default' \| 'wide'` | `full-width-photo` only. Default `'default'` (480px) — the width every caller had before this prop existed, so the 56 `/locations/<town>/` pages are unaffected. `'wide'` is 640px, with the lead's measure widened to match, for a card whose heading otherwise wraps to four lines over a landscape photo worth seeing (the `/locations/` hub). Below `--bp-sm` both still collapse to the full container width. A prop, not a sixth variant — one measurement changes and the layout family is identical, the same call `imagePosition` and `minimal`'s `align` make. Implemented as a **discrete modifier class**, not an inline style: the `--bp-sm` rule has to be able to beat it, and inline-origin CSS wins at equal specificity (the `ContentGrid.astro` gotcha below). The two `--wide` rules tie on specificity with the ones they override, so they win on **source order** — keep them after the base `.hero__card` rules and before the `--bp-sm` block. |
| `video` | `{ src: string; title: string; ratio?: string }` | `split-single-image` only. An embedded player (Google Drive `/preview` or YouTube `/embed/` URL) in the media panel instead of `image`. Kept at the video's own `ratio` (default `'9/16'`) and centred in the panel, so a portrait reel shows no letterbox bars. `/local-care/` is the first caller. |
| `imagePosition` | `'left' \| 'right'` | `split-single-image` only. Default `'left'`. Mirrors the two panels at desktop widths; mobile is unaffected (copy stays above the image for both). A prop, not a sixth variant — mirroring one grid is the same layout family, same call as `minimal`'s `align`. |
| `collageImages` | `ImageBlock[]` | `split-collage` only: flows alternately into two stacked columns (index 0,2,4… left, 1,3,5… right). No `span`/`offset` — each image's own `ratio` does the sizing. Works with any count ≥1; required — nothing renders without at least one. |
| `align` | `'left' \| 'center'` | `minimal` only. Default `'left'`. |
| `stats` | `{ value, caption }[]` | `minimal` only: an optional compact row below the CTA, divided with hairlines. No icon — for the icon-bearing full-width version use `StatBand.astro` instead. Omit for the plain text-only look. Works with any count ≥1. |

```astro
<!-- split-mosaic (default) -->
<Hero headingLines={hero.headingLines} lead={hero.lead} cta={hero.cta} badges={hero.badges} images={hero.images} />

<!-- full-width-photo: full-bleed photo, a surface-coloured card floats over it -->
<Hero
  variant="full-width-photo"
  headingLines={['Lorem ipsum dolor']}
  lead="Lorem ipsum dolor sit amet, consectetur adipiscing elit,"
  cta={{ label: 'CTA Button', href: '#' }}
  logo={{ ratio: '2/1', label: 'Logo' }}
  image={{ ratio: '16/9', label: 'Descriptive label for the background photo' }}
/>

<!-- split-single-image: two flush half-width panels, one image, one copy -->
<Hero
  variant="split-single-image"
  headingLines={['Lorem ipsum', 'dolor sil']}
  lead="Lorem ipsum dolor sit amet, consectetur adipiscing elit,"
  cta={{ label: 'CTA Button', href: '#' }}
  image={{ ratio: '4/3', label: 'Descriptive label for the hero image' }}
/>

<!-- split-single-image, mirrored: copy left, image right (the homepage hero) -->
<Hero
  variant="split-single-image"
  imagePosition="right"
  headingLines={['Lorem ipsum', 'dolor sil']}
  lead="Lorem ipsum dolor sit amet, consectetur adipiscing elit,"
  cta={{ label: 'CTA Button', href: '#' }}
  image={{ ratio: '16/9', label: 'Descriptive label for the hero image', src: heroImg }}
/>

<!-- split-collage: copy + a static two-column image collage -->
<Hero
  variant="split-collage"
  headingLines={['Lorem ipsum', 'dolor sil']}
  lead="Lorem ipsum dolor sit amet, consectetur adipiscing elit,"
  cta={{ label: 'CTA Button', href: '#' }}
  logo={{ ratio: '2/1', label: 'Logo' }}
  collageImages={[
    { ratio: '3/4', label: 'Descriptive label 1' },
    { ratio: '1/1', label: 'Descriptive label 2' },
    { ratio: '1/1', label: 'Descriptive label 3' },
    { ratio: '3/4', label: 'Descriptive label 4' },
    { ratio: '1/1', label: 'Descriptive label 5' },
  ]}
/>

<!-- minimal: text-only, no image -->
<Hero
  variant="minimal"
  headingLines={['Lorem ipsum dolor sil']}
  lead="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  cta={{ label: 'CTA Button', href: '#' }}
  logo={{ ratio: '2/1', label: 'Logo' }}
/>

<!-- minimal + centered + stats: same variant, three extra props — not a sixth variant -->
<Hero
  variant="minimal"
  align="center"
  headingLines={['Lorem ipsum dolor sil']}
  lead="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  cta={{ label: 'CTA Button', href: '#' }}
  logo={{ ratio: '2/1', label: 'Logo' }}
  stats={[
    { value: '300+', caption: 'clients' },
    { value: '20+', caption: 'branches' },
    { value: '70+', caption: 'partnerships' },
  ]}
/>
```

Wireframes: `design-refs/wireframes/hero/full-width-photo.png`,
`split-single-image.png`, `split-collage.png`, `minimal.png`, and
`minimal-stats.png` (see that folder's README for provenance — all were
shared inline in chat, not saved to disk).

**Desktop minimum height:** every variant reads one shared
`--hero-min-height: 560px`, declared on `.hero` itself, so a page's hero
opens at the same scale whichever layout it uses — a text-only `minimal`
hero and the homepage's `split-single-image` shouldn't differ in height just
because one has a photo. 560px isn't new: `full-width-photo` already carried
that literal, and now reads the shared value instead.

Where each variant applies it matters. The split variants (`split-mosaic`,
`split-single-image`, `split-collage`) put it on `.hero__grid`, so the grid
*row* stretches and the photo panel grows with it; on the section instead,
the row would keep its content height and the photo would leave a band of
empty background beneath itself. `minimal` has no grid, so it goes on the
section, which becomes `display: flex; align-items: center` purely to keep
the copy centred in the taller band. Every variant releases the floor to
`auto` below `--bp-lg` (1025px) — phone content is already taller, and a
floor there only risks dead space. `full-width-photo` is the exception: its
photo *is* the background, so it needs a definite height to be visible at
all and keeps a shorter 420px one on mobile.

Mobile behaviour differs deliberately by variant:
`full-width-photo`'s card keeps its own solid background so legibility never
depends on the photo underneath, at any width. `split-single-image` reorders
copy *above* the image below the `--bp-lg` (1025px) breakpoint — the message
and CTA shouldn't sit under a full-width image on a small screen — the
reverse of desktop's image-left, copy-right reading order. With
`imagePosition="right"` that mobile order is already what desktop does, so
nothing visibly reorders there; the `--bp-lg` rules are written to win over
the mirror rules at equal specificity (they come later in the sheet) so both
positions land on copy-first. `split-collage`
does the same copy-first reorder at that breakpoint, but keeps its own
two-column collage grid at every width rather than dropping to one column —
a compact 2-up photo grid reads fine even at phone widths, and forcing it to
one column would just make the section far longer to scroll past. `minimal`
with `stats` set stacks the stat row to one column with horizontal dividers
below `--bp-sm` (480px), rather than cramming three narrow columns.

Use this when: a page needs a hero with a lead + CTA + a photo. This is the
highest-value component to reuse across other pages — only the copy, image,
and `variant` change.

**`split-collage` naming note:** the wireframe this was built from was
labelled "Split Hero - Carousel Image," but its own description and visual
both showed a fixed, static grid — not a rotating/sliding carousel. Built
(and named) to match what was actually depicted, confirmed with the person
who supplied the wireframe before building. If a genuinely interactive
image carousel is ever needed for a hero, that's a materially different,
larger build (porting the arrow/dot/keyboard JS pattern from
`TestimonialCarousel.astro`) and should be a distinctly-named variant, not
a silent change to this one.

**Gutter alignment:** the section is full-bleed (the photo runs off the
viewport edge), but its copy still has to start on the same vertical line as
every `.container` section on the page, or the H1 sits inboard of everything
below it. So the grid is three tracks, not two — `photo | copy | gutter`,
mirrored to `gutter | copy | photo` under `imagePosition="right"` — where the
gutter is an empty track sized
`max(--space-md, (100% - --container) / 2 + --space-md)`: exactly where
`.container`'s content edge falls. Percentages in a track size resolve
against the grid container's own width, which here is the full page width —
the same basis `.container` measures from. Deliberately **not** `100vw`:
that includes the scrollbar, which `.container`'s `margin-inline: auto` does
not, so a vw-based gutter would sit about half a scrollbar out. The copy
panel's outer padding is `0` to match (the gutter track is already holding
that space); only its inner edge, facing the photo, takes `--space-xl`.

Both panels are pinned to `grid-row: 1`. Without that, auto-placement — which
only ever walks forward — puts the DOM-first `.hero__media` in column 3 under
`-reverse`, parks the cursor past column 2, and bumps `.hero__copy` to a
second row: the hero renders as a diagonal stair rather than a split. The
`--bp-lg` block then has to reset **both** `grid-column` and `grid-row` to
their defaults, not just the column: an explicit `grid-column: 2` in a
one-column grid generates implicit columns (silently restoring the
side-by-side layout), and a leftover `grid-row: 1` would stack both panels
into the same cell.

**Patch note — `split-single-image`'s Off White band:** the *section* carries
`background: var(--color-surface)` (Off White), and neither panel sets one of
its own (the copy panel's own `--color-surface` was removed). Two reasons.
The panels read as one continuous band with no seam down the middle — the
split comes from the photo's edge, not from a colour change. And it's the
backdrop a cut-out asset with real transparency (the homepage hero's figure)
sits on: `Placeholder`'s `--image` branch deliberately clears its own
background, so without a fill on the section that figure has nothing to sit
on. That fill matches the body background, so it's declared for the same
reason every other variant declares one — the variant owns its band colour
rather than inheriting whatever the page happens to be — not because it's
visibly different here. Under an opaque cover photo it's invisible either way.

**Patch note:** `minimal`'s background was originally plain `--color-surface`
(pure white) specifically *because* `--color-surface-muted` was scoped
"placeholder fill only" at the time and reusing it felt like the wrong
move. That restriction has since been broadened (see "Token system quick
reference" below) after a second legitimate use turned up, so `minimal` now
uses `--color-surface-muted` and actually matches its wireframe's faint grey
tint instead of sitting on plain white.

**Why "E. Data are Show" became `minimal` + props, not a sixth variant:**
its wireframe is the same single-column, no-image content block as `minimal`
— centered instead of left-aligned, with a stat row added below the CTA.
Neither difference changes the underlying layout family, so it's `align`
and `stats` on the existing variant, per this file's own rule at the top:
extend with a prop before forking. A genuinely different structure (a
second content column, a background image, an interactive element) would
still earn its own `variant` value.

**Implementation gotcha (applies to any component, not just Hero):** Astro
only stamps an element with a file's scoped-style attribute when that
element is written directly in that file's own template. Passing a class
straight into a child component (`<Placeholder class="…" />`) puts the class
on Placeholder's root, but under *Placeholder's* scope — a rule in Hero's
`<style>` targeting that class silently never matches. Every `Placeholder`
call in this file that needs sizing/position from Hero's stylesheet is
wrapped in a plain `<div>` authored right here, and the rule targets the
wrapper instead. This was found live while building `split-single-image`: an
unwrapped `.hero__logo` fell back to Placeholder's own `width: 100%`, which
blew a `1fr 1fr` grid out to roughly a 10/90 split before the wrapper fix.
The same bug was latent in the original `split-mosaic` build too (mosaic
item radius/offset, badge sizing were passed straight to `Placeholder` and
never applied) — fixed here at the same time.

### `StoryMosaic.astro`

Purpose: alternating two-column prose/image mosaic. **This is the reuse
test the brief calls out** — it renders whatever `blocks` it's given, in
order, into a 2-column grid. Whether a block lands left or right, or reads
as "image-first" or "text-first," is purely a function of array order, not
special-cased logic. That's what let it serve two different sections without
a fork.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `theme` | `'dark' \| 'light'` | `'dark'` | Dark = charcoal bg / white text (About Maple). Light = white bg / body-grey text (Who Can We Help). |
| `heading` | `string` | — | Optional. Omit for a heading-less story block (About Maple); pass it for a titled one (Who Can We Help). |
| `blocks` | `StoryBlock[]` | — required | `{ type: 'text', body: string[] }` or `{ type: 'image', ratio, label }`, in reading order. |
| `cta` | `ButtonData` | — | Optional centered button below the grid — this is what turns it into `AudienceCollage`. |

```astro
<!-- Section 3: About Maple, no heading, no CTA -->
<StoryMosaic theme="dark" blocks={aboutMaple.blocks} />

<!-- Section 7: "Who Can We Help?" (AudienceCollage) — same component, three new props -->
<StoryMosaic theme="light" heading={audienceCollage.heading} blocks={audienceCollage.blocks} cta={audienceCollage.cta} />
```

Use this when: any page needs an alternating text/image editorial block —
brand story, service explainer, "who we help," etc. **Do not build an
`AudienceCollage.astro`** — that was the trap this component exists to avoid.

**Patch note — this component could not display a photograph at all.**
`StoryBlock`'s image variant was `{ type: 'image'; ratio; label }` with no
`src`, and this file never passed one to `Placeholder`, so every image block
it has ever rendered was a dashed placeholder box. It went unnoticed for the
same reason `TagCloud`'s stale `isHighlighted` did: excess-property checking
doesn't fire on a `const`-inferred array handed to a prop, so a caller
passing `src` got **no error from `astro check`** and no output either.
Found by auditing *rendered HTML* rather than page source while building the
thirteen "by type of premises" pages — the source-level audit had reported
all slots filled, because the `src` was right there in the caller. Four
pages (strata, aged care, schools/childcare, factories) had shipped seven
empty slots with the real photos imported and unused in `src/assets/`.
Fixed by adding `src?: ImageMetadata` to the type and passing it through.
`index.astro`'s team-photo slot is *correctly* still empty — no real team
photo exists and IMAGE-GUIDELINES §7 forbids generating one.

**Patch note:** `.story__image` was a class passed straight into
`<Placeholder class="story__image" />` — the same passthrough scoping bug
`Hero.astro`'s note and `PathwayCards.astro`'s patch note already describe,
so its `border-radius` never applied. Harmless while every slot was an empty
dashed box (which inherits its corners from elsewhere) and visible the
instant real photos went in. Fixed by wrapping in a `<div class="story__image">`
authored here, with `overflow: hidden` so the photo is actually clipped to
the radius. **Third occurrence of this bug in this library** — if you hand a
class to a component, assume it does not apply.

### `StatBand.astro`

Purpose: yellow band of four stat callouts (icon badge + big figure +
caption) plus up to two CTA buttons underneath.

| Prop | Type | Notes |
|---|---|---|
| `heading` | `string` | |
| `stats` | `{ icon: 'group' \| 'heart' \| 'language' \| 'house', value: string, caption: string }[]` | Icon is a key into a small inline-SVG set baked into the component — add a new `case` there if a brand needs a fifth icon. |
| `buttons` | `ButtonData[]` | Rendered with `Button`, one per entry. |

```astro
<StatBand heading={statBand.heading} stats={statBand.stats} buttons={statBand.buttons} />
```

Use this when: a page needs a row of 3–4 trust-building numbers. Stacks 2×2
at ≤768px, 1-column at ≤480px. **Not** the component for a plain,
icon-less number + caption — that's `MetricsBlock.astro` below; the two
look similar in a screenshot but solve different jobs (branded band + CTA
vs. plain figures).

### `MetricsBlock.astro` — variants `grid` (default) | `strip` | `list`

Purpose: plain number + caption metrics, no icon badge and no
brand-colour band — kept separate from `StatBand.astro` on purpose (see its
entry above). Three layouts, selected with a `variant` prop.

| Prop | Type | Notes |
|---|---|---|
| `variant` | `'grid' \| 'strip' \| 'list'` | Default `'grid'`. |
| `heading` | `string` | `grid`/`strip`: optional section-level intro above the block. `list`: rendered *inside* the panel instead, beside `lead` — matches its wireframe, where the heading sits in the card with the metrics, not above it. |
| `lead` | `string` | Optional, all variants. |
| `metrics` | `{ value: string, caption: string }[]` | All variants. Works with any count ≥1. |
| `image` | `ImageBlock` | `strip` only: the image the metrics row sits below. |

```astro
<!-- grid: ribbon-shaped cards, 2-up -->
<MetricsBlock metrics={[{ value: '10+', caption: 'lift in brand visibility' }, /* … */]} />

<!-- strip: image, then a divided metrics row below it -->
<MetricsBlock
  variant="strip"
  image={{ ratio: '16/9', label: '…' }}
  metrics={[{ value: '1000+', caption: 'lift in brand visibility' }, /* … */]}
/>

<!-- list: heading + lead beside a divided vertical list -->
<MetricsBlock
  variant="list"
  heading="Metrics of our excellence"
  lead="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
  metrics={[{ value: '473+', caption: 'High-Quality Chemical Products.' }, /* … */]}
/>
```

Wireframe: `design-refs/wireframes/metrics/*.png` (see that folder's
README — shared inline in chat, not saved to disk).

**`grid`'s ribbon shape** is a `clip-path` notch cut from each card's bottom
edge (a V, deepest at center) — pure decoration, not a content container.
Cards get extra bottom padding so the value/caption text stays clear of the
notch; the tail itself is always empty space, never something to put
content in.

Use this when: a page needs plain highlighted numbers and `StatBand`'s
icon-badge/brand-band/CTA treatment is more than the moment calls for —
`grid` for 3–4 standalone stats, `strip` for metrics under an image,
`list` for metrics beside an explanatory heading.

### `VideoFeature.astro`

Purpose: centered two-line heading over a single constrained video slot.

| Prop | Type | Notes |
|---|---|---|
| `headingLines` | `string[]` | |
| `video` | `{ label: string, caption?: string, ratio?: string }` | Passed straight through to `VideoPlaceholder`. |

```astro
<VideoFeature headingLines={videoFeature.headingLines} video={videoFeature.video} />
```

Use this when: a page needs one hero-style video moment (testimonial reel,
explainer, founder message).

### `ImageBand.astro`

Purpose: one full-content-width image with a short message on a bottom
gradient scrim. Thin wrapper — the actual caption-overlay treatment lives in
`Placeholder.astro` (see above); this file only adds section spacing and
rounded corners. Inset to the page's `.container`, not edge-to-edge to the
browser viewport — `Hero.astro`'s `full-width-photo` variant is the
deliberate edge-to-edge exception in this library, not the default.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `ratio` | `string` | `"21/9"` | Wide/short — this variant reads as a "band," not a standard photo. |
| `label` | `string` | — required | |
| `caption` | `string` | — | Optional, but this variant's whole reason to exist. |
| `src` | `ImageMetadata` | — | |

```astro
<ImageBand ratio="21/9" label="Team at the annual conference" caption="Building stronger communities together." />
```

Use this when: a page needs one full-width photo moment with a short
message over it, and doesn't need `Hero.astro`'s H1/CTA/page-opening role.

### `PhotoGallery.astro` — variants `grid` (default) | `filmstrip` | `story`

Purpose: three ways to present a set of photos, selected with a `variant`
prop.

| Prop | Type | Notes |
|---|---|---|
| `variant` | `'grid' \| 'filmstrip' \| 'story'` | Default `'grid'`. |
| `heading` | `string` | Optional on every variant — `story`'s own wireframe didn't show one. |
| `lead` | `string` | Optional, all variants. |
| `images` | `GalleryImage[]` (`ImageBlock & { caption?: string }`) | `grid`, `filmstrip` only. `caption` (e.g. "Copy Here") is `filmstrip`-only; `grid` simply ignores it if present — one shared shape across both rather than two near-identical ones. |
| `steps` | `StoryStep[]` (`{ step?: string, heading, body: string[], image: ImageBlock }`) | `story` only. `step` is the optional kicker label ("Day 1"). Works with any count ≥2 — a single step has nothing to connect to. |

```astro
<!-- grid: plain responsive N-image grid under a centered heading -->
<PhotoGallery heading="Our Gallery" images={galleryImages} />

<!-- filmstrip: heading+lead beside a row where clicking a frame grows it -->
<PhotoGallery
  variant="filmstrip"
  heading="Our Gallery"
  lead="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  images={[
    { ratio: '3/4', label: '…', caption: 'Copy Here' },
    { ratio: '3/4', label: '…', caption: 'Copy Here' },
    { ratio: '3/4', label: '…', caption: 'Copy Here' },
  ]}
/>

<!-- story: alternating image/text steps with a connector between each pair -->
<PhotoGallery
  variant="story"
  steps={[
    { step: 'Day 1', heading: '…', body: [...], image: { ratio: '4/3', label: '…' } },
    { step: 'Day 2', heading: '…', body: [...], image: { ratio: '4/3', label: '…' } },
    { step: 'Day 3', heading: '…', body: [...], image: { ratio: '4/3', label: '…' } },
  ]}
/>
```

Wireframes: `design-refs/wireframes/photo/band.png`, `gallery-grid.png`,
`gallery-filmstrip.png`, and `story.png` (see that folder's README — shared
inline in chat, not saved to disk).

**`filmstrip`'s expand-in-place, not a swap-to-showcase:** the wireframe's
own description was explicit — "the selected frame appears larger than the
rest… expands dynamically upon selection." That's a different interaction
than `ServiceBlocks.astro`'s `highlight` variant (which swaps content into a
*separate* showcase panel above N unchanging trigger cards). Here there's no
separate showcase — the clicked frame itself grows via `flex-grow`
(transitioned through `--duration-base`/`--ease-standard`, zeroed under
`prefers-reduced-motion` like everywhere else in this codebase) while the
rest shrink back to `flex-grow: 1`, all in the same row. Two different
wireframe descriptions, two different mechanisms — resist collapsing them
into one "expand" abstraction later; they don't share enough to be worth it.

**`story` vs. `StoryMosaic.astro`:** both alternate image/text blocks purely
by array order — the same reuse test. Kept as its own `PhotoGallery`
variant rather than folded into `StoryMosaic` because of two things
`StoryMosaic` doesn't have and shouldn't gain just for this: a `step` kicker
label per block, and a decorative connector rendered *between* blocks
(`StoryMosaic`'s `blocks` array has no concept of "between," only "each
block"). The wireframe's staggered/offset image positioning (step 2's image
sitting inset rather than flush to the row edge) was read as wireframe-tool
styling rather than deliberate layout intent and wasn't reproduced — the
alternating side + connector already carries the "meandering path" feeling
without needing per-step manual offsets.

Mobile: below `--bp-lg` (1025px) `filmstrip`'s text panel stacks above the
filmstrip instead of sitting beside it, and `story`'s steps drop to a single
column (image above text, reverse alternation reset to normal reading order)
— same reasoning as `Hero`'s split variants throughout: message/content
first, on a small screen. The `filmstrip` row itself keeps a `min-width`
per frame and scrolls horizontally rather than collapsing further — a
3-frame expand-in-place row doesn't have a sensible single-column form the
way an image grid does.

Use this when: a page needs a photo gallery (`grid`, or `filmstrip` for a
foregrounded/switchable image), or a narrative image+text sequence with a
visual "journey" feel (`story`) — not a general alternating editorial block,
which is `StoryMosaic`.

⚠️ **Not for before/after pairs — that's `BeforeAfter.astro`, immediately
below.** Both of this component's plausible variants were tried on that
content first and both fall short: `grid` leaves the viewer to hold one frame
in memory while looking at the next, and `filmstrip` grows the active frame
and shrinks the rest, so a Before and its own After are never the same size at
the same moment. This component's unit is the individual photo; a before/after
pair's unit is the pair.

### `BeforeAfter.astro`

Purpose: draggable before/after comparison sliders — two photos of one scene
laid exactly on top of each other, with a handle that wipes between them.
**The unit here is the PAIR**, not the photo.

Added for `content-plans/home-cleaning.md` §9, which is the gap
`house-cleaning.astro` had already written down in its own source: *"nothing
in SECTIONS.md pairs two images as one unit."* It didn't. Every existing
option treats images as a set of independent frames — see the "why not
`PhotoGallery`" note below.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `heading` | `string` | — | Optional section `<h2>`. |
| `lead` | `string` | — | Optional. Worth using to say the frame is draggable — the grip is an affordance, not an instruction. |
| `pairs` | `BeforeAfterPair[]` | — required | `{ before, after, caption?, start?, ratio? }`. `before`/`after` are each `{ src: ImageMetadata, alt: string }`. Works with any count ≥1. Export: `BeforeAfterPair`. |
| `beforeLabel` | `string` | `'Before'` | Pill on the left/overlay half. |
| `afterLabel` | `string` | `'After'` | Pill on the right/base half. |
| `note` | `string` | — | Optional closing line under the grid — provenance, consent, or (as house-cleaning currently uses it) the fact that the images on show are illustrative samples rather than real jobs. |

Per-pair: `caption` names what the pair shows, `start` (0–100, default 50)
sets where the handle opens, `ratio` (default `"4/3"`) sizes the frame.

```astro
<BeforeAfter
  heading="The difference, on real jobs."
  lead="Drag the handle across each photo to see the same spot before and after a clean."
  pairs={[
    {
      before: { src: kitchenBefore, alt: 'Kitchen benchtop before the clean' },
      after: { src: kitchenAfter, alt: 'The same benchtop after the clean' },
      caption: 'Kitchen benchtop and splashback',
    },
  ]}
/>
```

⚠️ **`src` is REQUIRED on both images — this component has no reserved-slot
mode**, which makes it the deliberate exception to this library's usual
`Placeholder`-until-the-asset-exists habit. A comparison slider with nothing
to compare has no meaningful empty state; two dashed boxes wiping over each
other is worse than not shipping the section. Use `PhotoGallery`'s labelled
`Placeholder` frames while the photography is still pending.

⚠️ **Both images in a pair must be the SAME SCENE from the SAME POSITION.**
The slider wipes one over the other in place, so anything that moves between
the two frames — a shifted camera, a chair pushed in, a different crop — reads
as a glitch rather than as cleaning. **The component cannot enforce this; the
photo brief has to.** It is the single thing most likely to make a real pair
fail after the code is correct.

**Why not a `PhotoGallery` variant.** Both of its plausible variants were
checked against this content and ruled out:

- `grid` lays N frames out side by side, so the viewer holds one in memory and
  saccades to the next — which is exactly the comparison a slider does *for*
  them.
- `filmstrip` grows the **active** frame and shrinks the rest, so a Before and
  its own After are never the same size at the same moment. That was the
  specific tension `house-cleaning.astro` recorded when it shipped `filmstrip`
  the first time.

`ContentGrid`/`StoryMosaic` have no concept of two images as one unit at all.
The interaction here is a wipe between the two members of a pair — a different
content shape, not a layout variant of "some photos" — so it is its own file,
per this file's own bar.

**The control is a native `<input type="range">`, not a hand-rolled drag
handler.** It brings pointer drag, touch, click-to-position, arrow/Home/End
keys and a screen-reader-announced value with it, none of which comes free
from a div with pointer events — the same "reach for the native element" call
`Faq.astro` makes with `<details>` and `ComparisonTable.astro` with `<table>`.
The input is stretched transparently over the whole frame (with a full-height
thumb, so a webkit drag can start anywhere vertically rather than in a band
across the middle); the visible divider and grip are `aria-hidden` decoration.
A visually-hidden `<label>` names it per pair — "slider, 50" tells a
screen-reader user nothing about which two photos they are moving between.

**One source of truth: `--ba-pos`.** The script's whole job is copying the
input's value onto the frame's `--ba-pos`. The overlay's clip and the
divider's position both read that one property, so there is no second state to
keep in step. It is declared with a `50%` fallback on `.before-after__frame`
itself, so with JS disabled or still parsing the pair renders as a clean
static split rather than one image with an invisible one on top.

**The overlay is clipped, not resized.** `clip-path: inset(0 calc(100% -
var(--ba-pos)) 0 0)` reveals the left portion. Deliberately not a width change
on a wrapper: the image inside must not *resize* as the handle moves, only be
revealed, or the two halves stop lining up and the wipe reads as a zoom.

⚠️ **Implementation gotcha — the range input MUST stay before the divider in
the DOM.** The input is transparent, so its focus ring has to be drawn on the
grip instead, and the only selector that reaches from the focused element to
the grip is a sibling combinator, which walks **forward only**. Built with the
divider first, that rule matched nothing — silently, with no warning from
anything (the same shape as this file's other "your own CSS silently loses"
notes). Caught and fixed before shipping; stacking order is `z-index`, not
source order, so the reorder costs nothing.

Also worth knowing, checked rather than assumed: `astro:assets`' `<Image>`
**does** receive the calling file's scope attribute, so a class passed to it
from here works — unlike a class passed into a custom component such as
`Placeholder`, which lands under *that* component's scope and silently never
matches (see `Hero.astro`'s note). Verified against the built HTML, not
inferred; if the images ever render unpositioned, check this first.

Layout: `repeat(auto-fit, minmax(420px, 1fr))`, so it works with any number of
pairs — same call `SiteFooter.astro`'s link grid makes. The 420px floor is a
usability minimum, not a look: much below it the handle has too little travel
to feel like a comparison rather than a fidget. The `--bp-md` query resets the
tracks to `1fr` explicitly, because a `1fr` column narrower than the floor
overflows the container rather than shrinking — the same "a breakpoint has to
be able to beat a layout choice" problem `ContentGrid.astro` and
`TrustBar.astro` both document.

`touch-action: pan-y` on the frame keeps vertical page scrolling working on a
phone while letting horizontal drags reach the input. Under
`prefers-reduced-motion` only the grip's decorative hover grow is suppressed —
the wipe itself is direct manipulation and stays, since removing it would
break the control.

Per-instance ids use the same build-time random suffix `Faq.astro`,
`ServiceBlocks.astro` and `TagCloud.astro` already apply. Needed twice over
here: for the section heading, and for *each* range input, since a duplicate
input `id` silently sends every `<label>`'s clicks to the first match on the
page.

**Also wired to all five "Outside your home" pages**, one pair each (window,
gutter, roof, driveway, weatherboard wall), against a second SAMPLE set built
by `scripts/make-exterior-before-after-samples.mjs` — a companion to the
indoor script below, kept as its own file because every scene geometry in it
is new and the indoor one's eight outputs are already imported by five pages.
Same rules: visible SAMPLE badge, `sample-` filenames, and the `note` prop
saying so on every page that renders one. Each page's own before/after block
carries the shooting brief for its pair.

**Wired to `house-cleaning.astro` §9**, currently against four SAMPLE
illustrations generated by `scripts/make-before-after-samples.mjs` — flat
vector drawings, each stamped with a visible SAMPLE badge, so the interaction
could be built and reviewed before any real client photography exists. That
page's `note` says so in the reader's own view. Swapping in real photos is
four import lines plus deleting the note; the shooting brief lives in that
page's §9 block.

Use this when: a page needs to show one scene in two states and the
comparison is the point — before/after cleaning, a renovation, a repair. Not
for a set of independent photos (`PhotoGallery`), not for one photo with a
message over it (`ImageBand`).


### `PathwayCards.astro`

Purpose: three (or more) numbered persona cards on a dark background,
routing different audiences to different CTAs.

| Prop | Type | Notes |
|---|---|---|
| `heading` | `string` | First line, white. |
| `headingAccent` | `string` | Second line, rendered in brand yellow — always a prop, never a second hardcoded string. |
| `cards` | `{ number, image: ImageBlock, title, description, cta: ButtonData }[]` | Numbering is meaningful here (distinct audiences) and stays. |

```astro
<PathwayCards heading={pathwayCards.heading} headingAccent={pathwayCards.headingAccent} cards={pathwayCards.cards} />
```

Use this when: a page needs to split traffic by audience/persona. Stacks to
one column at ≤800px.

**Patch note:** `.pathway__image` was originally a class passed straight
into `<Placeholder class="pathway__image" />` — the same passthrough
scoping bug documented under `Hero.astro` below, so its `border-radius: 0`
never applied and the image kept its dashed-placeholder corners (rounded,
inherited from `.pathway__card`'s radius) instead of the square ones the
card's own bottom-flush layout wants. Fixed by wrapping it in a `<div
class="pathway__image">` the way every other section here now does. Found
while building `ServiceBlocks.astro` and checking for the same bug
elsewhere, not reported by anyone — worth a re-look if this card's corners
ever look off in a real build.

### `TagCloud.astro`

Purpose: yellow band of dark pill tags in a responsive grid, with one
highlighted tag and a closing note.

| Prop | Type | Notes |
|---|---|---|
| `heading` | `string` | |
| `subheading` | `string` | |
| `tags` | `Tag[]` (`{ label, href? }`) | One flat run of pills. Renders `<a>` if `href` is set, otherwise a plain `<span>` pill. Omit when passing `groups`. |
| `groups` | `TagGroup[]` (`{ label, tags: Tag[] }`) | Labelled runs of pills, an `<h3>` per run. Wins if both are set. Export: `TagGroup`. |
| `note` | `string[]` | Closing lines, `<br>`-joined. |

```astro
<!-- one flat run -->
<TagCloud heading={tagCloud.heading} subheading={tagCloud.subheading} tags={tagCloud.tags} note={tagCloud.note} />

<!-- labelled runs -->
<TagCloud
  heading="Where we clean"
  subheading="Northern Rivers, the Tweed and the Southern Gold Coast."
  groups={[{ label: 'Northern Rivers', tags: [...] }, { label: 'The Tweed', tags: [...] }]}
  note={["If a town isn't listed, ask us anyway."]}
/>
```

**Why `groups` and not three TagClouds, or one flat array.** Added for
`content-plans/deep-cleaning.md` §12's "Where we clean", which lists three
regions (Northern Rivers, the Tweed, Southern Gold Coast) as separately
labelled runs. Three consecutive `TagCloud`s would have meant three Dark Teal
bands back to back, each repeating a heading and subheading; flattening the
three into one `tags` array would have thrown the grouping away — including
that one of the three regions is in a different state. `groups` sits
*alongside* `tags` rather than replacing it, the same per-shape prop pair
`TrustBar.astro` (`items`/`cards`) and `Hero.astro`
(`image`/`images`/`collageImages`) already use, so every existing caller keeps
passing `tags` and renders byte-identically. Each group's wrapper is full
width so its grid tracks match the flat variant's exactly — a group of 28
towns and a group of 9 line up column for column down the section.

Use this when: a page needs to enumerate a long, flat list of conditions,
services, or categories as pills. 4 columns desktop, 2 tablet, 1 mobile.

**Patch note:** the heading `id`/`aria-labelledby` pair used to be the
literal string `"tag-cloud-heading"` — harmless with one instance per page
(true of every build until now), but `commercial-cleaning.astro` renders
**two** TagClouds on one page ("What we clean", the fifteen commercial
premises types, and "Where we clean", the suburb list), which produced two
elements sharing one `id` and left the second section's `aria-labelledby`
resolving to the first section's heading. Fixed with a build-time random
suffix per instance — the same fix `ServiceBlocks.astro` and `Faq.astro`
already apply, for the same reason. Found by building that page, not
reported by anyone.

**Patch note:** the `Tag` interface is now **exported** alongside `TagGroup`.
`src/data/premises.ts` builds pill lists for the thirteen "by type of
premises" pages and needs to name this shape; a shared data module that
hands this component its content should be typed against the component's own
contract rather than against a structurally-identical copy that can drift.
No behaviour change — `export` on an interface is erased at build time.

⚠️ **`isHighlighted` no longer exists.** The `Tag` interface is `{ label,
href? }` only — every pill uses the outlined Mint Green treatment now (see
the styling note in the component). A stale `isHighlighted: true` in a
caller's tag array will **not** be caught by `astro check` (excess-property
checking doesn't fire on a `const`-inferred array passed to a prop), so it
silently does nothing. Two were caught this way while building
`commercial-cleaning.astro`; check for others if a pill ever fails to
highlight as expected.

### `Faq.astro`

Purpose: expandable Q&A accordion — **only** the accordion variant lives
here. The wireframe's second example, "FAQ Grid" (static Q&A cards,
alternating tones, all visible, no expand/collapse), is exactly
`ContentGrid.astro`'s `text` block type already — question as `heading`,
answer as `body`, `tone` alternated per card — so it isn't rebuilt here.
Same default-to-reuse call as `Hero.astro`'s `split-mosaic`-vs-`StoryMosaic`
overlap: ask for it built as a second variant on this file instead if you
specifically want both FAQ looks grouped under one component.

| Prop | Type | Notes |
|---|---|---|
| `heading` | `string` | Optional. |
| `lead` | `string` | Optional. |
| `items` | `{ question: string, answer: string }[]` | Works with any count ≥1. |

```astro
<!-- FAQ Accordion -->
<Faq heading="Frequently Asked Questions" items={faq.items} />

<!-- FAQ Grid — reuse ContentGrid, not a second Faq variant -->
<ContentGrid columns={2} blocks={[
  { type: 'text', heading: 'What is your services?', body: ['…'], tone: 'muted' },
  { type: 'text', heading: 'What is the price for your service?', body: ['…'] },
  { type: 'text', heading: 'How can I purchase?', body: ['…'], tone: 'inverse' },
  { type: 'text', heading: 'Where to get products?', body: ['…'] },
]} />
```

Wireframe: `design-refs/wireframes/faq/*.png` (see that folder's README —
shared inline in chat, not saved to disk).

**No JavaScript at all.** Uses native `<details>`/`<summary>`, grouped with
a shared `name` attribute so opening one item closes the others — that's
what an accordion is, not independent disclosures, and the browser does it
natively (Chrome 120+/Firefox 121+/Safari 17.2+; safe to rely on for a
2026-built template). Keyboard support and expanded-state announcement to
screen readers come for free from the native element — nothing hand-rolled
with ARIA. The +/- icon is pure CSS: a horizontal + vertical bar, the
vertical one scaled to zero via the `[open]` attribute selector, no icon
swap needed.

**Implementation gotcha specific to this element:** `name`-grouped
`<details>` exclusivity is **document-wide**, not scoped to the component
that rendered them — two `<Faq>` instances on one page sharing a literal
`name="faq"` would incorrectly close each other's open items, the same
*shape* of bug as the cross-instance `dots`/JS-query issues fixed elsewhere
in this codebase, just via a native HTML feature instead of a script.
Fixed with a build-time-random suffix (`faq-${Math.random()...}`) per
`<Faq>` render, giving every instance its own exclusivity group — verified
live with two instances on one page: opening an item in one left the
other's state untouched.

Use this when: a page needs an FAQ section — `Faq` for the expandable
accordion look, `ContentGrid` (see above) for the static short-answer grid.

**Patch note:** the `name`-grouping fix above was applied to the `<details>`
exclusivity group but **not** to the heading `id`, which stayed the literal
string `"faq-heading"`. Every page that renders a branded and a non-branded
FAQ block — `index.astro`, `ndis-cleaning.astro`, and now
`commercial-cleaning.astro` — had therefore been shipping two elements with
one `id`, with the second section's `aria-labelledby` resolving to the first
section's heading. Same build-time random suffix, applied to both now. Found
while building `commercial-cleaning.astro` and checking for the same bug
elsewhere, not reported by anyone — the same way `TagCloud.astro`'s own
identical patch was found in the same change.

### `TestimonialCarousel.astro`

Purpose: 1..N testimonials, one component — no `variant` prop, the *count*
and an optional `uniform` flag decide the look, same "extend before fork"
call as `ContentGrid.astro`:
- **1 testimonial** ("Testimonial Card" wireframe): arrows and dots simply
  aren't rendered — nothing to navigate to — and the card gets a wider,
  unscaled standalone treatment instead of carousel sizing.
- **2+, default**: the original 3-up centre-emphasized carousel — center
  card scaled up, neighbors scaled down and dimmed.
- **2+, `uniform`**: the same slider/arrows/dots/keyboard nav, but every
  card renders at the same size and opacity — no centre emphasis. Straight
  from the "Testimonial Carousel" wireframe's own description: *"Slider can
  zoom in highlight testimonials or everything has the same size and
  format."*

| Prop | Type | Notes |
|---|---|---|
| `heading` | `string` | |
| `testimonials` | `{ quote, name, role, rating: number, avatar: ImageBlock }[]` | Works with any count ≥1 — the center-on-index math is measured via `offsetLeft`, not hardcoded to 3. |
| `uniform` | `boolean` | Default `false`. Irrelevant with a single testimonial — nothing to differentiate from anyway. |

```astro
<!-- Testimonial Card: a single item is all it takes — no separate prop or component -->
<TestimonialCarousel heading="Our Testimonials" testimonials={[testimonials.items[0]]} />

<!-- Testimonial Carousel, emphasized (default) -->
<TestimonialCarousel heading={testimonials.heading} testimonials={testimonials.items} />

<!-- Testimonial Carousel, uniform -->
<TestimonialCarousel heading={testimonials.heading} testimonials={testimonials.items} uniform />
```

Wireframes: `design-refs/wireframes/testimonials/card.png` and
`carousel.png` (see that folder's README — shared inline in chat, not saved
to disk).

Implementation notes: vanilla JS (~1.3KB minified, shared with the header
toggle script — the whole page ships well under the 5KB JS budget), scoped
per-instance (a page can have more than one — e.g. a solo card section plus
a full carousel elsewhere) via a `document.querySelectorAll('[data-carousel]').forEach(...)`
wrapper. Arrows are labelled buttons; dots carry `aria-current`;
`ArrowLeft`/`ArrowRight` work anywhere inside the carousel; all transitions
route through `--duration-base`, which tokens.css zeroes under
`prefers-reduced-motion`.

**Patch note:** `dots` used to be gathered with a single unscoped
`document.querySelectorAll('[data-dot]')` — harmless with exactly one
carousel on a page (true of every build so far), but it would have
cross-wired multiple instances' dot state together the moment a second one
showed up, which is exactly what building the solo "Testimonial Card" case
made likely. Fixed while extending this file (verified with three carousel
instances on one page: clicking one instance's dots left the other two
untouched), not reported by anyone — the same class of thing as
`PathwayCards`' unwrapped-`Placeholder` patch note above: found by touching
adjacent code, not by an audit.

**Patch note:** the inline 5-star SVG loop is now `StarRating.astro`,
extracted once `LogoBar.astro` needed the identical thing — no visual or
behavioural change here, purely a dedupe.

Use this when: a page needs social proof — one quote, or several in
carousel form.

### `CardCarousel.astro`

Purpose: a generic center-emphasis card carousel — the exact same mechanism
as this file's own carousel (arrows, dots, center card scaled up, neighbors
dimmed), but for arbitrary content instead of testimonials specifically.
**No `variant` prop** — same "extend before fork" call as `ContentGrid.astro`:
one card shape with optional `image`/`heading`/`body`, and whichever fields
a card actually has determines the look. All three wireframes this was
built from ("Content Card Carousel," "Image Carousel," "Highlights
Carousel") turned out to be this same mechanism with different fields
populated — text-only, image-only, and both, respectively.

| Prop | Type | Notes |
|---|---|---|
| `heading` | `string` | Optional — omit for a heading-less carousel dropped straight into a page. |
| `lead` | `string` | Optional. |
| `cards` | `{ image?: ImageBlock, heading?: string, body?: string[] }[]` | Works with any count ≥1, same `offsetLeft`-measured centering as `TestimonialCarousel`. A card with only `image` renders image-only; only `heading`/`body` renders text-only; both renders image-on-top. |

```astro
<!-- Content Card Carousel: text-only -->
<CardCarousel cards={[{ heading: '…', body: ['…'] }, /* … */]} />

<!-- Image Carousel: image-only -->
<CardCarousel cards={[{ image: { ratio: '1/1', label: '…' } }, /* … */]} />

<!-- Highlights Carousel: image + text -->
<CardCarousel cards={[{ image: { ratio: '4/3', label: '…' }, heading: '…', body: ['…'] }, /* … */]} />
```

Wireframe: `design-refs/wireframes/carousel/*.png` (see that folder's
README — shared inline in chat, not saved to disk).

**Why this isn't a `TestimonialCarousel` mode:** the mechanism is
identical, but `TestimonialCarousel`'s card markup (quote mark, avatar,
name, role, star rating) is testimonial-specific — there's no natural way
to make it optionally render as a plain content or image card without
either a pile of extra conditionals or fields that don't apply most of the
time. A new file with a genuinely generic card shape was the more honest
option. The interaction-mechanism JS is *duplicated* from
`TestimonialCarousel`, not shared — this codebase already has two
independent track-sliding scripts (`ServiceBlocks`' and `PhotoGallery`'s
`slider` variants) rather than one shared carousel module, so this follows
existing practice rather than introducing a new one.

Use this when: a page needs a center-emphasis carousel of generic
content/image cards — not testimonials (`TestimonialCarousel`), not photos
specifically as the primary subject (`PhotoGallery`), not logos
(`LogoBar`).

### `LogoBar.astro` — variants `list` (default) | `carousel`

Purpose: the third "Social Proof" wireframe letter — A/B became
`TestimonialCarousel.astro`'s solo-card/`uniform` modes; this one got its
own file instead, because its primary entity is a brand logo, not a person.
`ServiceBlocks.astro`'s `list` variant was considered and ruled out too — its
icon segment renders a fixed `ServiceIcon` glyph, not an arbitrary logo
image, so the two `list`s only *look* alike.

| Prop | Type | Notes |
|---|---|---|
| `variant` | `'list' \| 'carousel'` | Default `'list'`. |
| `heading` | `string` | Optional, both variants. |
| `lead` | `string` | Optional, both variants. |
| `logos` | `LogoBarItem[]` (`{ logo: ImageBlock, quote?, company?, tag? }`) | `quote`/`company`/`tag` are `list`-only; `carousel` just renders the logo. `tag` is the relationship line, e.g. "5x Client of MNO". |
| `featuredQuote` | `{ rating: number, body: string, attribution: string }` | `carousel` only: one static quote below the logo strip — not tied to whichever logo is currently scrolled into view. |

```astro
<!-- list: stacked logo + quote rows -->
<LogoBar
  logos={[
    { logo: { ratio: '2/1', label: '…' }, quote: '…', company: 'Company Name', tag: '5x Client of MNO' },
    { logo: { ratio: '2/1', label: '…' }, quote: '…', company: 'Company Name', tag: '3x Client of MNO' },
  ]}
/>

<!-- carousel: heading + scrollable logo strip + one featured quote -->
<LogoBar
  variant="carousel"
  heading="Trusted by Industry Leaders"
  lead="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  logos={partnerLogos}
  featuredQuote={{ rating: 5, body: '…', attribution: 'John Doe, CEO of Star Logo' }}
/>
```

Wireframe: `design-refs/wireframes/testimonials/logo-bar.png` (see that
folder's README — shared inline in chat, not saved to disk; same source
image as `card.png`/`carousel.png`, this was letter "C" on it).

**`carousel`'s scroll mechanism is deliberately different from every other
slider in this codebase:** `TestimonialCarousel` and `PhotoGallery`'s
`slider` both track a discrete "active index" and translate a track to
match it — that math exists because those have a concept of one active
item. A logo strip doesn't; there's nothing to be "active." So this one
just scrolls a native `overflow-x: auto` track (with `scroll-snap`) by
~80% of the viewport width per arrow click, and disables an arrow when
there's nothing left to reveal in that direction. Simpler, and correct for
what this actually is — resist "unifying" it with the index-based sliders
later; the underlying interaction genuinely differs.

Use this when: a page needs to display partner/client/certification logos —
`list` for a logo + short quote per row, `carousel` for a longer strip of
logos with one featured quote underneath.

### `CallToAction.astro` — variants `primary` (default) | `secondary` | `form`

Purpose: three CTA banner treatments, selected with a `variant` prop.

| Prop | Type | Notes |
|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'form'` | Default `'primary'`. |
| `logo` | `ImageBlock` | `primary` only. |
| `kicker` | `string` | Optional short eyebrow label above the `<h2>`, outside it — e.g. "MEET THE TEAM". All variants. Same prop and reasoning as `Hero.astro`'s `kicker`, added at the same time for the Why TLB page which needs one in both places. |
| `heading` | `string` | All variants. |
| `lead` | `string` | Optional, all variants. |
| `cta` | `CtaAction` (`{ label, href?, variant? }`) | All variants. A local, looser type than the shared `ButtonData` — `href` is optional here because `form`'s submit button has none; a real `ButtonData` value (`href` always present) satisfies it too, so callers don't need two shapes. |
| `image` | `ImageBlock` | `primary`, `secondary` only. |
| `fieldLabel` | `string` | `form` only. Default `'Email address'`. Visually hidden — the wireframe shows no visible label, but the input still needs an accessible name. |
| `fieldPlaceholder` | `string` | `form` only. Default `'Enter your email'`. |
| `fieldType` | `'email' \| 'text'` | `form` only. Default `'email'`. |
| `action`, `method` | `string`, `'get' \| 'post'` | `form` only, both optional. Omit `action` to leave the form unwired until a brand has a real endpoint — it still submits (to the current page) rather than silently doing nothing. |

```astro
<!-- primary: logo + heading + lead + CTA beside an image, on a muted panel -->
<CallToAction
  logo={{ ratio: '2/1', label: 'Logo' }}
  heading="Lorem ipsum dolor sil"
  lead="Lorem ipsum dolor sit amet, consectetur."
  cta={{ label: 'CTA Button', href: '#' }}
  image={{ ratio: '4/3', label: '…' }}
/>

<!-- secondary: one flat band — heading + lead, small icon, CTA -->
<CallToAction
  variant="secondary"
  heading="Lorem ipsum dolor sil"
  lead="Lorem ipsum dolor sit amet, consectetur."
  image={{ ratio: '1/1', label: '…' }}
  cta={{ label: 'CTA Button', href: '#' }}
/>

<!-- form: centered heading + lead over a real input + submit button -->
<CallToAction
  variant="form"
  heading="Lorem ipsum dolor sil"
  lead="Lorem ipsum dolor sit amet, consectetur."
  cta={{ label: 'CTA Button' }}
/>
```

Wireframe: `design-refs/wireframes/cta/*.png` (see that folder's README —
shared inline in chat, not saved to disk).

**Why this isn't `Hero.astro`:** `primary`'s layout (logo + heading + lead +
CTA beside an image) is structurally close to `Hero`'s `split-single-image`
variant. Built as a separate component anyway because `Hero` is reserved for
a page's opening section — real `<h1>`, page-title role — and this is a
mid-page banner that needs an `<h2>`. Reusing `Hero` here would mean either
a page with two `<h1>`s or a prop just to swap the heading level, neither of
which belongs on the component whose entire job is being *the* page opener.

**The wireframe showed a lighter band above `primary`'s content** — read as
surrounding canvas whitespace in the mockup, not a second background tone
to build, the same call made for a few other wireframes' incidental
shading (`ContentGrid`'s "B" example, `PhotoGallery`'s `story` offsets, both
noted in their own entries). `primary` renders as one flat
`--color-surface-muted` panel.

**First form input in this library:** required extending two things rather
than hand-rolling around them — `Button.astro` gained a `type` prop (a
`type="button"` inside a `<form>` never submits it; verified live, not just
read: clicking the button with the required field empty correctly triggers
native validation and blocks submission, filling it correctly submits), and
`global.css`'s focus-visible rule now covers `input`/`select`/`textarea` so
the field gets the same keyboard focus ring as every button and link
already do, instead of whatever the browser's bare default happens to be.

Use this when: a page needs a mid-page call-to-action — `primary` for a
prominent banner with an image, `secondary` for a lighter internal-linking
nudge, `form` for an email/signup capture.

### `ContactForm.astro`

Purpose: the site's enquiry form — a two-column grid of labelled fields (name
pair, contact pair, two dropdowns) over a full-width message box and a submit
button. Currently on `/contact/` only.

| Prop | Type | Notes |
|---|---|---|
| `heading` | `string` | Defaults to `enquiryCopy.heading`. |
| `headingLevel` | `'h1' \| 'h2'` | Default `'h2'`. **Pass `'h1'` whenever this section opens the page** — there is no `Hero` above it to supply one, and a page with no `<h1>` has no machine-readable title. `/contact/` does exactly this. |
| `kicker` | `string` | Optional eyebrow label above the heading, e.g. "CONTACT". Same prop and treatment as `Hero.astro`'s and `CallToAction.astro`'s. |
| `lead` | `string \| null` | Defaults to `enquiryCopy.lead`. Pass `null` for no lead. |
| `theme` | `'muted' \| 'surface'` | Default `'muted'` — the cream panel. `'surface'` sits flat on the page. |
| `fallbackPhone` | `string` | Shown inside the failure messages, so a submit that does not send still leaves the reader somewhere to go. |
| `fallbackEmail` | `string` | Same. Pass `footerContact`'s values — not hand-typed ones. |

Field options, copy and the endpoint all come from `src/data/contactForm.ts`;
this component holds no content of its own.

**Four of the seven fields are required** — first name, email, contact number
and type of service (the client's call, 21 Sep 2026). Last name, service area
and message are optional. ⚠️ Service area is the field that *routes* an
enquiry and an untouched select submits an empty string, so some enquiries
reach the board with no region on them; the Message placeholder and the
"What to tell us" Callout above the form both still ask for the town, so it
is usually in the free text. Making it required again is one word in
`selects`.

```astro
<!-- mid-page -->
<ContactForm fallbackPhone={footerContact.phone} fallbackEmail={footerContact.email} />

<!-- opening the page, in place of a Hero — /contact/'s own usage -->
<ContactForm
  headingLevel="h1"
  kicker="Contact"
  fallbackPhone={footerContact.phone}
  fallbackEmail={footerContact.email}
/>
```

**This is the one section in the library that can stand in for `Hero.astro`.**
`/contact/` has no hero: the form replaced it on 21 Sep 2026, on the reasoning
that a reader who reaches a contact page has already decided to make contact,
so the form is what they came for. That is why `headingLevel` exists —
`SiteHeader` → `ContactForm` → … is a valid page shape, and it only works if
this component can carry the `<h1>`. Everywhere else, `Hero` still owns it.

**Why this isn't a `CallToAction` variant.** That component's `form` variant
is one input and a button, styled as a banner — no labels, no validation, no
submit state, no endpoint. Everything this component exists for (eight fields,
per-field errors, a success state that replaces the form, a submit that can
fail and has to say so) would have to be bolted onto a banner that still has
to render as a banner for its three existing callers. This file's own header
spells the same reasoning out: the shapes are not the same shape.

**The rule this component must never break:** it cannot report success it did
not get. Three paths, all of which tell the truth — no endpoint configured
(refuses, says it is not connected); endpoint but the request failed (says it
did not send, offers phone and email, and deliberately does **not** invite a
retry, because a failed fetch can mean the webhook got it and only the reply
was lost); request succeeded (replaces the form with the thank-you). This is
the condition on which `contact.astro`'s long-standing "NO CONTACT FORM" ban
was lifted rather than ignored.

**`id="enquiry"` is fixed, not a prop** — it is the anchor `/contact/`'s hero
and closing CTAs jump to, and an anchor a caller can rename is an anchor that
breaks the links pointing at it. One form per page is the assumption that
makes that safe.

**Three implementation details that look like tidying opportunities and are
not:**

1. **The POST body is `application/x-www-form-urlencoded`, not JSON.** That
   makes it a CORS "simple request", so the browser sends it with no preflight
   `OPTIONS` call — the most common way a static-site form to Zapier
   passes every local test and fails in production. Make and Zapier both parse
   urlencoded natively; nothing is lost.
2. **`action` and `method` are set on the `<form>` itself**, and `novalidate`
   is applied by the script rather than in the markup. With JavaScript off the
   form still delivers by native post, with native validation intact. The
   reader lands on the webhook's plain-text response instead of a thank-you,
   which is ugly — but an ugly confirmation beats a dead form.
3. **`.enquiry__grid[hidden]` and `.field[hidden]` are declared explicitly.**
   `[hidden] { display: none }` is a *UA* rule and any author `display`
   declaration outranks it, so without those two lines the grid's
   `display: grid` would keep the form visible underneath the thank-you.

**Anti-spam:** an off-screen `website` honeypot (filled → show the ordinary
thank-you, send nothing), and an `elapsedMs` field the page reports but
deliberately does not block on — filtering on it is the scenario's decision,
not the page's. Kept off `display: none`, which some bots specifically skip.

**Accessibility:** every required field carries the `required` attribute, a
visible asterisk *and* a visually-hidden "(required)"; errors set
`aria-invalid` and render as text in an `aria-describedby` target, so the
state never rests on the red border alone; the submit outcome lands in a
`role="status"` live region; the native select arrow is replaced with an
inline SVG so the two dropdowns are not visibly a different control from the
four inputs beside them.

Setup for the Monday.com side — board columns, the Zap, the
field mapping — is in `MONDAY-FORM-SETUP.md`.

Use this when: a page needs to collect a structured enquiry. If it needs a
one-field signup banner instead, that is `CallToAction`'s `form` variant.

### `ServiceBlocks.astro` — variants `icon-grid` (default) | `image-cards` | `list` | `highlight` | `slider`

Purpose: five ways to present a set of services/features under a heading +
lead, selected with a `variant` prop — a new section type (not a `Hero`
variant), since none of the layouts here are a hero (no H1, no page-opening
role). Extend this with a new `variant` value for the next "services" look
a wireframe calls for — don't fork a new component.

| Prop | Type | Notes |
|---|---|---|
| `variant` | `'icon-grid' \| 'image-cards' \| 'list' \| 'highlight' \| 'slider'` | Default `'icon-grid'`. |
| `heading` | `string` | All variants. |
| `lead` | `string` | Optional, all variants. |
| `items` | `ServiceItem[]` | `{ icon?, image?: ImageBlock, title, description, cta?: ButtonData, href? }` — one shared shape across variants; each variant only reads the fields it needs (see below), the rest are simply unused if passed. |
| `cta` | `ButtonData` | `icon-grid` only: an optional closing CTA under the grid. |

Per-variant field usage from `items`:

| Variant | Reads | Ignores |
|---|---|---|
| `icon-grid` | `icon`, `title`, `description` | `image`, `cta`, `href` |
| `image-cards` | `image`, `title`, `description`, `cta` (rendered as a full-width dark footer bar + chevron — **not** a `Button` pill; a genuinely different affordance, see note below) | `icon`, `href` |
| `list` | `icon`, `title`, `description`, `href` (row link target, defaults to `'#'`) | `image`, `cta` |
| `highlight` | `image`, `title`, `description`, `cta` (rendered as a real `Button` in the showcase panel) | `icon`, `href` |
| `slider` | `image`, `title`, `description`, `cta` (rendered as a real `Button` per slide) | `icon`, `href` |

```astro
<!-- icon-grid (default) -->
<ServiceBlocks heading="Our Services" lead={lead} items={iconItems} cta={{ label: 'CTA Button', href: '#' }} />

<!-- image-cards -->
<ServiceBlocks variant="image-cards" heading="Our Services" lead={lead} items={cardItems} />

<!-- list -->
<ServiceBlocks variant="list" heading="Our Services" lead={lead} items={listItems} />

<!-- highlight: click any trigger card below to feature it in the showcase panel above -->
<ServiceBlocks variant="highlight" heading="Our Services" lead={lead} items={showcaseItems} />

<!-- slider: prev/next arrows + dots move through one slide at a time -->
<ServiceBlocks variant="slider" heading="Our Services" lead={lead} items={showcaseItems} />
```

Wireframes: `design-refs/wireframes/service-blocks/icon-grid.png`,
`image-cards.png`, `list.png`, `highlight.png`, and `slider.png` (see that
folder's README — this batch came from `notes.txt` labels/descriptions plus
inline-shared images, not files on disk).

**`image-cards`' footer bar, not a `Button`:** the wireframe's CTA is a
full-width dark bar with a label + chevron flush to the card's bottom edge —
structurally a card-footer link, not the pill shape `Button.astro`'s entire
contract is built around. Stretching `Button` to cover it would mean either
a fifth pill variant that doesn't look like a pill, or new props that only
make sense for this one caller. Built as its own scoped `<a>` instead, per
this file's own top note: *extend* only when the new thing is really the
same shape as what exists.

**`highlight` vs. `slider` — why two variants instead of one configurable
one:** both are "N items, one shown at a time in an enlarged panel," but the
*trigger* is structurally different — `highlight` is driven by clicking any
one of N always-visible compact cards (a selection), `slider` is driven by
prev/next + dots over items that aren't otherwise shown (navigation). Same
underlying "swap the active panel" idea, different enough interaction model
to earn separate variants rather than one variant with a `trigger: 'click'
| 'arrows'` prop bolted on.

**`highlight`'s zoom, and the wireframe's click-to-zoom description:** the
wireframe's own text was "when clicked, it will be zoomed in" — built as: on
click, the newly-active panel replaces the previous one (via the `hidden`
attribute, not a toggled class) and gets a brief scale+opacity entrance
animation through `--duration-base`/`--ease-standard` (zeroed under
`prefers-reduced-motion`, same as everywhere else in this codebase). Not a
lightbox/modal — the panel swaps in place, which is what the wireframe's
single before/after mockup actually showed (a compact-cards state and an
enlarged-panel state, not an overlay).

**Implementation gotcha — `[hidden]` can silently lose to your own CSS:**
found live while verifying `highlight` in a real browser (not just by
reading the code) — every showcase panel rendered simultaneously on first
load, regardless of the `hidden` attribute Astro was correctly setting.
Cause: this file's own `.service-blocks__showcase-panel { display: grid }`
rule and the browser's built-in `[hidden] { display: none }` rule have equal
specificity, and *normal author CSS always wins over normal user-agent CSS
at a tie* — so an unqualified `display` declared by name on an element
silently defeats `hidden` on it, with no warning from anything. Fixed with
an explicit `.service-blocks__showcase-panel[hidden] { display: none; }`
rule, which now wins on specificity within the same (author) origin. Any
future variant that mixes the `hidden` attribute with its own `display`
rule needs this same explicit override — it won't fail loudly, it'll just
render everything at once.

Use this when: a page needs to present 3+ services/features and none of the
other sections' shapes fit (not a persona/audience split — that's
`PathwayCards`; not a stat callout — that's `StatBand`; not editorial
prose — that's `StoryMosaic`).

**Patch note:** the heading `id`/`aria-labelledby` pair used to be the
literal string `"service-blocks-heading"` on every variant — harmless with
one instance per page (true of every build so far), but the TLB homepage
(`content-plans/cleaning-services-homepage.md`) uses two `list` instances
on the same page, which would have produced two elements sharing one `id`
and left the second section's `aria-labelledby` pointing at the wrong
heading. Fixed with a build-time random suffix per instance, the exact same
fix `Faq.astro` already applies to its own per-instance group name. Found
by touching this file while building that page, not reported by anyone —
same pattern as this file's other patch notes.

**Patch note:** `.service-blocks__trigger-media` was a `<div>` wrapping
`Placeholder` inside a `<button>` — `<button>`'s content model is phrasing
content only, so a `<div>` there is invalid HTML (browsers render it
anyway, which is exactly why it went unnoticed). Changed to `<span
display: block>`, the same way `PhotoGallery.astro`'s filmstrip frames were
built from the start. Purely a markup-validity fix — no visual or
behavioural change.

### `TextBlock.astro`

Purpose: a plain single-column prose block — optional heading, body
paragraphs, optional CTA, no image slot at all. Added while building the
TLB homepage from `content-plans/cleaning-services-homepage.md`, which hit
this exact gap twice (an intro/definition paragraph and a persuasive "why"
block) with nothing in this file covering it — two independent real
consumers on one page is the same bar this library sets elsewhere for
"worth a shared component" (`ServiceIcon.astro`'s own justification).

| Prop | Type | Default | Notes |
|---|---|---|---|
| `theme` | `'light' \| 'dark'` | `'light'` | Light = white bg, `--color-body` text. Dark = charcoal bg, `--color-on-inverse` text — same color treatment `StoryMosaic.astro` already uses for its own dark/light themes. |
| `align` | `'left' \| 'center'` | `'center'` | |
| `heading` | `string` | — | Optional — omit for a heading-less block. |
| `body` | `TextBlockBody[]` | — required | One entry per block, in reading order. A `string` renders as a paragraph; `{ list: string[] }` renders as a bullet list. `string[]` still satisfies this, so pre-existing callers are unchanged. |
| `cta` | `ButtonData` | — | Optional. Defaults to `brand` variant on light, `inverse-accent` on dark. |

```astro
<TextBlock theme="light" body={['One paragraph of plain prose, no image.']} />
<TextBlock theme="dark" body={['A second, unrelated prose block further down the same page.']} />

<!-- a list between paragraphs — order in the array is the order on the page -->
<TextBlock
  theme="dark"
  align="left"
  heading="Nobody leaves a cleaner over the cleaning."
  body={[
    'They leave because:',
    { list: ['The messages stopped getting answered.', 'The good one moved away, or got busy.'] },
    "What you want isn't a spotless house. It's to stop thinking about it.",
  ]}
/>
```

**Why lists are a `body` entry and not a `bullets` prop:** a separate
`bullets` prop can only render *after* the paragraphs, but the copy that
needed this (`content-plans/home-cleaning.md` §7) has a lead-in line above
the list and two conclusions below it. Making `body` polymorphic keeps
source order authoritative — the same "array order is the layout" call
`StoryMosaic.astro` and `ContentGrid.astro` already make — instead of
adding a second ordering concept alongside it. Export: `TextBlockBody`.

Markers are drawn as `::before` pseudo-elements, not by re-enabling
`list-style`: `reset.css` clears list markers globally (`ul, ol {
list-style: none }`), and a pseudo-element takes its colour from
`currentColor`, so the marker follows the light/dark theme without a
second rule or any `::marker` support assumption. A centred block keeps
its list left-aligned (`.text-block__inner--center .text-block__list`) —
centred bullet text is unreadable past a few words.

**Deliberately not `StoryMosaic.astro`:** that component always lays out a
2-column grid — a text-only use there leaves an empty half-width gap that
reads as a layout bug, not a deliberate choice (this was checked and
rejected as a stretch option before building this file). This component is
single-column with no image concept at all.

Use this when: a page needs a plain paragraph or two with no photo — an
intro/definition block, a persuasive "why" section, anything that isn't
worth `StoryMosaic`'s alternating image/text treatment.

### `TrustBar.astro`

Purpose: a thin divided row of 3–5 short proof-point phrases, directly
under a hero. Added for the same homepage build, once it became clear
`StatBand.astro`/`MetricsBlock.astro` (both number-led captions — a
`value` figure is their whole contract) and `TagCloud.astro` (a long
enumerable pill list) all didn't fit content like "9 full-time local
cleaners, employed not subcontracted · Working both sides of the border,
NSW and QLD · Trusted by leading Northern Rivers real estate agencies" —
three short sentences, only one of which is actually numeric.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `'divided' \| 'card'` | `'divided'` | |
| `items` | `string[]` | `[]` | `divided` only. Any count ≥1; the spec's own guidance is 3–5. |
| `cards` | `{ icon: TrustBarIconName, title, description }[]` | `[]` | `card` only — the same per-variant prop call `Hero.astro` already makes. Icons: `team`, `map-pin`, `building`, `chat`, `shield-check`, `sparkle`. |

```astro
<TrustBar items={['9 full-time local cleaners, employed not subcontracted', 'Working both sides of the border, NSW and QLD']} />

<TrustBar variant="card" cards={[{ icon: 'team', title: 'Local team', description: '9 full-time local team members' }]} />
```

**The card copy lives in `src/data/trust.ts`, not in the pages.** All six
pages render the identical five proof points, so the array was extracted the
same way `comparison.ts` and `locations.ts` were — two real consumers is this
codebase's bar for sharing, and this had six. Three pages had already drifted
onto an older set of three points ("9 full-time local team members", "Every
client came from a recommendation") while the other three carried the five
from `content-plans/deep-cleaning.md` §4, which is exactly the failure the
extraction prevents. A page needing a *sixth*, page-specific point appends to
the shared array at the call site — but `card` has no laid-out rule past five
(see below), so that needs a component change first.

**`card` at five cells — 3-over-2, not five squeezed columns.** `card`'s
desktop row is one `1fr` column per cell, which is right for the three proof
points every page carried until `content-plans/deep-cleaning.md` §4 supplied
**five**. Five `1fr` columns in a 1200px container leave each supporting line
about two words wide. At **exactly five**, the component adds
`.trust-bar__card--wrap-5`: a 6-column track carrying three cells of `span 2`
then two of `span 3`, which centres the remainder instead of leaving an orphan
column, with cell 4 dropping its divider the way cell 1 does.

Deliberately scoped to five — four-or-fewer callers are untouched, and 6+ has
no caller yet, so a shape for it would be an unverified guess. **A 6+ caller
needs its own rule**; without one it falls back to the squeezed single row.

Both media queries reset the spans explicitly. They set their own column count
(2 at `--bp-lg`, 1 at `--bp-sm`), and a `span 2`/`span 3` inside a 2- or
1-column grid wins on specificity and overflows the track — the same
"a breakpoint has to be able to beat a per-instance layout choice" problem
`ContentGrid.astro`'s inline-custom-property gotcha documents, here solved by
resetting rather than by never setting. The tablet query also has to *restore*
cell 4's divider (it's mid-row at two per row, not a row start), and the
mobile query then has to out-specificity that restore to take every divider
off again.

Divider treatment (border-left hairlines, stacking to border-top below
`--bp-sm`) is deliberately copied from `Hero.astro`'s `minimal` variant's
own `stats` row rather than inventing a second visual language for the
same idea — no shared code between the two files, just the same
established pattern reused.

Use this when: a page needs a short row of proof-point sentences that
aren't uniformly numeric — not a stat callout (`StatBand`), not plain
numeric metrics (`MetricsBlock`), not a category pill list (`TagCloud`).

### `Callout.astro`

Purpose: an emphasised single-message panel for a "read this before you go
further" moment — one short heading, a paragraph or two, an optional CTA.
Not a section heading, not a running-prose block.

**Proposed and deliberately deferred once**, on
`content-plans/why-tlb.md` §9c, because it had exactly one consumer and this
library's bar is two (the same bar `ServiceIcon.astro` was held to). Built
once `content-plans/ndis-cleaning.md` §5 became the second, and both
consumers were wired up in the same change — the why-tlb block was
retro-fitted from the dark `TextBlock` it had been shipping as.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `tone` | `'note' \| 'warning'` | `'note'` | `note` = muted cream panel, teal accent bar — "worth knowing". `warning` = teal panel, mint accent bar — "don't do this". |
| `heading` | `string` | — | Optional. Rendered as an `<h2>` for document outline, but sized at `--text-big` — visually an aside, not a new chapter. |
| `body` | `string[]` | — required | One paragraph per entry. |
| `cta` | `ButtonData` | — | Optional. Defaults to `brand` on `note`, `inverse-accent` on `warning`. |

```astro
<Callout tone="note" heading="You probably don't need a registered provider." body={[...]} />
<Callout tone="warning" body={['Do not do this in the fortnight before Christmas. …']} />
```

**Deliberately not a `TextBlock` variant.** `TextBlock` is full-bleed and
section-shaped — a band of prose is the whole point of it. This is an inset
card that has to read as an interruption *within* the page's flow. Adding a
"look like a card instead of a band" flag to `TextBlock` would contradict
the thing that component exists to be.

**The accent bar's colour is set per tone, not once on the panel — and that
matters.** `--color-brand` and `--color-inverse` both resolve to the same
Dark Teal (`#234B51`), so a single `--color-brand` bar would be *invisible*
on the `warning` tone's teal panel. `note` uses `--color-brand` on cream;
`warning` uses `--color-accent` (Mint Green), the one token that reads
against teal. Caught by checking `tokens.css` while building, not by
looking at the rendered page — worth remembering for any future component
that assumes those two tokens differ.

Uses `border-inline-start` rather than `border-left` so a future RTL brand
flips it for free, and caps at `max-width: 60rem` — a callout that runs the
full container width stops reading as an aside and starts reading as a
section.

Use this when: a page needs to interrupt itself to correct something the
reader probably believes, or to warn them off an action. Not for running
prose (`TextBlock`), not for a mid-page conversion banner
(`CallToAction`).

### `ContentGrid.astro`

Purpose: one N-column grid, **no `variant` prop** — like `StoryMosaic.astro`,
the layout is entirely a function of the `blocks` array's order, each
block's `span` (grid-column width), and an optional `tone`
(surface/muted/inverse fill). Four cell types (`text`, `image`, `icon`,
`feature`) cover everything the wireframe this was built from showed,
without any special-casing — reordering the same `blocks` array is what
produces every different-looking arrangement, exactly the reuse test
`StoryMosaic.astro` was already built to pass, generalized to N columns and
two more cell types.

| Prop | Type | Notes |
|---|---|---|
| `heading` | `string` | Optional. |
| `lead` | `string` | Optional. |
| `columns` | `number` | Default `3`. Supports `2`–`4` (discrete modifier classes exist for each; add a fifth in the component + here if ever needed). |
| `numbered` | `boolean` | Default `false`. Steps in order: the grid renders as an `<ol>`, each cell as an outlined card opened by a numbered brand-colour circle (a CSS counter). For text cells. `/local-care/`'s "How it works" is the first caller. |
| `blocks` | `ContentGridBlock[]` | See cell types below. Each entry: `{ ..., span?: number, tone?: 'surface' \| 'muted' \| 'inverse' }`. `span` defaults to `1`, clamped to `columns`. `tone` defaults per type (`text`/`feature` → `surface`, `icon` → `muted`) and is always overridable, e.g. to get an inverse (dark) cell. |

Cell types:

| Type | Fields | Notes |
|---|---|---|
| `text` | `heading?`, `body: string[]` | Plain prose cell. |
| `image` | `ratio`, `label`, `src?` | Rendered through `Placeholder`. |
| `icon` | `icon: ServiceIconName` | Standalone decorative icon, no text — via `ServiceIcon.astro`. |
| `feature` | `icon`, `heading`, `body: string[]` | Icon + heading + body combined in one cell — the "mini feature blurb" cell type. |

```astro
<!-- A: two-column, image/text swappable purely by array order — see the
     duplication note below before reaching for this over StoryMosaic -->
<ContentGrid columns={2} blocks={[
  { type: 'image', ratio: '4/3', label: '…' },
  { type: 'text', heading: 'Lorem ipsum dolor sil', body: [...] },
]} />

<!-- B: asymmetric bento row (icon + a span-2 text block), then a uniform row -->
<ContentGrid columns={3} blocks={[
  { type: 'icon', icon: 'spark' },
  { type: 'text', heading: '…', body: [...], span: 2 },
  { type: 'text', heading: '…', body: [...] },
  { type: 'icon', icon: 'spark' },
  { type: 'text', heading: '…', body: [...] },
]} />

<!-- B, second example: the same text/icon/text pattern as row 2 above, on its own -->
<ContentGrid columns={3} blocks={[
  { type: 'text', heading: '…', body: [...] },
  { type: 'icon', icon: 'spark' },
  { type: 'text', heading: '…', body: [...] },
]} />

<!-- C: mixed media, one inverse-tone cell — reorder this same array for the
     wireframe's second "mixed grid" example, nothing else changes -->
<ContentGrid columns={3} blocks={[
  { type: 'icon', icon: 'spark' },
  { type: 'text', heading: '…', body: [...] },
  { type: 'icon', icon: 'chart-pie', tone: 'inverse' },
  { type: 'text', heading: '…', body: [...] },
  { type: 'icon', icon: 'chart-bars' },
  { type: 'text', heading: '…', body: [...] },
]} />
```

Wireframes: `design-refs/wireframes/content-grid/two-column.png`,
`info-grid.png`, and `mixed-media.png` (see that folder's README — each
wireframe showed two examples side by side, both reproduced above from the
same `blocks` shape, reordered).

**Deliberate duplication of `StoryMosaic.astro`:** `columns={2}` with
`text`/`image` blocks reproduces exactly what `StoryMosaic.astro` already
does. Flagged and confirmed before building rather than assumed — the
person who supplied this wireframe wanted all "Grid Content" examples
grouped under one importable component (a page-builder/consistency reason),
so this is a *known, intentional* overlap, not a missed cross-reference.
Default to reusing `StoryMosaic.astro` for a plain 2-column text/image
section; reach for `ContentGrid` at `columns={2}` specifically when this
component's family grouping matters more than avoiding the duplication.

**Implementation gotcha — an inline custom property can't be overridden by
a breakpoint either:** first built with `columns`/`span` set via inline
`style="--cg-columns: 3"` / `style="--cg-span: 2"`, reasoning that a
stylesheet media query could still reassign the *custom property* even
though it couldn't reassign a plain inline-styled property directly. That
reasoning was wrong, caught by checking computed styles in a real browser
(not by re-reading the code) — inline-origin CSS beats stylesheet-origin CSS
at equal specificity regardless of whether a custom property sits in
between, so the mobile breakpoint was silently overridden by the very same
inline value it was trying to replace, and every grid rendered its full
desktop column count squeezed into a phone-width viewport. Fixed by
switching to discrete modifier classes (`.content-grid__grid--cols-3`,
`.content-grid__cell--span-2`, etc.) with the actual values living in the
stylesheet — a breakpoint can always beat another same-origin stylesheet
rule via ordinary cascade/source-order, which is the same reason this file's
media queries elsewhere just use literal pixel values rather than reading
`--bp-*` tokens. Any future per-instance layout choice that a breakpoint
needs to override should use this pattern, not an inline custom property.

Use this when: a page needs an N-column grid where cell type/size varies by
position, or specifically for a 2-column text/image section that should be
grouped with this file's other examples rather than built with
`StoryMosaic.astro`.

**Patch note:** the heading `id`/`aria-labelledby` pair used to be the literal
string `"content-grid-heading"` — the fifth occurrence of the bug
`Faq.astro`, `TagCloud.astro`, `ServiceBlocks.astro`, `TextBlock.astro` and
`ComparisonTable.astro` were each already patched for. It stayed invisible
longer here because a heading-less instance renders no `id` at all, and all
four pages that already run two `ContentGrid`s (deep-cleaning, end-of-lease,
mould-cleaning, why-tlb) have at least one without a `heading`.
`work-with-us.astro` is the first page with two HEADED instances, and it
shipped two elements sharing one `id`, with the second section's
`aria-labelledby` resolving to the first section's heading. Same build-time
random suffix per instance as its five siblings. Found by grepping the BUILT
HTML for duplicate ids, not by reading the source — worth doing on any page
that renders the same section twice.

### `ComparisonTable.astro`

Purpose: a real row/column-aligned comparison table — one feature per row,
one compared entity per column, values as a check/cross icon or a short
text note, with one column optionally highlighted as "this is us." Added
as the genuine gap `content-plans/cleaning-services-homepage.md` (§8)
flagged with no working stretch at all — `ContentGrid.astro` was checked
directly against this need and ruled out: its N-column grid has no way to
keep "feature X" aligned consistently down a column across multiple
compared entities, which is the entire point of a comparison table.

| Prop | Type | Notes |
|---|---|---|
| `heading` | `string` | Optional. The section's own `<h2>` above the table. |
| `lead` | `string` | Optional. |
| `cornerLabel` | `string` | Optional. Visible text for the table's own top-left corner cell (e.g. "Why TLB Cleaning is different") — a second, distinct heading that lives inside the table itself, not the section's `<h2>` above it. Omit to keep that cell a plain sr-only "Feature" label. |
| `columns` | `{ label: string, highlight?: boolean }[]` | The compared entities (e.g. "TLB Cleaning", "Typical cleaner"). `highlight` tints that column's header/cells with the brand color. |
| `rows` | `{ label: string, description?: string, values: (boolean \| string)[] }[]` | One entry per feature. `description` is an optional second line under `label` (a short clarifying note, e.g. "(Led by Tegan, staffed by mothers who live where they clean)"). `values` aligns 1:1 with `columns` — `true`/`false` render as a check/cross icon, a string renders as its own short note (e.g. `"Sometimes"`). |
| `footnote` | `string` | Optional closing note below the table. |
| `cta` | `ButtonData` | Optional, centered below the table. |

```astro
<ComparisonTable
  heading="How we compare"
  cornerLabel="Why we're different"
  columns={[{ label: 'TLB Cleaning', highlight: true }, { label: 'Typical cleaner' }]}
  rows={[
    { label: 'Employed, not subcontracted', values: [true, false] },
    { label: 'Same cleaner every visit', values: [true, 'Sometimes'] },
  ]}
/>
```

Built as a real `<table>`, not a div grid — this is genuinely tabular data,
and native `<th scope="row"/"col">` semantics give screen readers the
row/column relationship for free, the same "reach for the native element"
call `Faq.astro` already makes with `<details>`/`<summary>`. Wrapped in the
standard `.container` (not `.container--narrow`) — a comparison table reads
better at full section width than the 800px narrow measure some other
sections (e.g. `Faq.astro`) use for prose.

Type sizing: row titles and column headings both use `--text-big`
(1.125rem), one step up from this library's more common `--text-small`
default for table-ish text — a deliberate legibility call for a table
that's meant to be a page's persuasive centerpiece, not a dense reference
grid. The check/cross icons are sized up to match (28px, from 20px) and
wrapped in their own `.comparison-table__icon-wrap` `<span>` — a
`display: flex` + centered `align-items`/`justify-content` on that inner
span, not on `.comparison-table__cell` (the `<td>`) itself. Two things
that were tried first and didn't work, in order:
1. `display: flex` directly on `.comparison-table__cell` — flex's outer
   display value is `block`, so it pulled the `<td>` out of table-cell
   layout entirely and dropped it below the row instead of beside its
   siblings, breaking desktop layout outright.
2. `text-align: center` + `vertical-align: middle` on `.comparison-table__cell`
   alone (no wrapper) — fixed the layout but the icon still rendered
   visibly off-center, apparently thrown off by incidental inline
   whitespace from the surrounding JSX. The `<span>` wrapper sidesteps
   that ambiguity entirely; `vertical-align: middle` is kept on the cell
   itself since it still governs the whole cell's content box (block-level
   children included) within the row's height. The mobile stacked-card
   layout still overrides `.comparison-table__cell` to `display: flex` +
   `space-between` inside its own `@media` block — safe there, since that
   applies to the cell as a whole flex *row* item (label vs. icon-wrap),
   not the icon centering itself.

On desktop, the table scrolls horizontally (sticky first column) if it
overflows. On mobile (≤768px, mirrors `--bp-md`) it switches to stacked
cards instead — one card per feature, not one card per segment: the
border/radius/`overflow: hidden` clip live on the `<tr>` itself, and the
row label and each compared column's value butt up against each other
inside it with zero gap, divided only by an internal `border-top` (a
brand-teal `border-top` on the highlighted column specifically). Each
value row shows its column's header label via CSS `::before` +
`data-label` on the left, the check/cross icon on the right via
`justify-content: space-between` (the real `<thead>` is only visually
hidden, not removed, so the table semantics screen readers rely on
survive the layout swap). This replaced an original horizontal-scroll
mobile treatment, then a since-corrected one-card-per-segment-with-gaps
version, before landing on the single-card-per-feature shape an approved
mockup called for — same underlying `<table>` markup throughout, just a
different `@media` block.

⚠️ **Specificity trap in the mobile `@media` block, hit three times while
building this:** the generic `.comparison-table__table th, .comparison-table__table td
{ display: block; ... }` reset (one class + one type selector) outranks a
plain single-class follow-up rule on the same element — a bare
`.comparison-table__cell { display: flex }` (or `border-bottom: none`, or
a padding override) silently loses that tie and never applies, regardless
of source order. Every rule meant to override that reset for `.row-label`
or `.cell` specifically is written as `.comparison-table__table
th.comparison-table__row-label` / `td.comparison-table__cell` (class +
type + class) to actually outrank it — copy that shape for any future
override in this block rather than a bare class selector.

Borders (the outer wrapper, the desktop row dividers, and every mobile
card) use `var(--color-body)` at `2px`, not the shared
`--color-border-muted` token (`#D8D8D8`) other components' hairlines
use — that's too faint to read as a real dividing line on a table meant
to be scanned row by row at a glance. Scoped to this component only;
`--color-border-muted` itself is untouched everywhere else.

**Wired to the homepage** — `src/pages/index.astro`, between "The why" and
"What we do," with `heading="How TLB Cleaning compares"` (the section's
`<h2>`) and `cornerLabel="Why TLB Cleaning is different"` (the visible
text inside the table's own top-left cell) — two distinct headings by
design, not a duplicate. Two row labels there carry a trailing `*` with no
footnote text supplied alongside them in the source; kept verbatim rather
than dropped, `footnote` left unset — add the footnote text once it
exists.

Use this when: a page needs to compare 2+ things (competitors, plan tiers,
before/after) feature-by-feature with a shared header row — not a free-form
N-column grid (`ContentGrid`), not plain numeric metrics (`MetricsBlock`).

### `SiteFooter.astro`

Purpose: charcoal footer — logo + optional tagline/social row, N link
columns, contact details with icons, an optional newsletter signup, and a
distinct copyright bar. Restructured to match a real reference footer's
*layout* (not its content or brand colour) — every new field is optional,
so an existing brand's data keeps working unchanged and just doesn't render
the sections it hasn't supplied.

| Prop | Type | Notes |
|---|---|---|
| `logo` | `{ label: string }` | |
| `brandHeading` | `string` | Optional. Short bold line under the logo, e.g. "For every home, every need." |
| `brandBody` | `string` | Optional. Paragraph continuing `brandHeading`. |
| `socialLinks` | `{ platform: 'facebook' \| 'instagram' \| 'linkedin' \| 'x' \| 'youtube', href: string, label?: string }[]` | Optional; omit for no social row. Icons are inline SVGs local to this file — add a `case` for a new platform. |
| `columns` | `{ title: string, links: NavItem[] }[]` | Any count — the Contact column (see below) is appended automatically alongside these, not inside `columns`. |
| `contact` | `{ phone, email, address }` | |
| `contactHeading` | `string` | Default `'Contact'` — override to `'Phone'` etc. if that fits the brand's content better. |
| `newsletter` | `boolean` | Default `true`. An email-only signup under the Contact details (no column of its own), posted to a Zapier catch hook (`PUBLIC_NEWSLETTER_WEBHOOK_URL`); copy from Pages CMS (`site/newsletter.yaml`). See `src/data/newsletter.ts` and NEWSLETTER-FORM-SETUP.md. Pass `false` to drop it. |
| `registration` | `string` | Now optional (was required) — a legal/registration line some brands need and others don't. |
| `copyright` | `string` | |

```astro
<SiteFooter
  logo={footer.logo}
  brandHeading="For every home, every need."
  brandBody="From everyday cleaning to specialised NDIS support, we're here to help make life easier."
  socialLinks={[{ platform: 'facebook', href: '#' }, { platform: 'instagram', href: '#' }, { platform: 'linkedin', href: '#' }]}
  columns={footer.columns}
  contact={footer.contact}
  contactHeading="Phone"
  registration={footer.registration}
  copyright={footer.copyright}
/>
```

**Layout, not a fixed column count:** `columns` (any length) + Contact (with
the newsletter signup inside it) all land in one `repeat(auto-fit, minmax(140px,
1fr))` grid — deliberately not a fixed `repeat(N, 1fr)`, which is what the
first pass at this restructure used and got wrong. `auto-fit` is what
actually handles "however many columns a brand happens to have" instead of
assuming a specific count. Below `--bp-sm` (480px) it's forced to a single
column regardless — `auto-fit` alone still had room to fit two 140px
columns side by side at phone widths, but the reference's own mobile view
(a second screenshot, shared after the desktop one) showed one column per
row, full width, all the way down; worth knowing if a future edit to this
grid is tempted to remove that override as "redundant" with `auto-fit`.

**Patch notes, both found live while restructuring, neither by re-reading
the diff:**
- The logo `<Placeholder>` had the same unwrapped-`class` scoping bug as
  `PathwayCards` and the original `Hero` build (`class="site-footer__logo"`
  passed straight into the child instead of onto a wrapper) — latent in
  the *original* file, just never visibly broken until this restructure
  changed the surrounding grid enough to expose it. Fixed with the same
  wrapper-`<div>` pattern used everywhere else in this codebase.
- A real content string — Maple's own contact email — doesn't wrap (no
  spaces), and flex/grid items default to `min-width: auto`, so it pushed
  the whole page into horizontal overflow at narrow widths. Fixed with
  `min-width: 0` + `overflow-wrap: break-word` on the contact list's
  text nodes. Both bugs were caught by checking real computed layout
  (`getBoundingClientRect`, `scrollWidth` vs. `innerWidth`) against the
  actual Maple homepage, not by trusting a screenshot at a glance —
  the same discipline applied to every other component this session.

Use this when: this is *the* footer for any page in this system.

---

## Accessibility note: body copy contrast — resolved

`--color-body` reads `--tlb-dark-teal` (`#234B51`): **8.33:1** on Off White,
**7.34:1** on Cream. AA at every size, AAA at normal size.

It previously read a previous-brand placeholder grey (`#7A7A7A`) carrying a
standing AA-fail flag. That flag understated the problem — it quoted
**4.29:1 on white**, but this site's page background is Off White, where the
grey measured **3.74:1** (and 3.51:1 on Cream). The grey's `--tlb-grey` slot
has since been deleted as a non-TLB colour, which took the whole issue with
it; the `#6E6E6E` alternative that was pending brand-owner sign-off is moot,
being no more a TLB colour than the grey was. Light-on-dark body text was
never affected: `--color-on-inverse` is Off White on Dark Teal at 8.33:1.

---

## Token system quick reference

- `src/styles/tokens.css` — Layer 1 (raw brand hex/typography values) then
  Layer 2 (semantic roles: `--color-brand`, `--color-on-surface`, etc.).
  Components reference Layer 2 only.
- To re-skin for a different brand: replace this one file. No component,
  no data file, needs to change.
- Layer 1 holds the five registered brand colours, each in a slot named for
  the colour itself: Dark Teal `#234B51` (`--tlb-dark-teal`), Teal `#50AB8D`
  (`--tlb-teal`), Mint Green `#7FC282` (`--tlb-mint-green`), Cream `#EBE1C7`
  (`--tlb-cream`), Off White `#F4EFE3` (`--tlb-off-white`). Slots for colours
  that aren't TLB's get deleted, not kept "just in case" — `--tlb-charcoal`,
  `--tlb-grey` and `--tlb-violet` are gone; the few previous-brand leftovers
  still in Layer 1 are there only because something reads them or a TLB value
  is still owed. Role names belong to Layer 2 only — a Layer 1 slot never claims to be "the brand colour", so
  rewiring a role can't leave a name lying about what it holds. Note **Teal
  is not wired to any Layer 2 role**, so it renders nowhere yet. Full
  record: `content-plans/brand-style-input.md`.
- One exception, unavoidable in plain CSS: `@media` breakpoints can't read
  custom properties, so every media query uses a literal pixel value with a
  comment naming the token it mirrors (e.g. `/* mirrors --bp-md */`). Keep
  those in sync by hand if a breakpoint token ever changes.
- `--color-surface-muted` was originally commented "placeholder fill only."
  Broadened to a general light-neutral-panel token once a second legitimate
  use showed up (`Hero.astro`'s `minimal` background, `ServiceBlocks.astro`'s
  `list` row body) — two real consumers earned it a wider contract rather
  than a near-duplicate second grey token. Still Layer 2, still swapped by
  replacing `tokens.css` alone.

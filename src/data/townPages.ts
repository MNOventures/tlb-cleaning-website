// Per-town data for the location pages at /locations/<town>/.
//
// WHY THIS FILE EXISTS, and why there is not one .astro file per town:
// the sample Lismore page proved that a location page is one layout with a
// handful of town-specific values swapped through it. Shipping that as 56
// near-identical page files would mean every future copy tweak has to be made
// 56 times, which is exactly the drift locations.ts was extracted to stop
// (four copies of one town list, see its own header). So the layout lives
// once in src/pages/locations/[town].astro and the per-town substance lives
// here.
//
// WHAT A TOWN NEEDS, in order of how much it matters:
//   1. `local`   — the paragraph only true of that town. THE important one.
//                  See the ⚠️ below. Optional in the type, required in
//                  practice before a town's page should be considered done.
//   2. `nearby`  — the suburbs it links out to. Derived by default.
//   3. `hero`    — which of the three region photos it opens on.
// Everything else (region, state, service list, table, FAQs, CTA) is
// identical across towns by design and lives in the route file.
//
// ⚠️ THE DUPLICATE-CONTENT PROBLEM IS NOT SOLVED BY THIS FILE. It is only
// made cheap to solve. As shipped, 55 of these 56 towns have no `local`
// paragraph, which means 55 pages that differ by a town name and six suburb
// links. Google calls those doorway pages and the penalty is not scoped to
// the thin pages — it can pull down the whole domain. Two ways out, and TLB
// has to pick one:
//   (a) Write `local` for every town before launch. Two or three sentences
//       each, from someone who works there. That is the version that ranks.
//   (b) Ship only the towns that have one, and leave the rest as unlinked
//       pills (locations.ts already documents how). Ten real pages beat 56
//       thin ones.
// Whoever picks, pick deliberately. Publishing all 56 as they stand is a
// decision too, just an unexamined one.
// THE VALUES LIVE IN PAGES CMS (PAGES-CMS-PLAN.md, Phase 2): one file per town
// in src/content/towns/ ("Locations > Towns"), holding its photo, its `local`
// paragraph and any hand-picked `nearby` list. The region photos are in
// src/content/site/locations.yaml. The rules below about what a photo and its
// description may claim apply to whoever edits those files.
import type { ImageMetadata } from 'astro';
import { z } from 'astro/zod';
import { cmsImage } from '../lib/cms';
import { loadFolder } from '../lib/cms-data';
import {
  northernRiversTowns,
  tweedTowns,
  southernGoldCoastTowns,
  allTowns,
  regionPhotos,
} from './locations';

const photo = z.object({
  src: z.string().startsWith('/src/assets/', 'Image must be inside src/assets'),
  alt: z.string().min(1),
});
const toHero = ({ src, alt }: z.infer<typeof photo>) => ({ src: cmsImage(src), label: alt });

const townFiles = loadFolder(
  'towns',
  z.object({
    town: z.string().min(1),
    hero: photo,
    local: z.array(z.string().min(1)).optional(),
    nearby: z.array(z.string().min(1)).optional(),
    // Optional YouTube video of a real TLB job in or near the town (hub #66).
    // Shown in the portrait video block under the intro while src is set.
    video: z
      .object({
        heading: z.string().optional(),
        lead: z.string().optional(),
        src: z.string().optional(),
        label: z.string().optional(),
      })
      .optional(),
  }),
);
const townFile = new Map(townFiles.map((file) => [file.town, file]));

{
  const known = new Set(allTowns);
  const strayFiles = townFiles.filter((file) => !known.has(file.town)).map((file) => file.town);
  const missingFiles = allTowns.filter((town) => !townFile.has(town));
  const badNearby = townFiles.flatMap((file) =>
    (file.nearby ?? []).filter((town) => !known.has(town)).map((town) => `${file.town} → ${town}`),
  );
  const problems = [
    strayFiles.length && `files for towns that are not in locations.ts: ${strayFiles.join(', ')}`,
    missingFiles.length && `towns in locations.ts with no file in src/content/towns/: ${missingFiles.join(', ')}`,
    badNearby.length && `"nearby" names a town that does not exist (check the spelling): ${badNearby.join(', ')}`,
  ].filter(Boolean);
  if (problems.length) throw new Error(`townPages.ts:\n  - ${problems.join('\n  - ')}`);
}

export type HeroKey = 'hinterland-home' | 'coastal-home' | 'valley';

// The three region photos. These are no longer what a town page opens on —
// every town has its own scene in townHeroes below — but they are still the
// fallback for a town added to locations.ts before its photo exists, and the
// /locations/ hub uses them for its own hero and its three region cards,
// which is the one place a region-wide photo is the honest choice.
//
// IMPORTANT: none of these is a photograph of a specific town.
export const heroImages: Record<HeroKey, { src: ImageMetadata; label: string }> = {
  'hinterland-home': toHero(regionPhotos.hinterlandHome),
  'coastal-home': toHero(regionPhotos.coastalHome),
  valley: toHero(regionPhotos.valley),
};

// ── ONE SCENE PER TOWN ───────────────────────────────────────────────────
// Every town now opens on its own photo instead of sharing one of the three
// above. The three-photo version was the honest thing to ship when there was
// no per-town imagery, but it meant twenty Northern Rivers pages opened on
// the same weatherboard house: a reader who checks two towns sees the same
// picture twice and correctly reads the whole set as stock.
//
// ⚠️ THE RULE THAT DID NOT CHANGE, AND THE ONE THAT DID.
// Each scene is chosen to be CHARACTERISTIC of its town — cane flats for
// Broadwater, red soil for Cudgen, canals for Burleigh Waters, a rock-shelf
// headland for Fingal Head. None of them is, or claims to be, a photograph
// OF that town. So the labels below still never name a town, a landmark or a
// street: they describe what is in the frame and nothing more. That is the
// whole reason this is publishable. A generated image captioned "the Byron
// Bay lighthouse" is a fabricated claim about a real place; the same image
// captioned "a headland above a curving bay" is a picture of a headland.
//
// Keep that distinction if you edit a label. If TLB shoots real town
// photography later, upload it on the town in Pages CMS and the description
// can finally say where it is.
//
// Regenerate the whole set, or re-shoot one town, with:
//   node scripts/locations/generate.mjs
// (prompts live in scripts/locations/town-scenes.json; delete a town's .jpg
// to re-shoot just that one). A new photo can also be uploaded straight onto
// the town in Pages CMS.
// ⚠️ Lismore deliberately uses the shared Northern Rivers region photo, not a
// Lismore-specific scene: this is TLB's pick. The /locations/ hub shows this
// same photo on its Northern Rivers card, so a reader going hub → Lismore sees
// it twice. That is the one place the repetition this file set out to remove
// still happens.
export const townHeroes: Record<string, { src: ImageMetadata; label: string }> = Object.fromEntries(
  townFiles.map((file) => [file.town, toHero(file.hero)]),
);

export interface Region {
  /** Used in prose: "the surrounding Northern Rivers". No leading "the". */
  label: string;
  state: 'NSW' | 'QLD';
  /** Every town in the region, in locations.ts order. Feeds `nearby`. */
  towns: string[];
  /** The hero a town in this region gets unless it overrides. */
  hero: HeroKey;
}

export const regions: Region[] = [
  { label: 'Northern Rivers', state: 'NSW', towns: northernRiversTowns, hero: 'hinterland-home' },
  { label: 'The Tweed', state: 'NSW', towns: tweedTowns, hero: 'valley' },
  { label: 'Southern Gold Coast', state: 'QLD', towns: southernGoldCoastTowns, hero: 'coastal-home' },
];

export interface TownOverride {
  /** The two-or-three-sentence paragraph only true of this town. */
  local?: string[];
  /** Hand-picked neighbours, when the derived window gets it wrong. */
  nearby?: string[];
  /** A hero other than the region default. */
  hero?: HeroKey;
}

// ⚠️ COASTAL TOWNS IN A HINTERLAND REGION. The Northern Rivers list runs from
// Lismore in the hills out to Byron and Ballina on the coast, so one region
// photo cannot be right for all of it: a beach town opening on a picture of
// farmland reads as a stock photo, which is the one thing a location page
// cannot afford. These towns take the coastal hero instead of their region's
// default. Judgement call from the map, not from local knowledge — worth a
// glance from someone who drives these roads.
const coastalTowns = new Set([
  'Ballina', 'East Ballina', 'Lennox Head', 'Skennars Head', 'Wardell', 'Evans Head',
  'Byron Bay', 'Suffolk Park', 'Brunswick Heads', 'Ocean Shores', 'New Brighton',
  'Tweed Heads', 'Tweed Heads South', 'Banora Point', 'Chinderah', 'Fingal Head',
  'Kingscliff', 'Casuarina', 'Cabarita Beach', 'Bogangar', 'Hastings Point', 'Pottsville',
]);

// Per-town overrides, from each town's content file. A town without `local`
// or `nearby` runs on region defaults and derived neighbours.
//
// ⚠️ ONLY LISMORE HAS A HAND-PICKED `nearby`, and NO town has a `local` yet.
// Adding them in Pages CMS is the entire cost of making a town's page real.
//
// Lismore's `nearby` is hand-picked rather than derived: the derived window
// (see nearbyFor below) walks locations.ts' own order, which puts Alstonville
// and Wollongbar next to Lismore but pushes Dunoon and Bexhill further out than
// they really are. Confirm they match where TLB's Lismore run actually goes.
//
// Lismore's `local` is still outstanding. The strongest material for this town
// is the 2022 flood — mould, rebuilt and repaired homes, and cleaning work that
// has a different context here than anywhere else in the service area, linking
// naturally to /house-cleaning/mould-removal/. Deliberately NOT drafted:
// inventing TLB's own account of a disaster in a community they work in is not
// a placeholder decision to make on their behalf. Also worth asking: which
// days the team is in Lismore, typical lead time, and the split between homes,
// rentals and CBD premises.
export const townOverrides: Record<string, TownOverride> = Object.fromEntries(
  townFiles
    .filter((file) => file.local || file.nearby)
    .map((file) => [file.town, { local: file.local, nearby: file.nearby }]),
);

export interface TownPage {
  town: string;
  slug: string;
  region: Region;
  nearby: string[];
  hero: { src: ImageMetadata; label: string };
  local: string[];
  video?: { heading?: string; lead?: string; src?: string; label?: string };
}

// ── NEIGHBOURS ───────────────────────────────────────────────────────────
// Which suburbs a town links out to, when it has no hand-picked list.
//
// FIRST ATTEMPT, AND WHY IT WAS THROWN AWAY: a sliding window over the town's
// position in its region array, on the theory that locations.ts' order is
// roughly geographic. It is roughly geographic WITHIN a sub-area and jumps
// between them, so every town sitting at the start of a cluster got half its
// neighbours from the previous one. Ballina came out linking to Clunes,
// Bexhill and Dunoon: hinterland towns half an hour inland, on the page of a
// beach town. Wrong in a way a local spots instantly and a reader quietly
// distrusts. Don't reintroduce it.
//
// WHAT REPLACED IT: explicit clusters, written out below. Six of these lists
// is a few minutes of work and it is checkable — someone who knows the area
// can read them and say yes or no, which is not true of an index heuristic.
//
// ⚠️ CLUSTERS ARE DRAWN FROM THE MAP, NOT FROM LOCAL KNOWLEDGE. They are
// ordinary geography rather than guesses about TLB's runs, but the person who
// drives these roads should still read them once. A town in the wrong cluster
// is a wrong-looking page, not a broken one.
//
// Every town belongs to exactly one cluster, and every town in a region is in
// one — the `clusterCoverage` check below fails the build if that ever stops
// being true, so adding a town to locations.ts can't silently produce a page
// with no neighbours.
const clusters: string[][] = [
  // Northern Rivers
  // Ordered south-east to north-west, not alphabetically and not in
  // locations.ts' order: the within-cluster ordering IS the distance
  // heuristic, so a list that jumps around produces neighbours that jump
  // around. Wollongbar and Alstonville sit south-east of Lismore, Nimbin is
  // the far end of the northern run, and putting Nimbin mid-list (as the
  // first draft did) had it linking to Alstonville and Wollongbar over
  // Clunes and Bexhill.
  ['Wollongbar', 'Alstonville', 'Lismore', 'Goonellabah', 'Bexhill', 'Clunes', 'Dunoon', 'Nimbin'],
  ['Casino', 'Kyogle', 'Coraki', 'Woodburn', 'Broadwater', 'Evans Head'],
  ['Ballina', 'East Ballina', 'Lennox Head', 'Skennars Head', 'Wardell'],
  ['Bangalow', 'Byron Bay', 'Suffolk Park', 'Federal'],
  ['Mullumbimby', 'Brunswick Heads', 'Ocean Shores', 'New Brighton', 'Billinudgel'],
  // The Tweed
  [
    'Tweed Heads', 'Tweed Heads South', 'Banora Point', 'Terranora',
    'Bilambil', 'Bilambil Heights', 'Fingal Head',
  ],
  [
    'Kingscliff', 'Chinderah', 'Casuarina', 'Cudgen', 'Cabarita Beach',
    'Bogangar', 'Hastings Point', 'Pottsville',
  ],
  ['Murwillumbah', 'Uki', 'Burringbar', 'Mooball'],
  // Southern Gold Coast — nine towns in one strip, no useful sub-division.
  [
    'Coolangatta', 'Bilinga', 'Tugun', 'Currumbin', 'Palm Beach',
    'Elanora', 'Burleigh Heads', 'Burleigh Waters', 'Miami',
  ],
];

const NEARBY_COUNT = 6;

const clusterIndexOf = (town: string) => clusters.findIndex((c) => c.includes(town));

// Two orderings do the work, and both are "nearest first by list position",
// which is only sound because both lists are written in geographic order:
//
//  1. WITHIN the cluster — nearest by distance from the town's own position,
//     not the first six in the list. Miami sits at the far end of the nine
//     Southern Gold Coast suburbs; taking the first six would give it
//     Coolangatta and skip Burleigh Heads next door.
//  2. TOPPING UP a small cluster — from the CLOSEST OTHER CLUSTER outward,
//     not from the top of the region. Byron Bay's cluster holds only four, so
//     it needs three more; region order would hand it Lismore and Goonellabah
//     (inland, half an hour away) when Mullumbimby and Brunswick Heads are
//     the next suburbs up the road.
//
// Both are still list-position heuristics over a hand-written order. They are
// good enough that the output reads right on inspection, and the escape hatch
// for anywhere they don't is a hand-picked `nearby` in townOverrides.
const byDistanceFrom = (index: number) => (a: { i: number }, b: { i: number }) =>
  Math.abs(a.i - index) - Math.abs(b.i - index);

const nearbyFor = (town: string, region: Region): string[] => {
  const ci = clusterIndexOf(town);
  const own = clusters[ci] ?? region.towns;
  const ti = own.indexOf(town);

  const inCluster = own
    .map((t, i) => ({ t, i }))
    .filter((e) => e.t !== town)
    .sort(byDistanceFrom(ti))
    .map((e) => e.t);

  if (inCluster.length >= NEARBY_COUNT) return inCluster.slice(0, NEARBY_COUNT);

  // Top up from neighbouring clusters, nearest cluster first, and never
  // across a region boundary: a Queensland suburb on a NSW town's page would
  // read as a mistake even where it is geographically true (Coolangatta and
  // Tweed Heads share a street).
  const rest = clusters
    .map((c, i) => ({ c, i }))
    .filter((e) => e.i !== ci && e.c.some((t) => region.towns.includes(t)))
    .sort(byDistanceFrom(ci))
    .flatMap((e) => e.c)
    .filter((t) => region.towns.includes(t) && !inCluster.includes(t) && t !== town);

  return [...inCluster, ...rest].slice(0, NEARBY_COUNT);
};

// Build-time guard, not a runtime one: a town in locations.ts that nobody put
// in a cluster falls back to region order, which is the behaviour that
// produced the Ballina bug. Better to fail the build than to ship it again.
const clustered = new Set(clusters.flat());
const unclustered = regions.flatMap((r) => r.towns).filter((t) => !clustered.has(t));
if (unclustered.length > 0) {
  throw new Error(
    `townPages.ts: these towns are in locations.ts but not in any cluster, so their ` +
      `"nearby" list would fall back to region order: ${unclustered.join(', ')}. ` +
      `Add each one to the right cluster above.`,
  );
}
const strays = clusters.flat().filter((t) => !regions.some((r) => r.towns.includes(t)));
if (strays.length > 0) {
  throw new Error(
    `townPages.ts: these towns are in a cluster but not in locations.ts, so nothing ` +
      `links to them and their pages don't exist: ${strays.join(', ')}.`,
  );
}

// ── THE NEARBY LIST AND THE UNLINKED TOWNS ──────────────────────────────
// This used to filter `nearby` down to locations.ts' curated "visible" list,
// so that a town page's "nearby suburbs" band could not be the one remaining
// door into a town the menu and the hub had stopped naming. That whole
// mechanism is gone with the curated list: as of 18 Sep 2026 every band names
// every town, so there is no hidden set left to leak into, and each town page
// now gets its REAL neighbours — the ones a local would name — whether or not
// those neighbours' pages are live.
//
// Which of them are clickable is [town].astro's call, using the same
// `isNavigableTown` predicate as every other surface. So a Burleigh Heads
// reader sees Miami and Burleigh Waters named next door and can click through
// to the one that is live, rather than seeing a two-item list that pretends
// the others are not there.
//
// The result is always NEARBY_COUNT long now, because nearbyFor tops up from
// the region rather than from a filtered subset — which also retires the
// "stranded town with an empty band" guard that used to live here.

// Reuses locations.ts' own slug derivation rather than a second copy of the
// same rule — the whole point being that the mega-menu's hrefs and these
// pages' URLs can never disagree.
const slugOf = (town: string) => town.toLowerCase().replace(/\s+/g, '-');

export const townPages: TownPage[] = regions.flatMap((region) =>
  region.towns.map((town) => {
    const override = townOverrides[town] ?? {};
    // townHeroes wins; the region photo is the fallback for a town whose
    // scene has not been generated yet. `override.hero` still beats the
    // coastal/region guess, so a hand-set region photo keeps working.
    const heroKey = override.hero ?? (coastalTowns.has(town) ? 'coastal-home' : region.hero);
    return {
      town,
      slug: slugOf(town),
      region,
      nearby: override.nearby ?? nearbyFor(town, region),
      hero: townHeroes[town] ?? heroImages[heroKey],
      local: override.local ?? [],
      video: townFile.get(town)?.video,
    };
  }),
);

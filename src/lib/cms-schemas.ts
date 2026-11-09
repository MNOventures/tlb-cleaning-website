// Content schemas for the section components, used by pages through getPage()
// (src/lib/cms.ts). One schema per section, mirroring the matching entry under
// `components:` in .pages.yml. Change both together:
// scripts/check-cms-config.mjs checks every content file against .pages.yml,
// and cms-schemas.check.ts checks these schemas against the components' props.
//
// A schema covers CONTENT only: words, photos, alt text, links. Design props
// (variant, theme, tone, span, ratio, columns, highlight) stay in the page's
// .astro file, so an editor can change what a section says but not how it
// looks. Where a design prop sits on each item of a list (a cell's tone, a
// photo's ratio), the page adds it when it maps the items, e.g.
// `page.cards.cards.map((card) => ({ ...card, image: sized(card.image, '4/3') }))`.
//
// A page passes EVERY field of a section's content through to the component,
// even ones it does not currently fill in (`cta={page.faq.cta ?? quoteCta}`,
// `backgroundImage={page.intro.backgroundImage}`). Otherwise an editor fills
// in a field the editor offers and nothing happens.
//
// Not covered yet, because no page uses them: StatBand, TestimonialCarousel,
// Hero's `split-mosaic` images, badges, logo and stats. Add a schema here and a
// component in .pages.yml when a page first needs one.
//
// SiteHeader, SiteFooter, TrustBar and the review cards are site-wide content,
// edited once (PAGES-CMS-PLAN.md, Phase 2), not per page.
import type { ImageMetadata } from 'astro';
import { z } from 'astro/zod';
import type { TextBlockBody } from '../components/sections/TextBlock.astro';
import type { ServiceIconName } from '../components/ui/ServiceIcon.astro';
import { cmsImage, resolveTokens } from './cms';
import { loadData } from './cms-data';

// ---------------------------------------------------------- building blocks

/** Plain text, with {{tokens}} resolved. */
export const text = z.string().transform(resolveTokens);

/** An optional field. Pages CMS may save an emptied field as null or ''. */
export const optional = <T extends z.ZodTypeAny>(schema: T) =>
  z
    .union([schema, z.null(), z.literal('')])
    .optional()
    .transform((value) => (value === null || value === '' ? undefined : value) as z.output<T> | undefined);

/** A list of paragraphs. */
export const paragraphs = z.array(text).min(1);

/** A path Pages CMS wrote for a photo in src/assets, resolved to the image. */
const photoPath = z.string().startsWith('/src/assets/', 'Image must be inside src/assets').transform(cmsImage);

/** A photo plus its alt text. Comes out as { label, src }, the shape of an
 *  ImageBlock minus its ratio, which is layout: the page adds it with sized().
 *  `src` may be left empty to show the reserved-slot placeholder box. */
export const image = z
  .object({
    src: optional(photoPath),
    alt: z.string().min(1, 'Describe the photo (alt text)'),
  })
  .transform(({ src, alt }) => ({ label: alt, src }));

/** A photo that must be set, for slots that cannot fall back to the
 *  placeholder box (a Backdrop, for one, needs a real image). */
export const requiredImage = z
  .object({
    src: photoPath,
    alt: z.string().min(1, 'Describe the photo (alt text)'),
  })
  .transform(({ src, alt }) => ({ label: alt, src }));

/** A decorative background photo: no alt text, because the components that
 *  take one render it with alt="". */
export const backgroundPhoto = photoPath;

/** Give a CMS image the ratio its slot is laid out at. */
export function sized<T extends { label: string; src?: ImageMetadata }>(img: T, ratio: string) {
  return { ...img, ratio };
}

/** Mark one comparison-table column as highlighted, which is layout. */
export function highlightColumn<T extends { label: string }>(columns: T[], index: number) {
  return columns.map((column, i) => (i === index ? { ...column, highlight: true } : column));
}

// The caps are hard limits that sit above every title and description the
// site shipped with (longest: 80 and 197 characters). The lengths Google
// actually shows, about 60 and 155, are guidance in .pages.yml, not errors,
// because 60 titles and 74 descriptions were already past them when this
// was written and an editor must still be able to save those pages.
export const seo = z.object({
  title: z.string().min(1).max(90, 'Keep the page title under 90 characters (aim for 60)'),
  description: z.string().min(1).max(200, 'Keep the meta description under 200 characters (aim for 155)'),
});

// Editors can type `quote` or `book` as a link to mean "wherever the site-wide
// quote (or booking) button goes" (Site settings > Site-wide buttons). Content
// that used to be built from quoteCta.href uses `quote`, so it still follows
// that button if its address changes. Read straight from the YAML rather than
// from src/data/navigation.ts, which would make an import cycle through
// townPages.ts.
const siteButtons = loadData(
  'site/buttons',
  z.object({ quote: z.object({ href: z.string() }), book: z.object({ href: z.string() }) }).passthrough(),
);
const SITE_LINKS: Record<string, string> = { quote: siteButtons.quote.href, book: siteButtons.book.href };

/** A link, with the `quote` and `book` keywords resolved. */
export const linkTarget = z.string().transform((value) => SITE_LINKS[value.trim()] ?? value);

const href = linkTarget.pipe(
  z.string().regex(/^(\/|https:\/\/|tel:|mailto:|#)/, 'Links start with /, https://, tel:, mailto: or #, or are quote or book'),
);

/** A link to a page: on this site, or another site. Keywords resolved. */
export const pageHref = linkTarget.pipe(z.string().regex(/^(\/|https:\/\/)/, 'Links start with / or https://, or are quote or book'));

/** A button or text link: what it says and where it goes. */
export const link = z.object({ label: text, href });

/** TextBlock's body: paragraphs, bullet lists and subheadings in any order.
 *  Stored as Pages CMS blocks (blockKey `type`), mapped back to TextBlockBody. */
export const textBody = z
  .array(
    z.discriminatedUnion('type', [
      z.object({ type: z.literal('paragraph'), text }),
      z.object({ type: z.literal('list'), items: z.array(text).min(1), ordered: optional(z.boolean()) }),
      z.object({ type: z.literal('subheading'), text }),
    ]),
  )
  .min(1)
  .transform((items) =>
    items.map((item): TextBlockBody => {
      if (item.type === 'paragraph') return item.text;
      if (item.type === 'subheading') return { subheading: item.text };
      return item.ordered ? { list: item.items, ordered: true } : { list: item.items };
    }),
  );

const SERVICE_ICONS = [
  'idea',
  'spark',
  'bloom',
  'puzzle',
  'target',
  'chart-pie',
  'chart-bars',
  'house',
  'suitcase',
  'key',
  'spray-bottle',
  'office',
] as const satisfies readonly ServiceIconName[];
export const serviceIcon = z.enum(SERVICE_ICONS);

/** A comparison table cell. Editors type "yes" for a tick and "no" for a
 *  cross; anything else is shown as written, and a cell in quotation marks
 *  shows its words without the quotes (so "No" can be text). Content files use yes/no too.
 *  "true"/"false" and real booleans are accepted as well, because a text
 *  field in Pages CMS may hand a boolean back as the string "true". */
const comparisonCell = z.union([
  z.boolean(),
  z.string().transform((value): boolean | string => {
    // In quotation marks, the word itself: "No" shows the text No, not a cross.
    const quoted = /^["“](.*)["”]$/.exec(value.trim());
    if (quoted) return resolveTokens(quoted[1]);
    const v = value.trim().toLowerCase();
    if (v === 'yes' || v === 'true') return true;
    if (v === 'no' || v === 'false') return false;
    return resolveTokens(value);
  }),
]);

// ---------------------------------------------------------------- sections

/** A section whose only editable content is its heading (its items come from
 *  site data, e.g. the review slider). */
export const sectionHeading = z.object({
  heading: text,
});

/** A section heading and lead whose items come from code or site data. */
export const sectionIntro = z.object({
  heading: text,
  lead: optional(text),
});

export const hero = z.object({
  kicker: optional(text),
  headingLines: z.array(text).min(1),
  subheading: optional(text),
  lead: text,
  /** Empty on the `minimal` variant, which has no photo. */
  image: optional(image),
  /** Leave out to use the page's default button (usually the site-wide quote button). */
  cta: optional(link),
});

/** Hero, `split-collage` variant. */
export const heroCollage = hero.omit({ image: true }).extend({
  collageImages: z.array(image).min(1),
});

export const textBlock = z.object({
  heading: optional(text),
  body: textBody,
  cta: optional(link),
  backgroundImage: optional(backgroundPhoto),
});

export const pathwayCards = z.object({
  heading: text,
  headingAccent: text,
  cards: z
    .array(
      z.object({
        image,
        title: text,
        description: text,
        cta: link,
      }),
    )
    .min(1),
});

/** ServiceBlocks `list` variant: a title, a sentence and a link per row. */
export const linkList = z.object({
  heading: text,
  lead: optional(text),
  note: optional(text),
  items: z
    .array(
      z.object({
        title: text,
        description: text,
        href: pageHref,
      }),
    )
    .min(1),
});

/** ServiceBlocks `icon-grid` variant: what that variant shows, and nothing it
 *  ignores (it has no note and no per-item button or link). */
export const iconGrid = z.object({
  heading: text,
  lead: optional(text),
  items: z
    .array(
      z.object({
        icon: optional(serviceIcon),
        tag: optional(text),
        title: text,
        description: text,
      }),
    )
    .min(1),
  /** The button under the grid. Leave out to use the page's default. */
  cta: optional(link),
});

/** ServiceBlocks with a photo per item: `image-cards`, `highlight`, `slider`
 *  and `photo-tiles`. No note: only the `list` variant shows one. */
export const imageCards = z.object({
  heading: text,
  lead: optional(text),
  tileCtaLabel: optional(text),
  items: z
    .array(
      z.object({
        image: optional(image),
        tag: optional(text),
        title: text,
        description: text,
        cta: optional(link),
        href: optional(href),
      }),
    )
    .min(1),
});

/** PhotoGallery, `story` variant. */
export const storySteps = z.object({
  heading: optional(text),
  lead: optional(text),
  steps: z
    .array(
      z.object({
        step: optional(text),
        heading: text,
        body: paragraphs,
        image,
      }),
    )
    .min(1),
});

/** PhotoGallery, `grid` and `filmstrip` variants. */
export const photoGallery = z.object({
  heading: optional(text),
  lead: optional(text),
  images: z.array(z.object({ image, caption: optional(text) })).min(1),
});

/** ContentGrid made of text cells only. */
export const textGrid = z.object({
  heading: optional(text),
  lead: optional(text),
  items: z.array(z.object({ heading: optional(text), body: paragraphs })).min(1),
});

/** ContentGrid with mixed cells. Stored as Pages CMS blocks (blockKey `type`).
 *  Each cell's tone and span are layout, added by the page. */
export const contentGrid = z.object({
  heading: optional(text),
  lead: optional(text),
  items: z
    .array(
      z.discriminatedUnion('type', [
        z.object({ type: z.literal('text'), heading: optional(text), body: paragraphs }),
        z.object({ type: z.literal('feature'), icon: serviceIcon, heading: text, body: paragraphs }),
        z.object({ type: z.literal('image'), image }),
      ]),
    )
    .min(1),
});

export const comparisonTable = z.object({
  heading: optional(text),
  lead: optional(text),
  cornerLabel: optional(text),
  /** Which column is highlighted is layout, set by the page. */
  columns: z.array(z.object({ label: text })).min(1),
  rows: z
    .array(
      z.object({
        label: text,
        description: optional(text),
        values: z.array(comparisonCell).min(1),
      }),
    )
    .min(1),
  footnote: optional(text),
  cta: optional(link),
});

export const beforeAfter = z.object({
  heading: optional(text),
  lead: optional(text),
  note: optional(text),
  beforeLabel: optional(text),
  afterLabel: optional(text),
  pairs: z
    .array(
      z.object({
        // BeforeAfter takes { src, alt } rather than an ImageBlock's { src, label }.
        before: z.object({ src: photoPath, alt: z.string().min(1, 'Describe the photo (alt text)') }),
        after: z.object({ src: photoPath, alt: z.string().min(1, 'Describe the photo (alt text)') }),
        caption: optional(text),
        /** Where the slider starts, 0 to 100. Tune it to the photos. */
        start: optional(z.number().min(0).max(100)),
        /** The photos' shape, e.g. 4/3 or 3/4 for portrait. */
        ratio: optional(z.string().regex(/^\d+\/\d+$/, 'A ratio like 4/3')),
      }),
    )
    .min(1),
});

/** StoryMosaic: text and photo cells in a mosaic. Blocks with key `type`. */
export const storyMosaic = z.object({
  heading: optional(text),
  blocks: z
    .array(
      z.discriminatedUnion('type', [
        z.object({ type: z.literal('text'), body: paragraphs }),
        z.object({ type: z.literal('image'), image }),
      ]),
    )
    .min(1),
  cta: optional(link),
});

export const imageBand = z.object({
  image,
  caption: optional(text),
});

/** TagCloud. Town groups come from site data; `tags` is for a page's own
 *  short list of links (related guides, related services). */
export const tagCloud = z.object({
  heading: text,
  subheading: text,
  tags: optional(z.array(z.object({ label: text, href: optional(href) }))),
  note: paragraphs,
});

export const faq = z.object({
  heading: optional(text),
  lead: optional(text),
  items: z.array(z.object({ question: text, answer: text })).min(1),
});

export const callout = z.object({
  heading: optional(text),
  body: paragraphs,
  cta: optional(link),
});

export const callToAction = z.object({
  kicker: optional(text),
  heading: text,
  lead: optional(text),
  /** Leave out to use the page's default button. */
  cta: optional(link),
});

/** VideoFeature: a portrait YouTube video beside a heading. Hidden until a
 *  YouTube link is filled in, so pages with an empty slot show nothing. */
export const videoFeature = z.object({
  headingLines: z.array(text).min(1),
  lead: optional(text),
  video: z.object({ label: text, caption: optional(text), src: optional(text) }),
});

/** ContactForm's wording. Phone, email and the form's fields are site-wide. */
export const contactForm = z.object({
  kicker: optional(text),
  heading: optional(text),
  lead: optional(text),
  /** Show no intro sentence at all (an empty `lead` means the site-wide one). */
  hideLead: optional(z.boolean()),
});

export const cardCarousel = z.object({
  heading: optional(text),
  lead: optional(text),
  cards: z
    .array(z.object({ image: optional(image), heading: optional(text), body: optional(paragraphs) }))
    .min(1),
});

export const metricsBlock = z.object({
  heading: optional(text),
  lead: optional(text),
  metrics: z.array(z.object({ value: text, caption: text })).min(1),
  image: optional(image),
});

export const logoBar = z.object({
  heading: optional(text),
  lead: optional(text),
  logos: z
    .array(
      z.object({
        logo: image,
        quote: optional(text),
        company: optional(text),
        tag: optional(text),
      }),
    )
    .min(1),
  featuredQuote: optional(
    z.object({
      rating: z.number().min(1).max(5),
      body: text,
      attribution: text,
    }),
  ),
});

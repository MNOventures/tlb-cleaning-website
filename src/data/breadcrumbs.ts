// The breadcrumb trail above every page's H1 (Breadcrumbs.astro, rendered by
// Hero.astro and by ContactForm.astro when it carries the page's H1).
//
// The trail is worked out from the URL, one crumb per path segment, so a page
// never passes its own. Each crumb's LABEL comes from the navigation menu,
// word for word (`menuLabels` in navigation.ts, edited in Pages CMS under
// "Navigation"), never from the URL: /house-cleaning/ reads "Home Cleaning"
// because that is what the menu calls it. Rename a menu item and its crumb
// follows on the next publish.
//
// `notInMenu` is only for pages no menu links. A page in neither fails the
// build, so a new page cannot ship with a blank crumb.
import { menuLabels } from './navigation';
import { allTowns, townSlug } from './locations';

export interface Crumb {
  label: string;
  href: string;
}

const notInMenu = new Map<string, string>([
  ['/thank-you/', 'Thank you'],
  // Not approved yet, so in no menu (see local-care.astro). Remove once it is.
  ['/local-care/', 'TLB Local Care'],
  // Towns not yet live in the menu still have a page; their crumb is the name.
  ...allTowns.map((town): [string, string] => [townSlug(town), town]),
]);

// No trail on the homepage (it would be "Home" on its own) or on the 404 page,
// whose URL is whatever was mistyped, so there is no path to show.
const NO_TRAIL = new Set(['/', '/404/']);

/** Home, then one crumb per path segment, ending with the current page. */
export function breadcrumbTrail(pathname: string): Crumb[] {
  const path = pathname.replace(/\/?$/, '/');
  if (NO_TRAIL.has(path)) return [];

  const segments = path.split('/').filter(Boolean);
  return [
    { label: menuLabels.get('/') ?? 'Home', href: '/' },
    ...segments.map((_, i) => {
      const href = `/${segments.slice(0, i + 1).join('/')}/`;
      const label = menuLabels.get(href) ?? notInMenu.get(href);
      if (!label) {
        throw new Error(`breadcrumbs.ts: ${href} is in no navigation menu, so it has no breadcrumb label. Add it to notInMenu.`);
      }
      return { label, href };
    }),
  ];
}

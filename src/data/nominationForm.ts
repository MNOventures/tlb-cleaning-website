// The TLB Local Care nomination form's wiring: its endpoint and the fields it
// submits. NominationForm.astro reads this; the page's words (heading, button,
// messages) live in src/content/pages/local-care.yaml with the rest of that
// page's copy.
//
// Same rule as contactForm.ts, for the same reason: THE FORM MUST NEVER REPORT
// SUCCESS IT DID NOT GET. A nomination is someone telling us about a neighbour
// who is struggling; a thank-you for a nomination that went nowhere is worse
// than no form. `nominationEndpoint` is empty until a real webhook is set, the
// build says so, and the form refuses to submit rather than thank anyone.
//
// A SEPARATE ENDPOINT FROM THE ENQUIRY FORM, on purpose. Nominations are not
// leads and must not land in the enquiry board, where they would be quoted,
// chased or counted as conversions. Point this at its own Zapier catch hook
// and its own Monday.com board. NOMINATION-FORM-SETUP.md has the steps and
// the field-by-field mapping.

/**
 * The webhook the browser POSTs nominations to. Set
 * PUBLIC_NOMINATION_WEBHOOK_URL in the host's build environment (Render, the
 * static site, Environment). PUBLIC_ for the reason contactForm.ts gives: it is
 * inlined into the page and visible in view-source, which is fine for a catch
 * hook and never fine for an API token.
 */
export const nominationEndpoint: string = import.meta.env.PUBLIC_NOMINATION_WEBHOOK_URL ?? '';

console.log(
  nominationEndpoint
    ? '[FORM] nomination form endpoint: CONFIGURED'
    : '[FORM] nomination form endpoint: NOT SET (PUBLIC_NOMINATION_WEBHOOK_URL), the form renders but refuses to submit',
);

/**
 * Every field the form submits, so the markup and the Zapier mapping have one
 * list to agree on. The eight reader-facing fields are the ones in the Local
 * Care copy doc, in its order. Every key is sent on every submission (an
 * unticked box as an empty string), so the mapping never breaks on a missing
 * field.
 */
export const nominationFields = [
  'yourName',
  'yourPhone',
  'yourEmail',
  'nomineeName',
  'nomineeTown',
  'whyTheyNeedAHand',
  // "Yes" or "No".
  'nomineeKnows',
  // "Yes" or "" (unticked).
  'happyToBeContacted',
  // Context the reader does not type.
  'sourcePage',
  'submittedAt',
] as const;

export type NominationField = (typeof nominationFields)[number];

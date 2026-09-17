/* Storefront-only image resolver.
   Maps a sweet / namkeen name (product or category) to a representative photo
   on Wikimedia Commons. Special:FilePath 302-redirects to the correctly-hashed
   thumbnail, so we never hardcode a CDN path. Every filename below was verified
   to resolve (HTTP 200). Ordered most-specific → generic; falls back to a
   generic mithai platter so a tile is never image-less.

   Used by the customer storefront only (HomePage, ProductCard). Not referenced
   by pages/admin/*. */

export const WM = (file: string, w = 500): string =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${file}?width=${w}`;

const RULES: [RegExp, string][] = [
  // ── milk & mithai ──
  [/bengali|rosogolla|rasgulla|rasmalai|sandesh/,        'Rasmalai.jpg'],
  [/basundi/,                                            'Basundi.jpg'],
  [/shrikhand|a?amrakhand/,                              'Shrikhand.JPG'],
  [/kalakand/,                                           'Kalakand.jpg'],
  [/kaju|katli|katri/,                                   'Kaju_barfi.jpg'],
  [/coconut|nariyal|kopra/,                              'Coconut_barfi.jpg'],
  [/gulab|jamun/,                                        'Gulab_jamun.jpg'],
  [/peda/,                                               'Kesar_Peda.jpg'],
  [/soan|sohan/,                                         'Soan_Papdi.jpg'],
  [/pinni/,                                              'Pinni.jpg'],
  [/motichoor|ladoo|laddu|ladu/,                         'Motichoor_Laddu.jpg'],
  [/balushahi/,                                          'Balushahi.jpg'],
  [/imarti|jalebi|jilebi/,                               'Jalebi.jpg'],
  [/barfi|burfi/,                                        'Burfi.jpg'],
  [/halwa|halva/,                                        'Gajar_ka_Halwa.jpg'],
  [/modak/,                                              'Ukadiche_Modak.jpg'],
  [/baklava/,                                            'Baklava.jpg'],
  // ── dry fruits ──
  [/dry\s*fruit|dryfruit|badam|anjeer|pista|kishmish|\bnuts?\b/, 'Dryfruits.jpg'],
  // ── bakery ──
  [/khakhra/,                                            'Khakhra.JPG'],
  [/nankhatai|nan\s*khatai|cookie|biscuit|bakery|khari|toast|rusk/, 'Nankhatai.jpg'],
  // ── farsan / namkeen / savoury ──
  [/chakli|chakri|murukku|chorafali/,                    'Chakli.jpg'],
  [/salli|ganthiya|gathiya|bhujia|fafda|papdi|mathri|mathiya/, 'Bhujia.jpg'],
  [/\bsev\b/,                                            'Sev.jpg'],
  [/chikki|gajak|crunch/,                                'Chikki.jpg'],
  [/chi[vw]da|chevda|poha|farali|sabudana|upvas|vrat/,   'Namkeen.jpg'],
  [/pattice|patties|tikki|\bvada\b|bhalla|bhalle|samosa|kachori|cutlet|wafer|chips|khaman|dhokla|thepla|dahi/, 'Namkeen.jpg'],
  [/namkeen|farsan|snack|mixture|masala|chana|moong|peanut|\bsing\b/, 'Namkeen.jpg'],
  // ── sweets catch-alls ──
  [/petha|sugar\s*free|sugarfree/,                       'Mithai.jpg'],
];

/** Resolve a photo URL for any sweet/namkeen name. Never returns empty. */
export function sweetImage(text: string, w = 500): string {
  const hay = (text || '').toLowerCase();
  for (const [re, file] of RULES) if (re.test(hay)) return WM(file, w);
  return WM('Mithai.jpg', w);
}

/**
 * utils/query-expansion.ts
 *
 * Query expansion for BGE-M3 + Tagalog/Taglish barangay blotter search.
 *
 * WHY THIS MATTERS WITH BGE-M3:
 * ─────────────────────────────────────────────────────────────────────
 * Even though BGE-M3 understands Tagalog, a short raw query like "away"
 * or "rape" still sits far from a long stored passage in embedding space.
 * Expanding the query with bilingual synonyms and barangay-specific
 * phrasing closes that gap significantly.
 *
 * Each function adds:
 *   1. The raw query as-is
 *   2. English equivalents (passages may mix both)
 *   3. Tagalog/Taglish equivalents (common in actual blotter complaints)
 *   4. Barangay-context anchors (matches renderBlotterForEmbedding structure)
 */

// ─── General / concept search ─────────────────────────────────────────────────

/**
 * Expand a general crime/incident keyword in English or Tagalog.
 *
 * @example expandQuery("rape")
 * @example expandQuery("pangagahasa")
 * @example expandQuery("away")
 * @example expandQuery("droga")
 */
export function expandQuery(rawQuery: string): string {
  const q = rawQuery.trim();
  if (!q) return q;

  return [
    q,
    // English barangay context anchors
    `barangay blotter complaint about ${q}`,
    `incident report involving ${q}`,
    `offense category ${q}`,
    // Tagalog barangay context anchors
    `reklamo sa barangay tungkol sa ${q}`,
    `insidente na may kinalaman sa ${q}`,
    `kaso ng ${q} sa barangay`,
  ].join(". ");
}

// ─── Crime-type aliases (Tagalog ↔ English) ───────────────────────────────────

/**
 * Expand a crime/offense term with bilingual synonyms so that
 * "pangagahasa" matches passages written as "rape" and vice versa.
 *
 * Add more alias pairs here as your blotter data grows.
 */
const CRIME_ALIASES: Record<string, string[]> = {
  // Sexual offenses
  rape:           ["pangagahasa", "sexual assault", "pag-rape", "gahasain"],
  pangagahasa:    ["rape", "sexual assault", "pag-rape", "gahasain"],

  // Physical violence
  "physical injury":  ["pisikal na pinsala", "pagmamaltrato", "pagsasalakay", "mauled", "pinalo", "sinuntok"],
  away:               ["altercation", "physical fight", "pagaway", "nag-away", "away-bati", "gulo"],
  mauled:             ["pinagsamantalahan", "pinalo", "physical injury", "away"],

  // Theft / property
  theft:          ["pagnanakaw", "nanakaw", "nagnakaw", "stolen", "nakaw"],
  pagnanakaw:     ["theft", "robbery", "stolen", "nakaw", "nagnakaw"],
  robbery:        ["holdap", "hold-up", "pagnanakaw", "armadong pagnanakaw"],

  // Drugs
  droga:          ["drugs", "illegal drugs", "shabu", "drug related", "drug use", "drug pushing"],
  drugs:          ["droga", "shabu", "illegal drugs", "drug related", "substance abuse"],
  shabu:          ["droga", "drugs", "methamphetamine", "illegal drugs"],

  // Threats / harassment
  threat:         ["banta", "pananakot", "threatening", "tinakot", "harassment"],
  banta:          ["threat", "pananakot", "threatening", "tinakot"],
  harassment:     ["pangharasment", "pag-aabuso", "pananakot", "banta"],

  // Trespassing / disturbance
  trespassing:    ["paglabag", "pagpasok nang walang pahintulot", "illegal entry"],
  "oral defamation": ["panlalait", "pang-iinsulto", "mura", "sinabihan ng masama"],
  mura:           ["oral defamation", "panlalait", "cursing", "pang-iinsulto"],
};

/**
 * Expand a crime keyword with its bilingual aliases.
 * Falls back to expandQuery if no alias entry exists.
 */
export function expandCrimeQuery(rawQuery: string): string {
  const q = rawQuery.trim().toLowerCase();
  const aliases = CRIME_ALIASES[q] ?? [];

  const terms = [rawQuery, ...aliases];

  return [
    ...terms,
    `barangay blotter complaint about ${rawQuery}`,
    `kaso ng ${rawQuery} sa barangay`,
    `offense category ${rawQuery}`,
  ].join(". ");
}

// ─── Person search ────────────────────────────────────────────────────────────

/**
 * NOTE: Person names should ideally be searched via exact DB filtering,
 * not vector search. This function exists as a fallback for cases where
 * name filtering is combined with semantic context.
 */
export function expandPersonQuery(name: string): string {
  const n = name.trim();
  return [
    n,
    `complainant ${n}`,
    `accused ${n}`,
    `respondent ${n}`,
    `barangay blotter involving ${n}`,
    // Tagalog
    `nagreklamo si ${n}`,
    `nasangkot si ${n}`,
    `inirereklamo si ${n}`,
  ].join(". ");
}

// ─── Location search ──────────────────────────────────────────────────────────

export function expandLocationQuery(location: string): string {
  const l = location.trim();
  return [
    l,
    `incident at ${l}`,
    `barangay blotter in ${l}`,
    `complaint filed in ${l}`,
    // Tagalog
    `nangyari sa ${l}`,
    `insidente sa ${l}`,
    `lugar ng insidente ${l}`,
  ].join(". ");
}

// ─── Smart expand (auto-detect and apply best expansion) ─────────────────────

/**
 * Automatically picks the best expansion strategy based on the query and mode.
 * Use this as the single entry point in your controller.
 *
 * @example
 * smartExpand("pangagahasa", "general") → crime alias expansion
 * smartExpand("Juan dela Cruz", "person") → person expansion
 * smartExpand("Sitio Maligaya", "location") → location expansion
 */
export function smartExpand(
  rawQuery: string,
  mode: "general" | "person" | "location" = "general"
): string {
  const q = rawQuery.trim().toLowerCase();

  if (mode === "person")   return expandPersonQuery(rawQuery);
  if (mode === "location") return expandLocationQuery(rawQuery);

  // General mode: use crime aliases if available, else generic expansion
  const hasCrimeAlias = Object.prototype.hasOwnProperty.call(CRIME_ALIASES, q);
  return hasCrimeAlias ? expandCrimeQuery(rawQuery) : expandQuery(rawQuery);
}
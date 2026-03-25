const insensitive = "insensitive" as const;
const like = (field: string, term: string, mode = true) =>
  ({ [field]: { contains: term, ...(mode && { mode: insensitive }) } });
const tagLike = (term: string) =>
  ({ tags: { some: { tag: { name: { contains: term, mode: insensitive } } } } });

// ── Core builder ──────────────────────────────────────────────

/**
 * Build Prisma WHERE conditions from a search string with multi-word support.
 * Multi-word: AND of terms, each term OR'd across fields (cross-field matching).
 * Single-word: OR across fields.
 */
export function buildSearchConditions(
  search: string,
  multiWordFields: (term: string) => any[],
  singleWordFields?: (search: string) => any[],
): any | null {
  const trimmed = search.trim();
  if (!trimmed) return null;

  const terms = trimmed.split(/\s+/);

  if (terms.length > 1) {
    return {
      AND: terms.map((term) => ({
        OR: multiWordFields(term),
      })),
    };
  }

  return {
    OR: (singleWordFields ?? multiWordFields)(trimmed),
  };
}

// ── Entity scopes ─────────────────────────────────────────────

export const scopes = {
  /** Customer full-text search + optional letter filter */
  customer(search: string, letter?: string): any {
    const conditions: any[] = [];

    if (search) {
      const condition = buildSearchConditions(
        search,
        (term) => [
          like("name", term),
          like("surname", term),
          like("notes", term),
          tagLike(term),
        ],
        (term) => [
          like("name", term),
          like("surname", term),
          like("phone", term, false),
          like("phone2", term, false),
          like("email", term),
          like("fiscalCode", term),
          like("notes", term),
          tagLike(term),
        ],
      );
      if (condition) conditions.push(condition);
    }

    if (letter) {
      conditions.push({ surname: { startsWith: letter, mode: insensitive } });
    }

    return conditions.length > 0 ? { AND: conditions } : {};
  },

  /** FileGroup search across label + customer name/surname */
  fileGroup(search: string): any {
    if (!search) return {};
    return buildSearchConditions(search, (term) => [
      like("label", term),
      { customer: like("name", term) },
      { customer: like("surname", term) },
    ]) ?? {};
  },
};

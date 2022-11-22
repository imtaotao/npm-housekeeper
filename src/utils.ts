const cache = new Map();
const hasIntl = typeof Intl === "object" && !!Intl;
const Collator = hasIntl && Intl.Collator;

const collatorCompare = (locale: string, opts?: Intl.CollatorOptions) => {
  const collator = new (Collator as any)(locale, opts);
  return (a: string, b: string) => collator.compare(a, b);
};

const localeCompare =
  (locale: string, opts?: Intl.CollatorOptions) => (a: string, b: string) => {
    return a.localeCompare(b, locale, opts);
  };

export function stringLocaleCompare(
  locale: string,
  opts?: Intl.CollatorOptions
) {
  if (!locale || typeof locale !== "string") {
    throw new TypeError("locale required");
  }
  const key = `${locale}\n${JSON.stringify(opts)}`;
  if (cache.has(key)) {
    return cache.get(key);
  }
  const compare = hasIntl
    ? collatorCompare(locale, opts)
    : localeCompare(locale, opts);
  cache.set(key, compare);
  return compare;
}

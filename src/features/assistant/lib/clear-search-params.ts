export function omitSearchParams(current: { toString(): string }, keys: string[]): string {
  const next = new URLSearchParams(current.toString());
  for (const key of keys) next.delete(key);
  return next.toString();
}

export function replaceWithoutSearchParams(
  router: { replace: (href: string, options?: { scroll?: boolean }) => void },
  pathname: string,
  current: { toString(): string },
  keys: string[]
) {
  const query = omitSearchParams(current, keys);
  router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
}

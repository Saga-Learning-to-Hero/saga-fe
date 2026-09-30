/**
 * Chỉ nhận URL hồ sơ http/https. null, rỗng, hoặc scheme khác đều thành undefined (fallback initials).
 */
export function resolveHttpAvatarUrl(
  ...candidates: Array<string | null | undefined>
): string | undefined {
  for (const value of candidates) {
    const trimmed = value?.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
  }
  return undefined;
}

export function toNullableHttpAvatarUrl(
  ...candidates: Array<string | null | undefined>
): string | null {
  return resolveHttpAvatarUrl(...candidates) ?? null;
}

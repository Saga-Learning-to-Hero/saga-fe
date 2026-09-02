import type { Role } from '@/types/auth';

export const SHARED_AUTHENTICATED_ROUTES = [
  '/profile',
  '/settings',
  '/dashboard',
] as const;

export function isSharedRoute(pathname: string): boolean {
  return SHARED_AUTHENTICATED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function getRoleHomePath(role: Role): string {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'LECTURER':
      return '/lecturer/courses';
    case 'STUDENT':
      return '/student/courses';
  }
}

export function isPathAllowedForRole(pathname: string, role: Role): boolean {
  if (isSharedRoute(pathname)) {
    return true;
  }
  const prefix = `/${role.toLowerCase()}`;
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function getSafeRedirectUrl(nextUrl: string | null | undefined, role: Role): string {
  if (!nextUrl) {
    return getRoleHomePath(role);
  }

  if (!nextUrl.startsWith('/') || nextUrl.startsWith('//') || nextUrl.startsWith('/\\')) {
    return getRoleHomePath(role);
  }

  const sanitizedUrl = nextUrl.split('?')[0];
  if (sanitizedUrl.includes(':')) {
    return getRoleHomePath(role);
  }

  if (isPathAllowedForRole(sanitizedUrl, role)) {
    return nextUrl;
  }

  return getRoleHomePath(role);
}


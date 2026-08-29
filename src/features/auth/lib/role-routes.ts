import type { Role } from '@/types/auth';

/**
 * Maps each role to its home route.
 * Use this everywhere redirect-after-login logic is needed so the mapping
 * stays in one place.
 */
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

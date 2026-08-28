import type { User } from '@/types/auth';

export const MOCK_USERS: Record<'ADMIN' | 'LECTURER' | 'STUDENT', User> = {
  ADMIN: {
    id: 'mock-admin-001',
    name: 'Trần Minh Khoa',
    email: 'admin@saga.edu.vn',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=saga-admin',
    role: 'ADMIN',
  },
  LECTURER: {
    id: 'mock-lecturer-002',
    name: 'Nguyễn Mạnh Cường',
    email: 'cuong.nm@fe.edu.vn',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=saga-lecturer',
    role: 'LECTURER',
  },
  STUDENT: {
    id: 'mock-student-003',
    name: 'Lê Hoàng Hải',
    email: 'hailh@student.fe.edu.vn',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=saga-student',
    role: 'STUDENT',
  },
};

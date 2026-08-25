export type Role = 'ADMIN' | 'LECTURER' | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
}

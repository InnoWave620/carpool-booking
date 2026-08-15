import { Employee, Role } from '@/types';
import { INITIAL_EMPLOYEES } from './store';

export const CURRENT_USER_KEY = 'agl_current_user_id';

export function getActiveUser(): Employee {
  if (typeof window === 'undefined') {
    return INITIAL_EMPLOYEES[0]; // Default Super Admin for SSR
  }
  
  const savedId = localStorage.getItem(CURRENT_USER_KEY);
  if (!savedId) {
    return INITIAL_EMPLOYEES[0];
  }

  const found = INITIAL_EMPLOYEES.find(e => e.id === savedId);
  return found || INITIAL_EMPLOYEES[0];
}

export function setActiveUser(employeeId: string): Employee {
  const found = INITIAL_EMPLOYEES.find(e => e.id === employeeId);
  if (found && typeof window !== 'undefined') {
    localStorage.setItem(CURRENT_USER_KEY, employeeId);
  }
  return found || INITIAL_EMPLOYEES[0];
}

export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  const hierarchy: Record<Role, number> = {
    EMPLOYEE: 1,
    DRIVER: 2,
    MANAGER: 3,
    FLEET_ADMIN: 4,
    SUPER_ADMIN: 5,
  };

  return hierarchy[userRole] >= hierarchy[requiredRole];
}

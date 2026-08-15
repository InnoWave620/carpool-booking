import { TripStatus } from '@/types';

// Controlled State Machine for Bus Trips
// Allowed transitions:
// SCHEDULED ➔ AWAITING_DRIVER_CONFIRMATION ➔ BOARDING ➔ EN_ROUTE ➔ ARRIVED ➔ EMPTYING ➔ COMPLETED
// SCHEDULED | AWAITING_DRIVER_CONFIRMATION | BOARDING ➔ CANCELLED

const VALID_TRANSITIONS: Record<string, string[]> = {
  SCHEDULED: ['AWAITING_DRIVER_CONFIRMATION', 'BOARDING', 'CANCELLED'],
  AWAITING_DRIVER_CONFIRMATION: ['BOARDING', 'SCHEDULED', 'CANCELLED'],
  BOARDING: ['EN_ROUTE', 'CANCELLED'],
  EN_ROUTE: ['ARRIVED'],
  ARRIVED: ['EMPTYING'],
  EMPTYING: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

export function canTransitionTripStatus(currentStatus: string, newStatus: string): boolean {
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  return allowed.includes(newStatus);
}

export function getNextAllowedStatuses(currentStatus: string): string[] {
  return VALID_TRANSITIONS[currentStatus] || [];
}

export function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'SCHEDULED':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'AWAITING_DRIVER_CONFIRMATION':
      return 'bg-[#EED58E]/30 text-amber-900 border-amber-300';
    case 'BOARDING':
      return 'bg-amber-500 text-white font-extrabold animate-pulse';
    case 'EN_ROUTE':
      return 'bg-teal-600 text-white font-extrabold';
    case 'ARRIVED':
      return 'bg-indigo-600 text-white font-extrabold';
    case 'EMPTYING':
      return 'bg-purple-600 text-white font-extrabold';
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'CANCELLED':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

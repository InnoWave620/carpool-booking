import { PoolVehicleRequest, Vehicle } from '@/types';

export function checkVehicleDateOverlap(
  vehicleId: string,
  startDateTime: string,
  endDateTime: string,
  existingRequests: PoolVehicleRequest[]
): { hasConflict: boolean; conflictingRequest?: PoolVehicleRequest } {
  const reqStart = new Date(startDateTime).getTime();
  const reqEnd = new Date(endDateTime).getTime();

  const conflict = existingRequests.find((r) => {
    if (r.vehicleId !== vehicleId) return false;
    if (r.status === 'REJECTED' || r.status === 'CANCELLED' || r.status === 'RETURNED') return false;

    const rStart = new Date(r.startDateTime).getTime();
    const rEnd = new Date(r.endDateTime).getTime();

    // Date range overlap formula: (StartA < EndB) AND (EndA > StartB)
    return reqStart < rEnd && reqEnd > rStart;
  });

  return {
    hasConflict: !!conflict,
    conflictingRequest: conflict,
  };
}

export function getVehicleStatusBadge(status: string): { label: string; badgeClass: string } {
  switch (status) {
    case 'AVAILABLE':
      return { label: 'Available', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    case 'RESERVED':
      return { label: 'Reserved / Booked', badgeClass: 'bg-blue-100 text-blue-800 border-blue-300' };
    case 'IN_USE':
      return { label: 'In Use', badgeClass: 'bg-amber-500 text-white font-extrabold' };
    case 'RETURNED':
    case 'INSPECTION_REQUIRED':
      return { label: 'Returned (Pending Inspection)', badgeClass: 'bg-purple-100 text-purple-800 border-purple-300 font-extrabold animate-pulse' };
    case 'UNDER_MAINTENANCE':
    case 'INSPECTION_FAILED':
      return { label: 'Under Maintenance', badgeClass: 'bg-rose-100 text-rose-800 border-rose-300' };
    case 'DECOMMISSIONED':
      return { label: 'Decommissioned', badgeClass: 'bg-slate-200 text-slate-600' };
    default:
      return { label: status, badgeClass: 'bg-slate-100 text-slate-700' };
  }
}

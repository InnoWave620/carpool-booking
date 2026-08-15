import { AuditEvent } from '@/types';
import { INITIAL_AUDIT_EVENTS } from './store';

export let auditEventsStore: AuditEvent[] = [...INITIAL_AUDIT_EVENTS];

export function logAuditEvent(params: {
  performerId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
}) {
  const newEvent: AuditEvent = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    performerId: params.performerId,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    metadata: params.metadata ? JSON.stringify(params.metadata) : undefined,
    ipAddress: '197.243.12.44',
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'Server / API Gateway',
    timestamp: new Date().toISOString(),
  };

  auditEventsStore.unshift(newEvent);
  return newEvent;
}

export function getAuditLogs(): AuditEvent[] {
  return auditEventsStore;
}

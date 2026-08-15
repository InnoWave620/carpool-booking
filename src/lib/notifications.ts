export interface NotificationMessage {
  id: string;
  recipientId: string;
  title: string;
  body: string;
  type: 'BUS_BOOKING' | 'DRIVER_APPROVAL' | 'POOL_REQUEST' | 'INSPECTION';
  read: boolean;
  createdAt: string;
}

export let notificationsStore: NotificationMessage[] = [
  {
    id: 'notif-1',
    recipientId: 'emp-driver-1',
    title: 'Pending Late Booking Approval',
    body: 'Selma Shikongo requested 4 seats for HQ -> WMT (08:00 shuttle). Requires driver approval.',
    type: 'DRIVER_APPROVAL',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notif-2',
    recipientId: 'emp-manager',
    title: 'Pool Vehicle Request',
    body: 'Petrus Haimbodi requested Toyota Hilux (N 882-102 WB) for Customs audit.',
    type: 'POOL_REQUEST',
    read: false,
    createdAt: new Date().toISOString(),
  },
];

export function sendNotification(message: Omit<NotificationMessage, 'id' | 'read' | 'createdAt'>) {
  const newNotif: NotificationMessage = {
    ...message,
    id: `notif-${Date.now()}`,
    read: false,
    createdAt: new Date().toISOString(),
  };

  notificationsStore.unshift(newNotif);
  return newNotif;
}

export function getUserNotifications(userId: string) {
  return notificationsStore.filter(n => n.recipientId === userId);
}

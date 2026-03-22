import { db } from "@/lib/db";
import type { NotificationType } from "@/generated/prisma/client";

type CreateNotificationInput = {
  recipientId: string;
  actorId?: string;
  type: NotificationType;
  title: string;
  body?: string;
  linkUrl?: string;
  resourceId?: string;
};

export async function createNotification(input: CreateNotificationInput) {
  // Don't notify yourself
  if (input.actorId && input.actorId === input.recipientId) return null;

  return db.notification.create({ data: input });
}

export async function createNotifications(inputs: CreateNotificationInput[]) {
  // Filter out self-notifications
  const filtered = inputs.filter(
    (n) => !n.actorId || n.actorId !== n.recipientId
  );
  if (filtered.length === 0) return [];

  return db.notification.createMany({ data: filtered });
}

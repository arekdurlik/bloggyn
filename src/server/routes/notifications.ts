import { SOCKET_EV } from '@/lib/constants';
import { getServerSocket } from '@/sockets/server-socket';
import { protectedProcedure, router } from '@/trpc';
import { TRPCError, type inferRouterOutputs } from '@trpc/server';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import { notifications } from '../db/schema';

export type NotificationsRouterOutput = inferRouterOutputs<typeof notificationsRouter>;

export enum NotificationType {
    LIKE = 'like',
    POST = 'post',
    FOLLOW = 'follow',
}

export enum NotificationTargetType {
    POST = 'post',
    USER = 'user',
}

const notificationTypeEnum = z.nativeEnum(NotificationType);
const notificationTargetTypeEnum = z.nativeEnum(NotificationTargetType);

const notificationSchema = z.object({
    fromId: z.string().min(1),
    toId: z.string().min(1),
    notificationType: notificationTypeEnum,
    targetType: notificationTargetTypeEnum,
    targetId: z.string().min(1),
});

export type Notification = z.infer<typeof notificationSchema>;

export const notificationsRouter = router({
    storeNotifications: protectedProcedure
        .input(z.array(notificationSchema))
        .mutation(async ({ input, ctx: { db } }) => {
            try {
                const notificationsToInsert = [];
                let isMain = false;

                for (const notification of input) {
                    if (notification.notificationType === NotificationType.LIKE) {
                        try {
                            // check if a main LIKE notification exists for the user/post combo
                            const [existingNotification] = await db
                                .select()
                                .from(notifications)
                                .where(
                                    and(
                                        eq(notifications.toId, notification.toId),
                                        eq(notifications.type, NotificationType.LIKE),
                                        eq(notifications.targetType, NotificationTargetType.POST),
                                        eq(notifications.targetId, notification.targetId),
                                        eq(notifications.isMain, true)
                                    )
                                )
                                .limit(1);

                            if (existingNotification) {
                                // increment moreCount
                                await db
                                    .update(notifications)
                                    .set({ moreCount: (existingNotification.moreCount || 0) + 1 })
                                    .where(eq(notifications.id, existingNotification.id));
                            } else {
                                isMain = true;
                            }
                            // accurate moreCount less important than storing a new notification
                        } catch {}
                    }

                    notificationsToInsert.push({
                        fromId: notification.fromId,
                        toId: notification.toId,
                        type: notification.notificationType,
                        targetType: notification.targetType,
                        targetId: notification.targetId,
                        isMain: isMain,
                    });
                }

                const newNotifications = await db
                    .insert(notifications)
                    .values(notificationsToInsert)
                    .returning();

                // notify users
                input.forEach(notification => {
                    getServerSocket().emit(SOCKET_EV.NOTIFY, notification.toId);
                });

                return newNotifications;
            } catch {
                throw new TRPCError({
                    message: 'Error storing notifications',
                    code: 'INTERNAL_SERVER_ERROR',
                });
            }
        }),
    getNotifications: protectedProcedure.query(async ({ ctx: { db, session } }) => {
        const userId = session.user.id;

        const result = await db
            .select({
                id: notifications.id,
                fromId: notifications.fromId,
                toId: notifications.toId,
                type: notifications.type,
                targetType: notifications.targetType,
                targetId: notifications.targetId,
                isMain: notifications.isMain,
                readAt: notifications.readAt,
                createdAt: notifications.createdAt,
                updatedAt: notifications.updatedAt,
                row_num:
                    sql<number>`ROW_NUMBER() OVER (PARTITION BY ${notifications.targetId} ORDER BY ${notifications.createdAt} DESC)`.as(
                        'row_num'
                    ),
                more_count:
                    sql<number>`COUNT(*) OVER (PARTITION BY ${notifications.targetId}) - 2`.as(
                        'more_count'
                    ),
            })
            .from(notifications)
            .where(eq(notifications.toId, userId))
            .orderBy(desc(notifications.createdAt))
            .limit(10);

        const enhancedNotifications = result
            .filter(notification => notification.row_num <= 2)
            .map(notification => ({
                ...notification,
                moreCount: notification.more_count,
            }));

        return enhancedNotifications;
    }),
    getUnreadCount: protectedProcedure.query(async ({ ctx: { db, session } }) => {
        const userId = session.user.id;

        const unreadCount = await db
            .select({
                count: sql<number>`COUNT(*)`,
            })
            .from(notifications)
            .where(and(eq(notifications.toId, userId), isNull(notifications.readAt)));

        return unreadCount[0]?.count ?? 0;
    }),
});

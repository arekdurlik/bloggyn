import { NotificationTargetType, NotificationType, SocketEvent } from '@/lib/constants';
import { ServerLogger } from '@/lib/log';
import { getServerSocket } from '@/sockets/server-socket';
import { protectedProcedure, router } from '@/trpc';
import { type inferRouterOutputs } from '@trpc/server';
import { and, asc, desc, eq, gte, inArray, lte, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db';
import { notifications, NotificationSchema, posts, users } from '../db/schema';
import { handleError } from '../utils';
export type NotificationsRouterOutput = inferRouterOutputs<typeof notificationsRouter>;

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

type LatestUsers = {
    userId: string;
    name: string | null;
    username: string | null;
    image: string | null;
    isFollowedBack?: boolean | null;
}[];
export type NotificationReturn = {
    id: number;
    fromId: string;
    toId: string;
    type: string;
    targetType: string;
    targetId: string;
    isMain: boolean;
    moreCount: number;
    read: boolean;
    readAt: string | null;
    createdAt: string;
    updatedAt: string;
    title: string | null;
    slug: string | null;
    from?: LatestUsers;
};

export type NotificationReturnWithUsers = NotificationReturn & {
    from: LatestUsers;
};

export const notificationsRouter = router({
    getNewestNotifications: protectedProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(50).nullish(),
                cursor: z
                    .object({
                        id: z.number(),
                        createdAt: z.string(),
                        updatedAt: z.string(),
                        read: z.boolean(),
                    })
                    .nullish(),
            })
        )
        .query(async ({ ctx: { db, session }, input }) => {
            const userId = session.user.id;
            const limit = input.limit ?? 10;
            const { cursor } = input;

            try {
                const query = db
                    .select({
                        id: notifications.id,
                        toId: notifications.toId,
                        type: notifications.type,
                        targetType: notifications.targetType,
                        targetId: notifications.targetId,
                        isMain: notifications.isMain,
                        moreCount: notifications.moreCount,
                        read: notifications.read,
                        createdAt: notifications.createdAt,
                        updatedAt: notifications.updatedAt,
                        title: posts.title,
                        slug: posts.slug,
                    })
                    .from(notifications)
                    .leftJoin(
                        posts,
                        and(
                            eq(sql`CAST(${posts.id} AS TEXT)`, notifications.targetId),
                            eq(notifications.targetType, NotificationTargetType.POST)
                        )
                    )
                    .where(
                        and(
                            eq(notifications.isMain, true),
                            eq(notifications.toId, userId),
                            cursor
                                ? and(
                                      or(
                                          lte(notifications.createdAt, cursor.createdAt),
                                          and(
                                              eq(notifications.createdAt, cursor.createdAt),
                                              lte(notifications.id, cursor.id)
                                          )
                                      ),
                                      gte(notifications.read, cursor.read)
                                  )
                                : undefined
                        )
                    )
                    .orderBy(
                        asc(notifications.read),
                        desc(notifications.createdAt),
                        desc(notifications.id)
                    )
                    .limit(limit + 1);

                const mainNotifications = await query;

                // fetch latest users involved in each notification
                const notificationsWithUsers = await Promise.all(
                    mainNotifications.map(async notif => {
                        const moreCount = notif.moreCount || 0;
                        const latestAmount = moreCount > 0 ? 2 : 1;

                        const fromUsers = await db
                            .select({
                                userId: users.id,
                                name: users.name,
                                username: users.username,
                                image: users.image,
                                isFollowedBack: sql`
                                    CASE 
                                        WHEN ${notifications.type} = ${NotificationType.FOLLOW} THEN 
                                            EXISTS (
                                                SELECT 1 
                                                FROM ${notifications} AS followBackNotification
                                                WHERE followBackNotification.type = ${NotificationType.FOLLOW}
                                                AND followBackNotification.from_id = ${notifications.toId}
                                                AND followBackNotification.to_id = ${notifications.fromId}
                                            )
                                        ELSE null
                                    END
                                `,
                            })
                            .from(notifications)
                            .innerJoin(users, eq(notifications.fromId, users.id))
                            .where(
                                and(
                                    eq(notifications.targetId, notif.targetId),
                                    eq(notifications.targetType, notif.targetType),
                                    eq(notifications.toId, userId)
                                )
                            )
                            .orderBy(desc(notifications.updatedAt))
                            .limit(latestAmount);

                        return {
                            ...notif,
                            from: fromUsers,
                            moreCount: moreCount > 0 ? moreCount - fromUsers.length : 0,
                        };
                    })
                );

                let nextCursor = null;

                if (mainNotifications.length > limit) {
                    const nextItem = notificationsWithUsers.pop();
                    nextCursor = {
                        id: nextItem!.id,
                        createdAt: nextItem!.createdAt,
                        updatedAt: nextItem!.updatedAt,
                        read: nextItem!.read!,
                    };
                }

                return {
                    notifications: notificationsWithUsers as NotificationReturn[],
                    nextCursor,
                };
            } catch (e) {
                handleError(e, {
                    message: 'Error retrieving notifications',
                    moreInfo: input,
                });
            }
        }),
    readAllNotifications: protectedProcedure.mutation(async ({ ctx: { db, session } }) => {
        try {
            await db
                .update(notifications)
                .set({ read: true })
                .where(and(eq(notifications.toId, session.user.id), eq(notifications.read, false)));
        } catch (e) {
            handleError(e, {
                message: 'Error reading all notifications',
                moreInfo: session,
            });
        }
    }),
    unreadAll: protectedProcedure.mutation(async ({ ctx: { db, session } }) => {
        await db
            .update(notifications)
            .set({ read: false })
            .where(and(eq(notifications.toId, session.user.id)));
    }),
    unreadLess: protectedProcedure.mutation(async ({ ctx: { db, session } }) => {
        const userId = session.user.id;
        await db
            .update(notifications)
            .set({ read: false })
            .where(and(eq(notifications.toId, userId)));

        const notificationsToUpdate = await db
            .select()
            .from(notifications)
            .where(and(eq(notifications.toId, userId), eq(notifications.read, false)))
            .limit(6);

        await db
            .update(notifications)
            .set({ read: true })
            .where(
                inArray(
                    notifications.id,
                    notificationsToUpdate.map(n => n.id)
                )
            );
    }),
    getUnreadCount: protectedProcedure.query(async ({ ctx: { db, session } }) => {
        const userId = session.user.id;

        try {
            const unreadCount = await db
                .select({
                    count: sql<number>`COUNT(*)`,
                })
                .from(notifications)
                .where(
                    and(
                        eq(notifications.toId, userId),
                        eq(notifications.isMain, true),
                        eq(notifications.read, false)
                    )
                );

            return unreadCount[0]?.count ?? 0;
        } catch (e) {
            ServerLogger.error(e);
            return 0;
        }
    }),
});

type PartialNotificationData = Partial<
    Omit<NotificationSchema, 'updatedAt' | 'createdAt' | 'isMain' | 'moreCount'>
>;

type StoreNotificationData = PartialNotificationData &
    Required<Pick<NotificationSchema, 'fromId' | 'toId' | 'type' | 'targetId' | 'targetType'>>;

export async function storeNotifications(data: StoreNotificationData[], executor?: typeof db) {
    const exec = executor ? executor : db;

    try {
        await exec.transaction(async trx => {
            const notificationsToInsert = [];
            let isMain = false;

            for (const notification of data) {
                if (notification.type === NotificationType.LIKE) {
                    // check if a main notification of this type already exists
                    const [existingNotification] = await trx
                        .select()
                        .from(notifications)
                        .where(
                            and(
                                eq(notifications.toId, notification.toId),
                                eq(notifications.targetId, notification.targetId),
                                eq(notifications.type, NotificationType.LIKE),
                                eq(notifications.targetType, NotificationTargetType.POST),
                                eq(notifications.isMain, true)
                            )
                        )
                        .limit(1);

                    // if exists, increment moreCount
                    if (existingNotification) {
                        await trx
                            .update(notifications)
                            .set({
                                moreCount: (existingNotification.moreCount || 0) + 1,
                                read: false,
                            })
                            .where(
                                and(
                                    eq(notifications.id, existingNotification.id),
                                    eq(notifications.isMain, true)
                                )
                            );
                    } else {
                        isMain = true;
                    }
                    // accurate moreCount less important than storing a new notification
                } else {
                    isMain = true;
                }

                notificationsToInsert.push({
                    fromId: notification.fromId,
                    toId: notification.toId,
                    type: notification.type,
                    targetType: notification.targetType,
                    targetId: notification.targetId,
                    isMain: isMain,
                });

                await trx.insert(notifications).values(notificationsToInsert);

                // notify users
                data.forEach(notification => {
                    getServerSocket().emit(SocketEvent.NOTIFY, notification.toId);
                });
            }
        });
    } catch (e) {
        handleError(e, {
            message: 'Error storing notifications',
            moreInfo: data,
        });
    }
}

export async function deleteNotifications(where: PartialNotificationData, executor?: typeof db) {
    const exec = executor ? executor : db;

    const notificationWhere = and(
        where.toId ? eq(notifications.toId, where.toId) : undefined,
        where.type ? eq(notifications.type, where.type) : undefined,
        where.targetType ? eq(notifications.targetType, where.targetType) : undefined,
        where.targetId ? eq(notifications.targetId, where.targetId) : undefined,
        where.read ? eq(notifications.read, where.read) : undefined
    );

    try {
        // delete the specified notification
        await exec.transaction(async trx => {
            await trx
                .delete(notifications)
                .where(
                    and(
                        notificationWhere,
                        where.fromId ? eq(notifications.fromId, where.fromId) : undefined,
                        where.id ? eq(notifications.id, where.id) : undefined,
                        lte(notifications.moreCount, 0)
                    )
                );

            // check if a main notification still exists
            const [mainNotification] = await trx
                .select({ id: notifications.id, moreCount: notifications.moreCount })
                .from(notifications)
                .where(and(notificationWhere, eq(notifications.isMain, true)))
                .limit(1);

            // if exists, decrement moreCount
            if (mainNotification) {
                if (mainNotification.moreCount && mainNotification.moreCount > 0) {
                    await trx
                        .update(notifications)
                        .set({ moreCount: mainNotification.moreCount - 1 })
                        .where(eq(notifications.id, mainNotification.id));
                }
            }
        });
    } catch (e) {
        handleError(e, {
            message: 'Error removing notifications',
            moreInfo: where,
        });
    }
}

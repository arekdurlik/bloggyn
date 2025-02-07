import {
    LATEST_ACTORS_MAX_AMOUNT,
    NotificationTargetType,
    NotificationType,
    SocketEvent,
} from '@/lib/constants';
import { ServerLogger } from '@/lib/log';
import { getServerSocket } from '@/sockets/server-socket';
import { protectedProcedure, router } from '@/trpc';
import { TRPCError, type inferRouterOutputs } from '@trpc/server';
import { and, asc, desc, eq, gte, inArray, lte, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db';
import { following, notifications, posts, users, type NotificationSchema } from '../db/schema';
import { handleError } from '../utils';

export type Notification = z.infer<typeof notificationSchema>;
export type NotificationsRouterOutput = inferRouterOutputs<typeof notificationsRouter>;
const notificationTypeEnum = z.nativeEnum(NotificationType);
const notificationTargetTypeEnum = z.nativeEnum(NotificationTargetType);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const notificationSchema = z.object({
    fromId: z.string().min(1),
    toId: z.string().min(1),
    notificationType: notificationTypeEnum,
    targetType: notificationTargetTypeEnum,
    targetId: z.string().min(1),
});

type LatestUsers = {
    userId: string;
    name: string | null;
    username: string | null;
    image: string | null;
    isFollowedBack?: boolean | null;
}[];

export type NotificationReturn = {
    id: number;
    fromIds: string[];
    toId: string;
    type: string;
    targetType: string;
    targetId: string;
    totalCount: number;
    read: boolean;
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
                        fromIds: notifications.fromIds,
                        toId: notifications.toId,
                        type: notifications.type,
                        targetType: notifications.targetType,
                        targetId: notifications.targetId,
                        totalCount: notifications.totalCount,
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
                            sql`array_length(${notifications.fromIds}, 1) IS NOT NULL`,
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

                // for each notification grab the details of the latest one or two users
                const notificationsWithUsers = await Promise.all(
                    mainNotifications.map(async notif => {
                        const totalCount = notif.totalCount || 0;

                        if (totalCount === 0) {
                            return {
                                ...notif,
                                from: [],
                                totalCount: 0,
                            };
                        }
                        const latestAmount = totalCount > 1 ? LATEST_ACTORS_MAX_AMOUNT : 1;
                        const latestUserIds = notif.fromIds.slice(0, latestAmount);

                        const fromUsers = await db
                            .select({
                                userId: users.id,
                                name: users.name,
                                username: users.username,
                                image: users.image,
                                isFollowedBack: sql<boolean | null>`
                                    CASE 
                                    WHEN ${notif.type} = ${NotificationType.FOLLOW} THEN 
                                        EXISTS (
                                        SELECT 1 FROM ${following}
                                        WHERE ${following.followerId} = ${notif.toId}
                                            AND ${following.followedId} = ${users.id}
                                        )
                                    ELSE null
                                    END
                                `,
                            })
                            .from(users)
                            .where(inArray(users.id, latestUserIds));

                        const sortedFromUsers = latestUserIds.map(id =>
                            fromUsers.find(user => user.userId === id)
                        ) as LatestUsers;

                        return {
                            ...notif,
                            from: sortedFromUsers,
                            totalCount: totalCount > 0 ? totalCount - sortedFromUsers.length : 0,
                        };
                    })
                );

                const onlyWithUsers = notificationsWithUsers.filter(notif => notif.from.length);

                let nextCursor = null;

                if (mainNotifications.length > limit) {
                    const nextItem = onlyWithUsers.pop();
                    nextCursor = {
                        id: nextItem!.id,
                        createdAt: nextItem!.createdAt,
                        updatedAt: nextItem!.updatedAt,
                        read: nextItem!.read,
                    };
                }

                return {
                    notifications: onlyWithUsers satisfies NotificationReturn[],
                    nextCursor,
                };
            } catch (e) {
                handleError(e, {
                    action: 'getNewestNotifications',
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
                action: 'readAllNotifications',
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
                .where(and(eq(notifications.toId, userId), eq(notifications.read, false)));

            return unreadCount[0]?.count ?? 0;
        } catch (e) {
            ServerLogger.error(e);
            return 0;
        }
    }),
});

type PartialNotificationData = Partial<
    Omit<NotificationSchema, 'updatedAt' | 'createdAt' | 'moreCount' | 'fromIds'>
>;

type StoreNotificationData = PartialNotificationData &
    Required<Pick<NotificationSchema, 'toId' | 'targetId' | 'targetType'>> & {
        fromId: string;
        type: NotificationType;
    };

export async function storeNotifications(data: StoreNotificationData[]) {
    const logger = new ServerLogger();

    try {
        await db.transaction(async trx => {
            const notificationsToInsert = [];

            for (const notification of data) {
                if (notification.type === NotificationType.LIKE) {
                    // skip notification about liking your own post
                    if (notification.fromId === notification.toId) {
                        continue;
                    }
                }

                logger.setAction('get existing');

                const [existingNotification] = await trx
                    .select()
                    .from(notifications)
                    .where(
                        and(
                            eq(notifications.toId, notification.toId),
                            eq(notifications.targetId, notification.targetId),
                            eq(notifications.type, NotificationType.LIKE),
                            eq(notifications.targetType, NotificationTargetType.POST),
                            eq(notifications.read, false)
                        )
                    )
                    .limit(1);

                // if exists, increment totalCount and mark as unread
                if (existingNotification) {
                    const newFromIds = [...existingNotification.fromIds];

                    // extra in case someone undos an action,
                    // otherwise will have to select from relevant table
                    const safeTotal = LATEST_ACTORS_MAX_AMOUNT + 2;

                    if (newFromIds.length < safeTotal) {
                        newFromIds.unshift(notification.fromId);
                    } else {
                        newFromIds.pop();
                        newFromIds.unshift(notification.fromId);
                    }

                    logger.setAction('update existing');

                    await trx
                        .update(notifications)
                        .set({
                            fromIds: newFromIds,
                            totalCount: (existingNotification.totalCount || 0) + 1,
                            read: false,
                        })
                        .where(and(eq(notifications.id, existingNotification.id)));
                } else {
                    notificationsToInsert.push({
                        fromIds: [notification.fromId],
                        toId: notification.toId,
                        type: notification.type,
                        targetType: notification.targetType,
                        targetId: notification.targetId,
                    });
                }
            }

            logger.setAction('insert all');

            if (notificationsToInsert.length > 0) {
                await trx.insert(notifications).values(notificationsToInsert);
            }

            // notify users
            data.forEach(notification => {
                getServerSocket().emit(SocketEvent.NOTIFY, notification.toId);
            });
        });
    } catch (e) {
        handleError(
            e,
            {
                message: 'Error storing notifications',
                moreInfo: data,
            },
            logger
        );
    }
}

export async function deleteNotifications(where: StoreNotificationData) {
    const notificationWhere = and(
        where.toId ? eq(notifications.toId, where.toId) : undefined,
        where.type ? eq(notifications.type, where.type) : undefined,
        where.targetType ? eq(notifications.targetType, where.targetType) : undefined,
        where.targetId ? eq(notifications.targetId, where.targetId) : undefined,
        where.read ? eq(notifications.read, where.read) : undefined
    );

    try {
        // delete the specified notification
        const [existing] = await db.select().from(notifications).where(notificationWhere).limit(1);

        if (existing) {
            if (existing.totalCount && existing.totalCount > 1) {
                let fromIds = existing.fromIds;

                if (fromIds.includes(where.fromId)) {
                    fromIds = fromIds.filter(id => id !== where.fromId);
                }

                await db
                    .update(notifications)
                    .set({ fromIds, totalCount: (existing.totalCount || 2) - 1 })
                    .where(and(eq(notifications.id, existing.id)));
            } else {
                await db.delete(notifications).where(and(eq(notifications.id, existing.id)));
            }
        } else {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Notification not found',
            });
        }
    } catch (e) {
        handleError(e, {
            message: 'Error removing notifications',
            moreInfo: where,
        });
    }
}

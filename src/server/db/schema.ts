import { BIO_MAX } from '@/validation/user/bio';
import { relations, sql } from 'drizzle-orm';
import {
    boolean,
    index,
    integer,
    pgTableCreator,
    primaryKey,
    serial,
    text,
    timestamp,
    varchar,
} from 'drizzle-orm/pg-core';
import { type AdapterAccount } from 'next-auth/adapters';

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator(name => `bloggyn_${name}`);

export type User = typeof users.$inferSelect;
export const users = createTable('user', {
    id: varchar('id', { length: 255 })
        .notNull()
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    username: varchar('username', { length: 36 }).unique(),
    name: varchar('name', { length: 255 }),
    bio: varchar('bio', { length: BIO_MAX }),
    email: varchar('email', { length: 255 }).notNull().unique(),
    emailVerified: timestamp('emailVerified', { mode: 'date' }),
    image: varchar('image', { length: 255 }),
    coverImage: varchar('cover_image', { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
    account: many(accounts),
    follower: many(following, { relationName: 'follower' }),
    followed: many(following, { relationName: 'followed' }),
    post: many(posts),
}));

export type Following = typeof following.$inferSelect;
export const following = createTable(
    'following',
    {
        followerId: varchar('follower_id', { length: 255 })
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        followedId: varchar('followed_id', { length: 255 })
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        createdAt: timestamp('created_at', {
            mode: 'string',
            withTimezone: true,
        })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    table => ({
        primaryKey: primaryKey({
            columns: [table.followerId, table.followedId],
        }),
    })
);

export const followingRelations = relations(following, ({ one }) => ({
    follower: one(users, {
        fields: [following.followerId],
        references: [users.id],
        relationName: 'follower',
    }),
    followed: one(users, {
        fields: [following.followedId],
        references: [users.id],
        relationName: 'followed',
    }),
}));

export const accounts = createTable(
    'account',
    {
        userId: varchar('user_id', { length: 255 })
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        password: text('password'),
        type: varchar('type', { length: 255 }).$type<AdapterAccount['type']>().notNull(),
        provider: varchar('provider', { length: 255 }).notNull(),
        providerAccountId: varchar('provider_account_id', {
            length: 255,
        }).notNull(),
        refreshToken: text('refresh_token'),
        refreshTokenExpires_in: integer('refresh_token_expires_in'),
        accessToken: text('access_token'),
        expiresAt: integer('expires_at'),
        tokenType: varchar('token_type', { length: 255 }),
        scope: varchar('scope', { length: 255 }),
        idToken: text('id_token'),
        sessionState: varchar('session_state', { length: 255 }),
        createdAt: timestamp('created_at', {
            mode: 'string',
            withTimezone: true,
        })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    account => ({
        compoundKey: primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
        userIdIdx: index('account_user_id_idx').on(account.userId),
    })
);

export const accountsRelations = relations(accounts, ({ one }) => ({
    user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const verificationCodes = createTable(
    'verification_code',
    {
        email: varchar('email', { length: 255 }).notNull(),
        code: varchar('code', { length: 6 }).notNull(),
        createdAt: timestamp('created_at', {
            mode: 'string',
            withTimezone: true,
        })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    verificationCode => ({
        compoundKey: primaryKey({
            columns: [verificationCode.email, verificationCode.code],
        }),
    })
);

export const posts = createTable('post', {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 200 }).notNull(),
    cardImage: varchar('card_image', { length: 255 }),
    slug: varchar('slug', { length: 230 }).notNull(),
    content: varchar('content').notNull(),
    summary: varchar('summary').notNull(),
    readTime: integer('read_time').notNull(),
    createdById: varchar('created_by', { length: 255 })
        .notNull()
        .references(() => users.id),
    createdAt: timestamp('created_at', {
        mode: 'string',
        withTimezone: true,
    })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
});

export const postsRelations = relations(posts, ({ one, many }) => ({
    user: one(users, { fields: [posts.createdById], references: [users.id] }),
    images: many(postImages),
    likes: many(postLikes),
    comments: many(postComments),
    bookmarks: many(postBookmarks),
}));

export const postImages = createTable('post_image', {
    id: serial('id').primaryKey(),
    imageId: varchar('image_id', { length: 255 }).notNull(),
    postId: integer('post_id').references(() => posts.id, { onDelete: 'set null' }),

    createdAt: timestamp('created_at', {
        mode: 'string',
        withTimezone: true,
    })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
});

export const postImagesRelations = relations(postImages, ({ one }) => ({
    post: one(posts, { fields: [postImages.postId], references: [posts.id] }),
}));

export const postLikes = createTable(
    'post_like',
    {
        postId: integer('post_id')
            .notNull()
            .references(() => posts.id, { onDelete: 'cascade' }),
        userId: varchar('user_id', { length: 255 }).notNull(),
        createdAt: timestamp('created_at', {
            mode: 'string',
            withTimezone: true,
        })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    postLike => ({
        compoundKey: primaryKey({
            columns: [postLike.postId, postLike.userId],
        }),
    })
);

export const postLikesRelations = relations(postLikes, ({ one }) => ({
    post: one(posts, { fields: [postLikes.postId], references: [posts.id] }),
    user: one(users, { fields: [postLikes.userId], references: [users.id] }),
}));

export const postComments = createTable(
    'post_comment',
    {
        id: serial('id').primaryKey(),
        postId: integer('post_id')
            .notNull()
            .references(() => posts.id, { onDelete: 'cascade' }),
        parentId: integer('parent_id'),
        authorId: text('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        content: text('content').notNull(),
        createdAt: timestamp('created_at', {
            mode: 'string',
            withTimezone: true,
        })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    table => ({
        postIdx: index('post_idx').on(table.postId),
        parentIdx: index('parent_idx').on(table.parentId),
        authorIdx: index('author_idx').on(table.authorId),
        createdAtIdx: index('comment_created_at_idx').on(table.createdAt),
    })
);

export const PostCommentsRelations = relations(postComments, ({ one }) => ({
    post: one(posts, { fields: [postComments.postId], references: [posts.id] }),
    author: one(users, { fields: [postComments.authorId], references: [users.id] }),
    parent: one(postComments, {
        fields: [postComments.parentId],
        references: [postComments.id],
        relationName: 'replies',
    }),
}));

export const commentLikes = createTable(
    'comment_like',
    {
        commentId: integer('comment_id')
            .notNull()
            .references(() => postComments.id, { onDelete: 'cascade' }),
        userId: text('user_id')
            .notNull()
            .references(() => users.id),
        createdAt: timestamp('created_at', {
            mode: 'string',
            withTimezone: true,
        })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    commentLike => ({
        compoundKey: primaryKey({
            columns: [commentLike.commentId, commentLike.userId],
        }),
    })
);

export const commentLikesRelations = relations(commentLikes, ({ one }) => ({
    comment: one(postComments, { fields: [commentLikes.commentId], references: [postComments.id] }),
    user: one(users, { fields: [commentLikes.userId], references: [users.id] }),
}));

export const postBookmarks = createTable(
    'post_bookmark',
    {
        postId: integer('post_id')
            .notNull()
            .references(() => posts.id, { onDelete: 'cascade' }),
        userId: varchar('user_id', { length: 255 })
            .references(() => users.id)
            .notNull(),
        createdAt: timestamp('created_at', {
            mode: 'string',
            withTimezone: true,
        })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    postBookmark => ({
        compoundKey: primaryKey({
            columns: [postBookmark.postId, postBookmark.userId],
        }),
    })
);

export const postBookmarksRelations = relations(postBookmarks, ({ one }) => ({
    post: one(posts, { fields: [postBookmarks.postId], references: [posts.id] }),
    user: one(users, { fields: [postBookmarks.userId], references: [users.id] }),
}));

export type NotificationSchema = typeof notifications.$inferSelect;
export const notifications = createTable(
    'notifications',
    {
        id: serial('id').primaryKey(),
        fromIds: varchar('from_ids', { length: 255 }).array().notNull(),
        toId: varchar('to_id', { length: 255 })
            .references(() => users.id)
            .notNull(),
        type: varchar('type', { length: 50 }).notNull(),
        targetType: varchar('target_type', { length: 50 }).notNull(),
        targetId: varchar('target_id', { length: 255 }).notNull(),
        read: boolean('read').default(false).notNull(),
        totalCount: integer('total_count').default(1),
        createdAt: timestamp('created_at', {
            mode: 'string',
            withTimezone: true,
        })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp('updated_at', {
            mode: 'string',
            withTimezone: true,
        })
            .default(sql`CURRENT_TIMESTAMP`)
            .$onUpdate(() => sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    table => ({
        toIdTypeIdx: index('to_id_type_idx').on(table.toId, table.type),
        targetIdx: index('target_idx').on(table.targetId, table.targetType),
        createdAtIdx: index('notification_created_at_idx').on(table.createdAt),
    })
);

import { BIO_MAX } from '@/validation/user/bio';
import { relations, sql } from 'drizzle-orm';
import {
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
    cover_image: varchar('cover_image', { length: 255 }),
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
        pk: primaryKey({ columns: [table.followerId, table.followedId] }),
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
        type: varchar('type', { length: 255 })
            .$type<AdapterAccount['type']>()
            .notNull(),
        provider: varchar('provider', { length: 255 }).notNull(),
        providerAccountId: varchar('provider_account_id', {
            length: 255,
        }).notNull(),
        refresh_token: text('refresh_token'),
        refresh_token_expires_in: integer('refresh_token_expires_in'),
        access_token: text('access_token'),
        expires_at: integer('expires_at'),
        token_type: varchar('token_type', { length: 255 }),
        scope: varchar('scope', { length: 255 }),
        id_token: text('id_token'),
        session_state: varchar('session_state', { length: 255 }),
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

export const postsRelations = relations(posts, ({ one }) => ({
    user: one(users, { fields: [posts.createdById], references: [users.id] }),
}));

export const postImages = createTable(
    'post_image',
    {
        image_id: varchar('image_id', { length: 255 }).notNull(),
        post_id: integer('post_id').notNull(),

        createdAt: timestamp('created_at', {
            mode: 'string',
            withTimezone: true,
        })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    postImage => ({
        compoundKey: primaryKey({
            columns: [postImage.image_id, postImage.post_id],
        }),
    })
);

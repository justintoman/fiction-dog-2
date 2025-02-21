import "dotenv/config";
import { relations, sql } from "drizzle-orm";
import { blob, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const images = sqliteTable("images", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => Bun.randomUUIDv7()),
  source: blob().notNull(),
  webp: blob().notNull(),
  png: blob().notNull(),
});

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => Bun.randomUUIDv7()),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: integer("emailVerified", { mode: "boolean" }).default(sql`0`),
  // image: text("image"),
});

export const userRelations = relations(users, ({ many }) => ({
  stories: many(stories),
}));

export const stories = sqliteTable("stories", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  imageId: text("imageId")
    .notNull()
    .references(() => images.id),
  authorId: text("authorId")
    .notNull()
    .references(() => users.id),
  publishedAt: integer("publishedAt", { mode: "timestamp" }).default(
    sql`(CURRENT_TIME)`
  ),
  isPublished: integer("isPublished", { mode: "boolean" }).default(sql`0`),
});

export const storyRelations = relations(stories, ({ one, many }) => ({
  author: one(users, {
    fields: [stories.authorId],
    references: [users.id],
  }),
  image: one(images, {
    fields: [stories.imageId],
    references: [images.id],
  }),
  chapters: many(chapters),
}));

export const chapters = sqliteTable("chapters", {
  storySlug: text("storySlug")
    .notNull()
    .references(() => stories.slug, { onDelete: "cascade" }),
  slug: text("slug").primaryKey(),
  content: text("content"),
  imageId: text("imageId").references(() => images.id),
});

export const chaptersRelations = relations(chapters, ({ one, many }) => ({
  story: one(stories, {
    fields: [chapters.storySlug],
    references: [stories.slug],
  }),
  choices: many(choices),
  image: one(images, {
    fields: [chapters.imageId],
    references: [images.id],
  }),
}));

export const choices = sqliteTable("choices", {
  chapterSlug: text("chapterSlug")
    .notNull()
    .references(() => chapters.slug),
  slug: text("slug").primaryKey(),
  content: text("content"),
  nextChapterSlug: text("nextChapterSlug").references(() => chapters.slug),
});

export const choicesRelations = relations(choices, ({ one }) => ({
  chapter: one(chapters, {
    fields: [choices.chapterSlug],
    references: [chapters.slug],
  }),
}));

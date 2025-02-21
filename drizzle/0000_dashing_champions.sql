CREATE TABLE `chapters` (
	`storySlug` text NOT NULL,
	`slug` text PRIMARY KEY NOT NULL,
	`content` text,
	`imageId` text,
	FOREIGN KEY (`storySlug`) REFERENCES `stories`(`slug`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`imageId`) REFERENCES `images`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `choices` (
	`chapterSlug` text NOT NULL,
	`slug` text PRIMARY KEY NOT NULL,
	`content` text,
	`nextChapterSlug` text,
	FOREIGN KEY (`chapterSlug`) REFERENCES `chapters`(`slug`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`nextChapterSlug`) REFERENCES `chapters`(`slug`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `images` (
	`id` text PRIMARY KEY NOT NULL,
	`source` blob NOT NULL,
	`webp` blob NOT NULL,
	`png` blob NOT NULL
);
--> statement-breakpoint
CREATE TABLE `stories` (
	`slug` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`imageId` text NOT NULL,
	`authorId` text NOT NULL,
	`publishedAt` integer DEFAULT (CURRENT_TIME),
	`isPublished` integer DEFAULT 0,
	FOREIGN KEY (`imageId`) REFERENCES `images`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`emailVerified` integer DEFAULT 0
);

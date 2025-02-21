import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema.server";
import { Database } from 'bun:sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';

const sqlite = new Database(Bun.env.DB_FILE_NAME!);
export const db = drizzle({ client: sqlite, schema });
migrate(db, { migrationsFolder: './drizzle' });

async function seed() {
  if ((await db.select().from(schema.stories)).length > 0) {
    console.log("db already seeded, not seeding");
    return;
  }
  await Promise.all([
    db.insert(schema.users).values({
      name: "Jetoman",
      email: "jetoman@example.com",
    }),
    db.insert(schema.images).values({
      source: Buffer.from([]),
      png: Buffer.from([]),
      webp: Buffer.from([]),
    }),
  ]);
  const [user, image] = await Promise.all([
    db.query.users.findFirst(),
    db.query.images.findFirst(),
  ]);
  if (!user || !image) {
    return;
  }
  await db.insert(schema.stories).values({
    slug: "my-first-story",
    title: "My First Story",
    authorId: user.id,
    imageId: image.id,
    isPublished: true,
  });
  console.log("New story created!");
}

seed();

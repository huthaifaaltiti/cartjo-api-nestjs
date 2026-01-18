/* Migrations files naming: YYYYMMDD_HHMMSS_description.migration.ts
     YYYYMMDD → year, month, day (e.g., 20260117)
     HHMMSS → hour, minute, second (to guarantee uniqueness) OR The number of migration file → (_1_, _2_, etc) 
     description → short snake_case description of the migration
*/

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getConnectionToken } from '@nestjs/mongoose';
import { readdirSync } from 'fs';
import { join } from 'path';
import mongoose, { Connection } from 'mongoose';

async function runMigrations() {
  const app = await NestFactory.createApplicationContext(AppModule);
  // Default DB connection
  const appMongo = app.get(getConnectionToken());
  // Additional Media DB connection
  const mediaMongo: Connection = await mongoose
    .createConnection(process.env.MONGODB_MEDIA_URI!)
    .asPromise();

  const migrationsDir = join(__dirname, 'database/migrations');
  const files = readdirSync(migrationsDir);

  // 🔹 This will auto-create the collection on first insert
  const migrationsCollection = appMongo.collection('migrations');

  for (const file of files) {
    if (!file.endsWith('.migration.js') && !file.endsWith('.migration.ts'))
      continue;

    console.log({file})

    // Determine which DB to use
    const isMediaMigration = file.toLowerCase().includes('.media.');

    console.log({isMediaMigration})
    const mongoConnection = isMediaMigration ? mediaMongo : appMongo;

    const alreadyRan = await migrationsCollection.findOne({ name: file });

    if (alreadyRan) {
      console.log(`⏭ Skipping already executed migration: ${file}`);
      continue;
    }

    console.log(`Running migration: ${file}`);
    const migration = (await import(join(migrationsDir, file))).default;

    await migration(mongoConnection);

    // ✅ Store migration name
    await migrationsCollection.insertOne({
      name: file,
      ranAt: new Date(),
    });

    console.log(`✅ Migration stored: ${file}`);
  }

  await app.close();
  console.log('🎉 All migrations completed.');
}

runMigrations();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getConnectionToken } from '@nestjs/mongoose';
import { readdirSync } from 'fs';
import { join } from 'path';

async function runMigrations() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const mongo = app.get(getConnectionToken());

  const migrationsDir = join(__dirname, 'database/migrations');
  const files = readdirSync(migrationsDir).sort();

  const migrationsCollection = mongo.collection('migrations');

  for (const file of files) {
    if (!file.endsWith('.migration.js') && !file.endsWith('.migration.ts'))
      continue;

    const alreadyRan = await migrationsCollection.findOne({ name: file });
    if (alreadyRan) {
      console.log(`⏭ Skipping already executed migration: ${file}`);
      continue;
    }

    console.log(`Running migration: ${file}`);
    const migration = (await import(join(migrationsDir, file))).default;
    await migration(mongo);

    // inserting into db
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

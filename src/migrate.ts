import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getConnectionToken } from '@nestjs/mongoose';
import { readdirSync } from 'fs';
import { join } from 'path';

async function runMigrations() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const mongo = app.get(getConnectionToken());

  const migrationsDir = join(__dirname, 'migrations');
  const files = readdirSync(migrationsDir);

  for (const file of files) {
    if (!file.endsWith('.migration.js') && !file.endsWith('.migration.ts'))
      continue;

    console.log(`Running migration: ${file}`);
    const migration = (await import(join(migrationsDir, file))).default;

    await migration(mongo);
  }

  await app.close();

  console.log('Migrations completed.');
}

runMigrations();

import { NestExpressApplication } from "@nestjs/platform-express";

export async function runSeeders(app: NestExpressApplication, seeders: any[]) {
  for (const Seeder of seeders) {
    const seederInstance = app.get(Seeder);
    
    if (seederInstance?.seed) {
      console.log(`🚀 Seeding: ${Seeder.name}`);
      await seederInstance.seed();
      console.log(`✅ Finished: ${Seeder.name}`);
    }
  }
}
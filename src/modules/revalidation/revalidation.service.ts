import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
<<<<<<< HEAD
=======
import { getNextJsUrl } from 'src/common/utils/getNextJsUrl';
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594

@Injectable()
export class RevalidationService {
  private readonly logger = new Logger(RevalidationService.name);
  private readonly nextjsUrl: string;
  private readonly revalidationSecret: string;

  constructor(private configService: ConfigService) {
<<<<<<< HEAD
    this.nextjsUrl = this.configService.get<string>('NEXTJS_URL');
    this.revalidationSecret = this.configService.get<string>(
      'REVALIDATION_SECRET',
=======
    this.nextjsUrl = getNextJsUrl();
    this.revalidationSecret = this.configService.get<string>(
      'NEXTJS_REVALIDATION_SECRET',
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
    );
  }

  async revalidatePaths(paths: string[] = ['/']) {
    try {
      const response = await fetch(
        `${this.nextjsUrl}/api/revalidate?secret=${this.revalidationSecret}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ paths }), // Optional: pass specific paths
        },
      );

      if (!response.ok) {
        throw new Error(`Revalidation failed with status: ${response.status}`);
      }

      const data = await response.json();
      this.logger.log(
        `Next.js revalidated successfully: ${JSON.stringify(data)}`,
      );
      return data;
    } catch (error) {
      this.logger.error('Failed to trigger Next.js revalidation:', error);
      throw error;
    }
  }

  async revalidateTag(tag: string) {
    try {
      const response = await fetch(
        `${this.nextjsUrl}/api/revalidate?secret=${this.revalidationSecret}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tag }),
        },
      );

      if (!response.ok) {
        throw new Error(`Revalidation failed with status: ${response.status}`);
      }

      const data = await response.json();
      this.logger.log(`Next.js tag "${tag}" revalidated successfully`);
      return data;
    } catch (error) {
      this.logger.error(`Failed to revalidate tag "${tag}":`, error);
      throw error;
    }
  }
}

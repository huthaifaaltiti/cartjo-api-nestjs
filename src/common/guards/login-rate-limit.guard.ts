import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

interface RateLimitEntry {
  count: number;
  firstRequest: number;
}

// In-memory store — swap for Redis in production
const store = new Map<string, RateLimitEntry>();

@Injectable()
export class LoginRateLimitGuard implements CanActivate {
  private readonly WINDOW_MS: number;
  private readonly MAX_ATTEMPTS: number;

  constructor(private readonly configService: ConfigService) {
    const lockDurationMinutes = Number(
      this.configService.get<string>('LOCK_DURATION_MINUTES', '15'),
    );

    this.WINDOW_MS = lockDurationMinutes * 60 * 1000;

    this.MAX_ATTEMPTS = Number(
      this.configService.get<string>('MAX_LOGIN_ATTEMPTS', '5'),
    );
  }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();

    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';

    const key = `login_rl:${ip}`;
    const now = Date.now();

    const entry = store.get(key);

    // First request or expired window
    if (!entry || now - entry.firstRequest > this.WINDOW_MS) {
      store.set(key, {
        count: 1,
        firstRequest: now,
      });

      return true;
    }

    // Under limit
    if (entry.count < this.MAX_ATTEMPTS) {
      entry.count++;

      return true;
    }

    // Block request
    const retryAfterSeconds = Math.ceil(
      (this.WINDOW_MS - (now - entry.firstRequest)) / 1000,
    );

    throw new HttpException(
      {
        statusCode: 429,
        isSuccess: false,
        message: `Too many login attempts. Try again in ${retryAfterSeconds} seconds.`,
        retryAfter: retryAfterSeconds,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
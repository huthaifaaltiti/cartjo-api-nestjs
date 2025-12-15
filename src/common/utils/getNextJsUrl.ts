import { AppEnvironments } from 'src/enums/appEnvs.enum';

export function getNextJsUrl(): string {
  const env = process.env.NODE_ENV;

  switch (env) {
    case AppEnvironments.PRODUCTION:
      return process.env.NEXTJS_URL_PRODUCTION!;
    case AppEnvironments.PREVIEW:
      return process.env.NEXTJS_URL_PREVIEW!;
    case AppEnvironments.DEVELOPMENT:
    default:
      return process.env.NEXTJS_URL_DEVELOPMENT!;
  }
}

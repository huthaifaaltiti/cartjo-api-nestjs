import { AppEnvironments } from 'src/enums/appEnvs.enum';

export function getAppUrl(): string {
  const env = process.env.NODE_ENV;

  switch (env) {
    case AppEnvironments.PRODUCTION:
      return process.env.APP_URL_PRODUCTION!;
    case AppEnvironments.PREVIEW:
      return process.env.APP_URL_PREVIEW!;
    case AppEnvironments.DEVELOPMENT:
    default:
      return process.env.APP_URL_DEVELOPMENT!;
  }
}

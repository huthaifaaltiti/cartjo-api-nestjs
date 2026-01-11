import { AppEnvironments } from 'src/enums/appEnvs.enum';

export function getAppHostName(): string {
  const env = process.env.NODE_ENV;

  switch (env) {
    case AppEnvironments.PRODUCTION:
      return process.env.API_HOST_PRODUCTION!;
    case AppEnvironments.PREVIEW:
      return process.env.API_HOST_PREVIEW!;
    case AppEnvironments.DEVELOPMENT:
    default:
      return process.env.API_HOST_DEVELOPMENT!;
  }
}

import { AppEnvironments } from 'src/enums/appEnvs.enum';

export const appEnvsHosts: Record<AppEnvironments, string> = {
  [AppEnvironments.DEVELOPMENT]: process.env.API_HOST_DEVELOPMENT!,
  [AppEnvironments.PREVIEW]: process.env.API_HOST_PREVIEW!,
  [AppEnvironments.PRODUCTION]: process.env.API_HOST_PRODUCTION!,
};

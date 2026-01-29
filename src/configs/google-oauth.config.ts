import { ApiPaths } from 'src/common/constants/api-paths';

const normalize = (url?: string) => url?.replace(/\/$/, '');

const getRedirectUri = (env: NodeJS.ProcessEnv) => {
  const nodeEnv = env.NODE_ENV || 'development';

  const hosts = {
    development: env.API_HOST_DEVELOPMENT,
    preview: env.API_HOST_PREVIEW,
    production: env.API_HOST_PRODUCTION,
  };

  const host = normalize(hosts[nodeEnv]) || normalize(hosts.development);

  if (!host) {
    throw new Error('❌ API host is missing for Google OAuth redirect URI');
  }

  return `${host}/${ApiPaths.Authentication.Root}/${ApiPaths.Authentication.GoogleCallback}`;
};

export const buildGoogleOAuthConfig = (env: NodeJS.ProcessEnv) => {
  const clientId = env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = env.GOOGLE_OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('❌ Google OAuth Client ID or Secret is missing');
  }

  return {
    clientId,
    clientSecret,
    redirectUri: getRedirectUri(env),
  };
};

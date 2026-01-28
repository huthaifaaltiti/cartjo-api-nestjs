const getRedirectUri = () => {
  const env = process.env.NODE_ENV;
  
  const uris = {
    production: 'https://api.cartjo.com/authentication/google/callback',
    preview: 'https://preview.api.cartjo.com/authentication/google/callback',
    development: 'http://localhost:8000/api/v1/authentication/google/callback',
  };

  return uris[env] || uris.development;
};

export const GOOGLE_OAUTH_CONFIG = {
  clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
  clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  redirectUri: getRedirectUri(),
};
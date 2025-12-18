import { getSocialMediaLinks } from 'src/configs/social-media.config';
import { AppEnvironments } from 'src/enums/appEnvs.enum';

const commonEmailTemplateData = () => {
  const isProd = process.env.NODE_ENV === AppEnvironments.PRODUCTION;
  const emailLogoHostUrl = isProd
    ? process.env.API_HOST_PRODUCTION
    : process.env.API_HOST_PREVIEW;
    
  const appUsersSupportEmail = process.env.APP_USERS_SUPPORT_EMAIL;

  return {
    logoUrl: `${emailLogoHostUrl}/public/assets/images/cartJOLogo.png`,
    appUsersSupportEmail,
    ...getSocialMediaLinks(),
  };
};

export default commonEmailTemplateData;

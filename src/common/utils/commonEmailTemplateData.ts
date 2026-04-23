import { copyRights } from '../../configs/copyRights.config';
import {
  getSocialMediaIconsPaths,
  getSocialMediaLinks,
} from '../../configs/social-media.config';
import { AppEnvironments } from '../../enums/appEnvs.enum';

const commonEmailTemplateData = () => {
  const isProd = process.env.NODE_ENV === AppEnvironments.PRODUCTION;
  const hostUrl = isProd
    ? process.env.API_HOST_PRODUCTION
    : process.env.API_HOST_PREVIEW;

  const appUsersSupportEmail = process.env.APP_USERS_SUPPORT_EMAIL;

  return {
    logoUrl: `${hostUrl}/public/assets/images/cartJOLogo.png`,
    appUsersSupportEmail,
    ...getSocialMediaLinks(),
    ...getSocialMediaIconsPaths(hostUrl),
    ...copyRights(),
  };
};

export default commonEmailTemplateData;

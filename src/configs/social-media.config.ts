const ICONS_BASE_PATH = '/public/assets/icons';

export const getSocialMediaIconsPaths = (hostUrl: string) => ({
  whatsappIconPath: `${hostUrl}${ICONS_BASE_PATH}/whatsapp.png`,
  xIconPath: `${hostUrl}${ICONS_BASE_PATH}/x.png`,
  facebookIconPath: `${hostUrl}${ICONS_BASE_PATH}/facebook.png`,
  instagramIconPath: `${hostUrl}${ICONS_BASE_PATH}/instagram.png`,
  snapchatIconPath: `${hostUrl}${ICONS_BASE_PATH}/snapchat.png`,
  linkedinIconPath: `${hostUrl}${ICONS_BASE_PATH}/linkedin.png`,
  tiktokIconPath: `${hostUrl}${ICONS_BASE_PATH}/tiktok.png`,
});

export const getSocialMediaLinks = () => ({
  whatsappNumber: process.env.SOCIAL_MEDIA_WHATSAPP_NUMBER,
  whatsappLink: process.env.SOCIAL_MEDIA_WHATSAPP_LINK,
  xLink: process.env.SOCIAL_MEDIA_X_LINK,
  facebookLink: process.env.SOCIAL_MEDIA_FACEBOOK_LINK,
  instagramLink: process.env.SOCIAL_MEDIA_INSTAGRAM_LINK,
  snapchatLink: process.env.SOCIAL_MEDIA_SNAPCHAT_LINK,
  linkedInLink: process.env.SOCIAL_MEDIA_LINKEDIN_LINK,
  tiktokLink: process.env.SOCIAL_MEDIA_TIKTOK_LINK,
});

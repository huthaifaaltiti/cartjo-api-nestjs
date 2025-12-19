const ICONS_BASE_PATH = '/public/assets/icons';

export const getSocialMediaLinks = (hostUrl: string) => ({
  whatsappNumber: process.env.SOCIAL_MEDIA_WHATSAPP_NUMBER,
  whatsappIconPath: `${hostUrl}${ICONS_BASE_PATH}/whatsapp.png`,
  whatsappLink: process.env.SOCIAL_MEDIA_WHATSAPP_LINK,

  xIconPath: `${hostUrl}${ICONS_BASE_PATH}/x.png`,
  xLink: process.env.SOCIAL_MEDIA_X_LINK,

  facebookIconPath: `${hostUrl}${ICONS_BASE_PATH}/facebook.png`,
  facebookLink: process.env.SOCIAL_MEDIA_FACEBOOK_LINK,

  instagramIconPath: `${hostUrl}${ICONS_BASE_PATH}/instagram.png`,
  instagramLink: process.env.SOCIAL_MEDIA_INSTAGRAM_LINK,

  snapchatIconPath: `${hostUrl}${ICONS_BASE_PATH}/snapchat.png`,
  snapchatLink: process.env.SOCIAL_MEDIA_SNAPCHAT_LINK,

  linkedinIconPath: `${hostUrl}${ICONS_BASE_PATH}/linkedin.png`,
  linkedInLink: process.env.SOCIAL_MEDIA_LINKEDIN_LINK,

  tiktokIconPath: `${hostUrl}${ICONS_BASE_PATH}/tiktok.png`,
  tiktokLink: process.env.SOCIAL_MEDIA_TIKTOK_LINK,
});

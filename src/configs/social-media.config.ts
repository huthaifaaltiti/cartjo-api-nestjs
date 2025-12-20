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
  whatsappIconPath: `${hostUrl}/public/assets/icons/whatsapp.png`,
  whatsappLink: process.env.SOCIAL_MEDIA_WHATSAPP_LINK,
  
  xIconPath: `${hostUrl}/public/assets/icons/x.png`,
  xLink: process.env.SOCIAL_MEDIA_X_LINK,

  facebookIconPath: `${hostUrl}/public/assets/icons/facebook.png`,
  facebookLink: process.env.SOCIAL_MEDIA_FACEBOOK_LINK,

  instagramIconPath: `${hostUrl}/public/assets/icons/instagram.png`,
  instagramLink: process.env.SOCIAL_MEDIA_INSTAGRAM_LINK,

  snapchatIconPath: `${hostUrl}/public/assets/icons/snapchat.png`,
  snapchatLink: process.env.SOCIAL_MEDIA_SNAPCHAT_LINK,

  linkedinIconPath: `${hostUrl}/public/assets/icons/linkedin.png`,
  linkedInLink: process.env.SOCIAL_MEDIA_LINKEDIN_LINK,

  tiktokIconPath: `${hostUrl}/public/assets/icons/tiktok.png`,
  tiktokLink: process.env.SOCIAL_MEDIA_TIKTOK_LINK,
});

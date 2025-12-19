export const getSocialMediaLinks = (hostUrl: string) => ({
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

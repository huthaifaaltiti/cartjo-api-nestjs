import { EmailTemplates } from 'src/enums/emailTemplates.enum';

export const getEmailFromMapping = (): Record<string, string> => ({
  // NO_REPLY
  [EmailTemplates.USER_REGISTRATION_CONFIRMATION]:
    process.env.EMAIL_FROM_NO_REPLY!,
  [EmailTemplates.RESEND_VERIFICATION_EMAIL]: process.env.EMAIL_FROM_NO_REPLY!,
  [EmailTemplates.RESET_PASSWORD_CODE]: process.env.EMAIL_FROM_NO_REPLY!,
  [EmailTemplates.PASSWORD_RESET_SUCCESS]: process.env.EMAIL_FROM_NO_REPLY!,

  // NOTIFICATIONS
  [EmailTemplates.ORDER_ORDER_CREATED]: process.env.EMAIL_FROM_NOTIFICATIONS!,

  // SYSTEM
  [EmailTemplates.PRIVACY_POLICY_UPDATE]: process.env.EMAIL_FROM_SYSTEM!,
});

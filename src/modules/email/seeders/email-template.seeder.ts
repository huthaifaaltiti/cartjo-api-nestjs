import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailTemplates } from 'src/enums/emailTemplates.enum';
import { EmailTemplate } from 'src/schemas/email-template.schema';
import {
  passwordResetSuccessTemplate,
  privacyPolicyTemplate,
  resendVerificationTemplate,
  resetPasswordTemplate,
  userRegistrationTemplate,
  orderCreatedTemplate,
} from './email-templates';

@Injectable()
export class EmailTemplateSeeder {
  constructor(
    @InjectModel(EmailTemplate.name)
    private readonly templateModel: Model<EmailTemplate>,
  ) {}

  async seed() {
    await this.seedUserRegistration();
    await this.seedPrivacyPolicyUpdate();
    await this.seedResendVerificationEmail();
    await this.seedResetPasswordEmail();
    await this.seedPasswordResetSuccessEmail();
    await this.seedOrderCreatedSuccessEmail();
  }

  private async seedUserRegistration() {
    const name = EmailTemplates.USER_REGISTRATION_CONFIRMATION;
    const exists = await this.templateModel.findOne({ name });
    if (exists) return Logger.log(`✅ "${name}" template already exists`);

    await this.templateModel.create({
      name,
      ...userRegistrationTemplate,
    });

    Logger.log('✅ User registration template created (EN & AR)');
  }

  private async seedPrivacyPolicyUpdate() {
    const name = EmailTemplates.PRIVACY_POLICY_UPDATE;
    const exists = await this.templateModel.findOne({ name });
    if (exists) return Logger.log(`✅ "${name}" template already exists`);

    await this.templateModel.create({
      name,
      ...privacyPolicyTemplate,
    });

    Logger.log('✅ Privacy policy update template created (EN & AR)');
  }

  private async seedResendVerificationEmail() {
    const name = EmailTemplates.RESEND_VERIFICATION_EMAIL;
    const exists = await this.templateModel.findOne({ name });
    if (exists) return Logger.log(`✅ "${name}" template already exists`);

    await this.templateModel.create({
      name,
      ...resendVerificationTemplate,
    });

    Logger.log('✅ Resend Verification Email template created (EN & AR)');
  }

  private async seedResetPasswordEmail() {
    const name = EmailTemplates.RESET_PASSWORD_CODE;
    const exists = await this.templateModel.findOne({ name });
    if (exists) return Logger.log(`✅ "${name}" template already exists`);

    await this.templateModel.create({
      name,
      ...resetPasswordTemplate,
    });

    Logger.log('✅ Reset password Email template created (EN & AR)');
  }

  private async seedPasswordResetSuccessEmail() {
    const name = EmailTemplates.PASSWORD_RESET_SUCCESS;
    const exists = await this.templateModel.findOne({ name });
    if (exists) return Logger.log(`✅ "${name}" template already exists`);

    await this.templateModel.create({
      name,
      ...passwordResetSuccessTemplate,
    });

    Logger.log('✅ Password reset success Email template created (EN & AR)');
  }

  private async seedOrderCreatedSuccessEmail() {
    const name = EmailTemplates.ORDER_ORDER_CREATED;
    const exists = await this.templateModel.findOne({ name });

    if (exists) return Logger.log(`✅ "${name}" template already exists`);

    await this.templateModel.create({
      name,
      ...orderCreatedTemplate,
    });

    Logger.log('✅ Order-created email template created (EN & AR)');
  }
}

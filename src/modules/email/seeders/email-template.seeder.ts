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
  orderShippedTemplate,
  orderOutForDeliveryTemplate,
  orderDeliveredTemplate,
  orderDeliveryFailedTemplate,
  orderCanceledTemplate,
  orderReturnedTemplate,
  passwordChangedTemplate,
  emailVerifiedTemplate,
} from './email-templates';

@Injectable()
export class EmailTemplateSeeder {
  constructor(
    @InjectModel(EmailTemplate.name)
    private readonly templateModel: Model<EmailTemplate>,
  ) {}

  async seed() {
    // App-Related
    await this.seedPrivacyPolicyUpdate();

    // Authentication
    await this.seedUserRegistration();
    await this.seedResendVerificationEmail();
    await this.seedResetPasswordEmail();
    await this.seedPasswordResetSuccessEmail();
    await this.seedPasswordChangedSuccessEmail();
    await this.seedEmailVerified();

    // Order
    await this.seedOrderCreatedSuccessEmail();
    await this.seedOrderShippedSuccessEmail();
    await this.seedOrderOutForDeliverySuccessEmail();
    await this.seedOrderDeliveredSuccessEmail();
    await this.seedOrderDeliveryFailedSuccessEmail();
    await this.seedOrderDeliveryCanceledSuccessEmail();
    await this.seedOrderDeliveryCanceledSuccessEmail();
    await this.seedOrderDeliveryReturnedSuccessEmail();
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
    const name = EmailTemplates.ORDER_CREATED;
    const exists = await this.templateModel.findOne({ name });

    if (exists) return Logger.log(`✅ "${name}" template already exists`);

    await this.templateModel.create({
      name,
      ...orderCreatedTemplate,
    });

    Logger.log('✅ Order-created email template created (EN & AR)');
  }

  private async seedOrderShippedSuccessEmail() {
    const name = EmailTemplates.ORDER_SHIPPED;
    const exists = await this.templateModel.findOne({ name });

    if (exists) return Logger.log(`✅ "${name}" template already exists`);

    await this.templateModel.create({
      name,
      ...orderShippedTemplate,
    });

    Logger.log('✅ Order-shipped email template created (EN & AR)');
  }

  private async seedOrderOutForDeliverySuccessEmail() {
    const name = EmailTemplates.ORDER_OUT_FOR_DELIVERY;
    const exists = await this.templateModel.findOne({ name });

    if (exists) return Logger.log(`✅ "${name}" template already exists`);

    await this.templateModel.create({
      name,
      ...orderOutForDeliveryTemplate,
    });

    Logger.log('✅ Order-Out-For-Delivery email template created (EN & AR)');
  }

  private async seedOrderDeliveredSuccessEmail() {
    const name = EmailTemplates.ORDER_DELIVERED;
    const exists = await this.templateModel.findOne({ name });

    if (exists) return Logger.log(`✅ "${name}" template already exists`);

    await this.templateModel.create({
      name,
      ...orderDeliveredTemplate,
    });

    Logger.log('✅ Order-Delivered email template created (EN & AR)');
  }

  private async seedOrderDeliveryFailedSuccessEmail() {
    const name = EmailTemplates.ORDER_DELIVERY_FAILED;
    const exists = await this.templateModel.findOne({ name });

    if (exists) return Logger.log(`✅ "${name}" template already exists`);

    await this.templateModel.create({
      name,
      ...orderDeliveryFailedTemplate,
    });

    Logger.log('✅ Order-Delivery-Failed email template created (EN & AR)');
  }

  private async seedOrderDeliveryCanceledSuccessEmail() {
    const name = EmailTemplates.ORDER_CANCELED;
    const exists = await this.templateModel.findOne({ name });

    if (exists) return Logger.log(`✅ "${name}" template already exists`);

    await this.templateModel.create({
      name,
      ...orderCanceledTemplate,
    });

    Logger.log('✅ Order-Delivery-Canceled email template created (EN & AR)');
  }

  private async seedOrderDeliveryReturnedSuccessEmail() {
    const name = EmailTemplates.ORDER_RETURNED;
    const exists = await this.templateModel.findOne({ name });

    if (exists) return Logger.log(`✅ "${name}" template already exists`);

    await this.templateModel.create({
      name,
      ...orderReturnedTemplate,
    });

    Logger.log('✅ Order-Delivery-Returned email template created (EN & AR)');
  }

  private async seedPasswordChangedSuccessEmail() {
    const name = EmailTemplates.PASSWORD_CHANGED_SUCCESS;
    const exists = await this.templateModel.findOne({ name });

    if (exists) return Logger.log(`✅ "${name}" template already exists`);

    await this.templateModel.create({
      name,
      ...passwordChangedTemplate,
    });

    Logger.log('✅ Password success changed email template created (EN & AR)');
  }

  private async seedEmailVerified() {
    const name = EmailTemplates.EMAIL_IS_VERIFIED;
    const exists = await this.templateModel.findOne({ name });

    if (exists) return Logger.log(`✅ "${name}" template already exists`);

    await this.templateModel.create({
      name,
      ...emailVerifiedTemplate,
    });

    Logger.log('✅ Email verified template created (EN & AR)');
  }
}

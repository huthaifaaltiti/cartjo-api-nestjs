import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailTemplates } from 'src/enums/emailTemplates.enum';
import { EmailTemplate } from 'src/schemas/email-template.schema';
import { userRegistrationTemplate } from './email-templates/user-registration.template';
import { privacyPolicyTemplate } from './email-templates/privacy-policy.template';

@Injectable()
export class EmailTemplateSeeder {
  constructor(
    @InjectModel(EmailTemplate.name)
    private readonly templateModel: Model<EmailTemplate>,
  ) {}

  async seed() {
    await this.seedUserRegistration();
    await this.seedPrivacyPolicyUpdate();
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
}
export const resendVerificationTemplate = {
  subject: {
    en: 'Resend: Verify Your CartJO Account 🔁',
    ar: 'إعادة إرسال: تحقق من حسابك في كارت جو 🔁',
  },
  html: {
    en: `
      <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f8f9fa;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <div style="background-color: white; display: inline-block; padding: 15px 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h1 style="margin: 0; color: #667eea; font-size: 32px; font-weight: bold;">CartJO</h1>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Your Shopping Destination in Jordan</p>
          </div>
        </div>

        <!-- Content -->
        <div style="background-color: white; padding: 40px 30px;">
          <h2 style="color: #333; font-size: 24px; margin: 0 0 10px 0;">Hi {{firstName}}, 👋</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            You recently requested a new verification link for your CartJO account.
            Please verify your email address below to activate your account.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="{{confirmationUrl}}" 
              style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
              Verify My Email
            </a>
          </div>

          <p style="color: #999; font-size: 13px; line-height: 1.5; margin: 25px 0 0 0;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="{{confirmationUrl}}" style="color: #667eea; word-break: break-all;">{{confirmationUrl}}</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 30px 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="color: #999; font-size: 13px; margin: 0;">
            Didn’t request this email? You can safely ignore it.
          </p>
          <p style="color: #666; font-size: 12px; margin: 0;">
            © 2025 CartJO. All rights reserved.<br>Amman, Jordan
          </p>
        </div>
      </div>
    `,

    ar: `
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Cairo', 'Segoe UI', Arial, sans-serif; background-color: #f8f9fa; direction: rtl;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <div style="background-color: white; display: inline-block; padding: 15px 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h1 style="margin: 0; color: #667eea; font-size: 32px; font-weight: bold;">كارت جو</h1>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">وجهتك للتسوق في الأردن</p>
          </div>
        </div>

        <!-- Content -->
        <div style="background-color: white; padding: 40px 30px; text-align: right;">
          <h2 style="color: #333; font-size: 24px; margin: 0 0 10px 0;">مرحبًا {{firstName}} 👋</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
            لقد طلبت مؤخرًا رابط تحقق جديد لحسابك في كارت جو.
            يرجى النقر على الزر أدناه لتفعيل حسابك.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="{{confirmationUrl}}" 
              style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
              تحقق من البريد الإلكتروني
            </a>
          </div>

          <p style="color: #999; font-size: 13px; line-height: 1.7; margin: 25px 0 0 0; text-align: right;">
            إذا لم يعمل الزر، انسخ هذا الرابط والصقه في المتصفح:<br>
            <a href="{{confirmationUrl}}" style="color: #667eea; word-break: break-all; direction: ltr; display: inline-block;">{{confirmationUrl}}</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 30px 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="color: #999; font-size: 13px; margin: 0;">
            لم تطلب هذا البريد؟ يمكنك تجاهله بأمان.
          </p>
          <p style="color: #666; font-size: 12px; margin: 0;">
            © 2025 كارت جو. جميع الحقوق محفوظة.<br>عمّان، الأردن
          </p>
        </div>
      </div>
    `,
  },
};

export const passwordResetSuccessTemplate = {
  subject: {
    en: 'CartJO - Your Password Has Been Reset Successfully ✅',
    ar: 'كارت جو - تم إعادة تعيين كلمة المرور بنجاح ✅',
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
        <div style="background-color: white; padding: 40px 30px; border-radius: 0;">
          <h2 style="color: #333; font-size: 24px; margin: 0 0 15px 0;">Hello {{firstName}},</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
            Your CartJO account password has been <strong>successfully reset</strong>.  
            If you made this change, you can safely ignore this message.
          </p>

          <div style="background-color: #f8f9fa; border-left: 4px solid #4caf50; padding: 15px 20px; margin: 20px 0;">
            <p style="color: #333; font-size: 15px; line-height: 1.6; margin: 0;">
              If you did <strong>not</strong> request this change, please reset your password again immediately and contact our support team.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="{{loginUrl}}" 
              style="display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 10px rgba(102, 126, 234, 0.4);">
              Go to CartJO
            </a>
          </div>

          <p style="color: #999; font-size: 13px; line-height: 1.5; margin: 25px 0 0 0;">
            If the button doesn’t work, copy and paste this link into your browser:<br>
            <a href="{{loginUrl}}" style="color: #667eea; word-break: break-all;">{{loginUrl}}</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 30px 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="color: #999; font-size: 13px; margin: 0 0 10px 0;">
            © 2025 CartJO. All rights reserved.<br>
            Amman, Jordan
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
        <div style="background-color: white; padding: 40px 30px; border-radius: 0; text-align: right;">
          <h2 style="color: #333; font-size: 24px; margin: 0 0 15px 0;">مرحبًا {{firstName}},</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
            تم <strong>إعادة تعيين كلمة المرور</strong> لحسابك في كارت جو بنجاح.  
            إذا قمت بهذا التغيير، يمكنك تجاهل هذه الرسالة بأمان.
          </p>

          <div style="background-color: #f8f9fa; border-right: 4px solid #4caf50; padding: 15px 20px; margin: 20px 0;">
            <p style="color: #333; font-size: 15px; line-height: 1.8; margin: 0;">
              إذا <strong>لم</strong> تقم بهذا التغيير، يرجى إعادة تعيين كلمة المرور فورًا والتواصل مع فريق الدعم.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="{{loginUrl}}" 
              style="display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 10px rgba(102, 126, 234, 0.4);">
              الذهاب إلى كارت جو
            </a>
          </div>

          <p style="color: #999; font-size: 13px; line-height: 1.7; margin: 25px 0 0 0; text-align: right;">
            إذا لم يعمل الزر، انسخ هذا الرابط والصقه في المتصفح:<br>
            <a href="{{loginUrl}}" style="color: #667eea; word-break: break-all; direction: ltr; display: inline-block;">{{loginUrl}}</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 30px 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="color: #999; font-size: 13px; margin: 0;">
            © 2025 كارت جو. جميع الحقوق محفوظة.<br>
            عمّان، الأردن
          </p>
        </div>
      </div>
    `,
  },
};

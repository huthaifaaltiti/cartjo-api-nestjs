export const resetPasswordTemplate = {
  subject: {
    en: 'CartJO - Reset Your Password 🔐',
    ar: 'كارت جو - إعادة تعيين كلمة المرور 🔐',
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
          <h2 style="color: #333; font-size: 24px; margin: 0 0 10px 0;">Hi {{firstName}},</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            We received a request to reset your CartJO account password. To proceed, use the following verification code:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; padding: 20px 40px; background: #f1f3ff; color: #333; border: 2px dashed #667eea; border-radius: 12px; font-size: 28px; font-weight: bold; letter-spacing: 4px;">
              {{resetCode}}
            </div>
          </div>

          <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 20px 0 0 0;">
            This code will expire in <strong>15 minutes</strong>. If you didn’t request this, you can safely ignore this email.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 30px 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="color: #999; font-size: 13px; margin: 0 0 10px 0;">
            Didn’t request a password reset? You can safely ignore this message.
          </p>
          <p style="color: #666; font-size: 12px; margin: 0;">
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
          <h2 style="color: #333; font-size: 24px; margin: 0 0 10px 0;">مرحبًا {{firstName}},</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
            تلقينا طلبًا لإعادة تعيين كلمة مرور حسابك في كارت جو. لاستخدام كلمة مرور جديدة، استخدم رمز التحقق التالي:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; padding: 20px 40px; background: #f1f3ff; color: #333; border: 2px dashed #667eea; border-radius: 12px; font-size: 28px; font-weight: bold; letter-spacing: 4px; direction: ltr;">
              {{resetCode}}
            </div>
          </div>

          <p style="color: #555; font-size: 15px; line-height: 1.8; margin: 20px 0 0 0;">
            سينتهي صلاحية هذا الرمز خلال <strong>15 دقيقة</strong>. إذا لم تطلب ذلك، يمكنك تجاهل هذه الرسالة بأمان.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 30px 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="color: #999; font-size: 13px; margin: 0 0 10px 0;">
            لم تطلب إعادة تعيين كلمة المرور؟ يمكنك تجاهل هذه الرسالة بأمان.
          </p>
          <p style="color: #666; font-size: 12px; margin: 0;">
            © 2025 كارت جو. جميع الحقوق محفوظة.<br>
            عمّان، الأردن
          </p>
        </div>
      </div>
    `,
  },
};

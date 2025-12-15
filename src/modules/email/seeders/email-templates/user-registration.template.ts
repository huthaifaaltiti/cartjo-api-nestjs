export const userRegistrationTemplate = {
  subject: {
    en: 'Welcome to CartJO - Confirm Your Account 🛒',
    ar: 'مرحبًا بك في كارت جو - قم بتأكيد حسابك 🛒',
  },
  html: {
    en: `
      <div style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background-color:#f8f9fa;">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:40px 20px;text-align:center;">
          <div style="background-color:#ffffff;display:inline-block;padding:18px 32px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
            <img
              src="{{logoUrl}}"
              alt="CartJO"
              width="140"
              height="40"
              style="display:block;margin:0 auto 8px auto;border:0;outline:none;"
            />
            <p style="margin:0;color:#666;font-size:12px;">
              Your Shopping Destination in Jordan
            </p>
          </div>
        </div>

        <!-- Content -->
        <div style="background-color:#ffffff;padding:40px 30px;">
          <h2 style="color:#333;font-size:24px;margin:0 0 10px 0;">
            Welcome to CartJO, {{firstName}}! 🎉
          </h2>

          <p style="color:#666;font-size:16px;line-height:1.6;margin:0 0 20px 0;">
            Thank you for joining Jordan's premier online shopping platform.
            You're just one step away from exploring thousands of products at amazing prices!
          </p>

          <div style="background-color:#f8f9fa;border-left:4px solid #667eea;padding:15px 20px;margin:20px 0;">
            <p style="color:#555;font-size:14px;margin:0;line-height:1.5;">
              <strong>Next Step:</strong>
              Please verify your email address to activate your account and start shopping.
            </p>
          </div>

          <div style="text-align:center;margin:30px 0;">
            <a
              href="{{confirmationUrl}}"
              style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#ffffff;text-decoration:none;border-radius:8px;font-size:16px;font-weight:600;box-shadow:0 4px 12px rgba(102,126,234,0.4);"
            >
              Confirm My Email Address
            </a>
          </div>

          <p style="color:#999;font-size:13px;line-height:1.5;margin:25px 0 0 0;">
            If the button doesn't work, copy and paste this link into your browser:<br />
            <a href="{{confirmationUrl}}" style="color:#667eea;word-break:break-all;">
              {{confirmationUrl}}
            </a>
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color:#f8f9fa;padding:30px 20px;text-align:center;border-top:1px solid #e9ecef;">
          <p style="color:#999;font-size:13px;margin:0 0 10px 0;">
            Didn't create an account? You can safely ignore this email.
          </p>
          <p style="color:#666;font-size:12px;margin:0;">
            © 2025 CartJO. All rights reserved.<br />
            Amman, Jordan
          </p>
        </div>
      </div>
    `,
    ar: `
      <div style="max-width:600px;margin:0 auto;font-family:'Cairo','Segoe UI',Arial,sans-serif;background-color:#f8f9fa;direction:rtl;">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:40px 20px;text-align:center;">
          <div style="background-color:#ffffff;display:inline-block;padding:18px 32px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
            <img
              src="{{logoUrl}}"
              alt="كارت جو"
              width="140"
              height="40"
              style="display:block;margin:0 auto 8px auto;border:0;outline:none;"
            />
            <p style="margin:0;color:#666;font-size:12px;">
              وجهتك للتسوق في الأردن
            </p>
          </div>
        </div>

        <!-- Content -->
        <div style="background-color:#ffffff;padding:40px 30px;text-align:right;">
          <h2 style="color:#333;font-size:24px;margin:0 0 10px 0;">
            مرحبًا بك في كارت جو، {{firstName}}! 🎉
          </h2>

          <p style="color:#666;font-size:16px;line-height:1.8;margin:0 0 20px 0;">
            شكرًا لانضمامك إلى منصة التسوق الإلكتروني الرائدة في الأردن.
            أنت على بُعد خطوة واحدة من استكشاف آلاف المنتجات بأسعار مذهلة!
          </p>

          <div style="background-color:#f8f9fa;border-right:4px solid #667eea;padding:15px 20px;margin:20px 0;">
            <p style="color:#555;font-size:14px;margin:0;line-height:1.7;">
              <strong>الخطوة التالية:</strong>
              يرجى التحقق من بريدك الإلكتروني لتفعيل حسابك والبدء بالتسوق.
            </p>
          </div>

          <div style="text-align:center;margin:30px 0;">
            <a
              href="{{confirmationUrl}}"
              style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#ffffff;text-decoration:none;border-radius:8px;font-size:16px;font-weight:600;box-shadow:0 4px 12px rgba(102,126,234,0.4);"
            >
              تأكيد البريد الإلكتروني
            </a>
          </div>

          <p style="color:#999;font-size:13px;line-height:1.7;margin:25px 0 0 0;">
            إذا لم يعمل الزر، انسخ هذا الرابط والصقه في المتصفح:<br />
            <a
              href="{{confirmationUrl}}"
              style="color:#667eea;word-break:break-all;direction:ltr;display:inline-block;"
            >
              {{confirmationUrl}}
            </a>
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color:#f8f9fa;padding:30px 20px;text-align:center;border-top:1px solid #e9ecef;">
          <p style="color:#999;font-size:13px;margin:0 0 10px 0;">
            لم تقم بإنشاء حساب؟ يمكنك تجاهل هذه الرسالة بأمان.
          </p>
          <p style="color:#666;font-size:12px;margin:0;">
            © 2025 كارت جو. جميع الحقوق محفوظة.<br />
            عمّان، الأردن
          </p>
        </div>
      </div>
    `,
  },
};

export const userRegistrationTemplate = {
  subject: {
    en: 'Welcome to CartJO 👋 - Verify Your Email & Start Shopping!',
    ar: 'مرحبًا بك في كارت جو 👋 - قم بتفعيل حسابك وابدأ التسوق!',
  },
  html: {
    en: `<div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',Arial,sans-serif;background-color:#f8f9fa;direction:ltr;">
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
            Your daily shopping made easy in Jordan
         </p>
      </div>
   </div>
   <!-- Content -->
   <div style="background-color:#ffffff;padding:40px 30px;text-align:left;">
      <h2 style="color:#333;font-size:24px;margin:0 0 10px 0;">
         Welcome to CartJO, {{firstName}}! 🎉
      </h2>
      <p style="color:#666;font-size:16px;line-height:1.8;margin:0 0 20px 0;">
         Thank you for joining Jordan’s leading online shopping platform.
         You’re just one step away from discovering a wide range of products at amazing prices!
      </p>
      <div style="background-color:#f8f9fa;border-left:4px solid #667eea;padding:15px 20px;margin:20px 0;">
         <p style="color:#555;font-size:14px;margin:0;line-height:1.7;">
            <strong>Next step:</strong>
            Please verify the email address you used during registration to activate your account and start shopping.
         </p>
      </div>
      <div style="text-align:center;margin:30px 0;">
         <a
            href="{{confirmationUrl}}"
            style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#ffffff;text-decoration:none;border-radius:8px;font-size:16px;font-weight:600;box-shadow:0 4px 12px rgba(102,126,234,0.4);"
            >
         Confirm Email Address
         </a>
      </div>
      <p style="color:#999;font-size:13px;line-height:1.7;margin:25px 0 0 0;">
         If the button doesn’t work, copy and paste this link into your browser:<br />
         <a
            href="{{confirmationUrl}}"
            style="color:#667eea;word-break:break-all;display:inline-block;"
            >
         {{confirmationUrl}}
         </a>
      </p>
   </div>
   <!-- Footer -->
   <div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',Arial,sans-serif;background-color:#f8f9fa;direction:ltr;">
      <div style="background-color:#ffffff;text-align:left;">
         <!-- Help Section -->
         <div style="text-align:center;padding:20px;background-color:#f8f9fa;border-radius:12px;">
            <p style="color:#555;font-size:14px;margin:0 0 12px 0;">
               <span style="font-size:20px;">💬</span> Need help?
            </p>
            <p style="color:#666;font-size:13px;margin:0;line-height:1.8;">
               Contact our support team via email at
               <a href="mailto:{{appUsersSupportEmail}}" style="color:#764ba2;text-decoration:none;font-weight:600;">
               {{appUsersSupportEmail}}
               </a><br/>
               or reach us on WhatsApp at
               <a href="{{whatsappLink}}" style="color:#764ba2;text-decoration:none;font-weight:600;">
               {{whatsappNumber}}
               </a>
            </p>
         </div>
         <!-- Social Media -->
      <div style="text-align:center;padding:24px 0;border-top:1px solid #e9ecef;margin-top:24px;">
         <p style="color:#666;font-size:14px;margin:0 0 16px 0;font-weight:600;">
            تابعنا للحصول على عروض حصرية! 🎉
         </p>
         <div>
            <a href="{{xLink}}" style="margin:0 5px;text-decoration:none;">
               <img
                src="{{xIconPath}}"
                width="16"
                height="16"
                alt="X Icon"
                style="display:inline-block;border:0;"
                style="display:block;margin:0;border:0;outline:none;"
               />
            </a>
            <a href="{{facebookLink}}" style="margin:0 5px;text-decoration:none;">
              <img
                src="{{facebookIconPath}}"
                width="16"
                height="16"
                alt="Facebook Icon"
                style="display:inline-block;border:0;"
                style="display:block;margin:0;border:0;outline:none;"
              />
            </a>
            <a href="{{instagramLink}}" style="margin:0 5px;text-decoration:none;">
              <img
                src="{{instagramIconPath}}"
                width="16"
                height="16"
                alt="Instagram Icon"
                style="display:inline-block;border:0;"
                style="display:block;margin:0;border:0;outline:none;"
              />
            </a>
            <a href="{{snapchatLink}}" style="margin:0 5px;text-decoration:none;">
               <img
                src="{{snapchatIconPath}}"
                width="16"
                height="16"
                alt="Snapchat Icon"
                style="display:inline-block;border:0;"
                style="display:block;margin:0;border:0;outline:none;"
              />
            </a>
            <a href="{{linkedInLink}}" style="margin:0 5px;text-decoration:none;">
               <img
                src="{{linkedinIconPath}}"
                width="16"
                height="16"
                alt="Linkedin Icon"
                style="display:inline-block;border:0;"
                style="display:block;margin:0;border:0;outline:none;"
              />
            </a>
            <a href="{{tiktokLink}}" style="margin:0 5px;text-decoration:none;">
               <img
                src="{{tiktokIconPath}}"
                width="16"
                height="16"
                alt="Tiktok Icon"
                style="display:inline-block;border:0;"
                style="display:block;margin:0;border:0;outline:none;"
              />
            </a>
         </div>
      </div>
      
         <!-- Footer Bottom -->
         <div style="background-color:#f8f9fa;padding:30px 20px;text-align:center;border-top:1px solid #e9ecef;">
            <p style="color:#666;font-size:12px;margin:0;">
               © 2025 CartJO. All rights reserved.<br />
               Amman, Jordan
            </p>
         </div>
      </div>
   </div>
</div>
</div>`,
    ar: `<div style="max-width:600px;margin:0 auto;font-family:'Cairo','Segoe UI',Arial,sans-serif;background-color:#f8f9fa;direction:rtl;">
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
         تسوّقك اليومي أصبح سهلاً في الأردن               
      </p>
   </div>
</div>
<!-- Content -->
<div style="background-color:#ffffff;padding:40px 30px;text-align:right;">
<h2 style="color:#333;font-size:24px;margin:0 0 10px 0;">
   مرحبًا بك في كارت جو، {{firstName}}! 🎉
</h2>
<p style="color:#666;font-size:16px;line-height:1.8;margin:0 0 20px 0;">
   شكرًا لانضمامك لمنصة التّسوق الإلكتروني الرائدة في الأردن.
   أنت على بُعد خطوة واحدة من استكشاف العديد من المنتجات بأسعار مذهلة!
</p>
<div style="background-color:#f8f9fa;border-right:4px solid #667eea;padding:15px 20px;margin:20px 0;">
   <p style="color:#555;font-size:14px;margin:0;line-height:1.7;">
      <strong>الخطوة التالية:</strong>
      يرجى التّحقُّق من بريدك الإلكتروني المستخدم للتسجيل معنا، لتفعيل حسابك والبدء بالتّسوق.
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
   إذا لم يعمل الزر، انسخ هذا الرابط وألصقه في المتصفح:<br />
   <a
      href="{{confirmationUrl}}"
      style="color:#667eea;word-break:break-all;direction:ltr;display:inline-block;"
      >
   {{confirmationUrl}}
   </a>
</p>
<p style="color:#999;font-size:18px;font-weight:bold;margin:20px 0;">
   لم تقم بإنشاء حساب؟ يمكنك تجاهل هذه الرسالة بأمان.
</p>
<div>
</div>

<!-- Footer -->
<div style="max-width:600px;margin:0 auto;font-family:'Cairo','Segoe UI',Arial,sans-serif;background-color:#f8f9fa;direction:rtl;">
   <div style="background-color:#ffffff;text-align:right;">
      <!-- Help Section -->
      <div style="text-align:center;padding:20px;background-color:#f8f9fa;border-radius:12px;">
         <p style="color:#555;font-size:14px;margin:0 0 12px 0;">
            <span style="font-size:20px;">💬</span> تحتاج مساعدة؟
         </p>
         <p style="color:#666;font-size:13px;margin:0;line-height:1.8;">
            تواصل مع فريق الدعم من خلال البريد الإلكتروني <a href="mailto:{{appUsersSupportEmail}}" style="color:#764ba2;text-decoration:none;font-weight:600;">{{appUsersSupportEmail}}</a><br/>
            أو عبر تطبيق واتساب من خلال <a href="{{whatsappLink}}" style="color:#764ba2;text-decoration:none;font-weight:600;">{{whatsappNumber}}</a>
         </p>
      </div>
      <!-- Social Media -->
      <div style="text-align:center;padding:24px 0;border-top:1px solid #e9ecef;margin-top:24px;">
         <p style="color:#666;font-size:14px;margin:0 0 16px 0;font-weight:600;">
            تابعنا للحصول على عروض حصرية! 🎉
         </p>
         <div>
            <a href="{{xLink}}" style="margin:0 5px;text-decoration:none;">
               <img
                src="{{xIconPath}}"
                width="16"
                height="16"
                alt="X Icon"
                style="display:inline-block;border:0;"
                style="display:block;margin:0;border:0;outline:none;"
               />
            </a>
            <a href="{{facebookLink}}" style="margin:0 5px;text-decoration:none;">
              <img
                src="{{facebookIconPath}}"
                width="16"
                height="16"
                alt="Facebook Icon"
                style="display:inline-block;border:0;"
                style="display:block;margin:0;border:0;outline:none;"
              />
            </a>
            <a href="{{instagramLink}}" style="margin:0 5px;text-decoration:none;">
              <img
                src="{{instagramIconPath}}"
                width="16"
                height="16"
                alt="Instagram Icon"
                style="display:inline-block;border:0;"
                style="display:block;margin:0;border:0;outline:none;"
              />
            </a>
            <a href="{{snapchatLink}}" style="margin:0 5px;text-decoration:none;">
               <img
                src="{{snapchatIconPath}}"
                width="16"
                height="16"
                alt="Snapchat Icon"
                style="display:inline-block;border:0;"
                style="display:block;margin:0;border:0;outline:none;"
              />
            </a>
            <a href="{{linkedInLink}}" style="margin:0 5px;text-decoration:none;">
               <img
                src="{{linkedinIconPath}}"
                width="16"
                height="16"
                alt="Linkedin Icon"
                style="display:inline-block;border:0;"
                style="display:block;margin:0;border:0;outline:none;"
              />
            </a>
            <a href="{{tiktokLink}}" style="margin:0 5px;text-decoration:none;">
               <img
                src="{{tiktokIconPath}}"
                width="16"
                height="16"
                alt="Tiktok Icon"
                style="display:inline-block;border:0;"
                style="display:block;margin:0;border:0;outline:none;"
              />
            </a>
         </div>
      </div>
      
      <!-- Footer -->
      <div style="background-color:#f8f9fa;padding:30px 20px;text-align:center;border-top:1px solid #e9ecef;">
         <p style="color:#666;font-size:12px;margin:0;">
            © 2025 كارت جو. جميع الحقوق محفوظة.<br />
            عمّان، الأردن
         </p>
      </div>
   </div>
</div>`,
  },
};

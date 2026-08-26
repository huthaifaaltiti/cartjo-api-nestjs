export const creatorRegistrationTemplate = {
  subject: {
    en: 'Welcome to CartJO Creators 👋 - Verify Your Email & Get Started!',
    ar: 'مرحبًا بك في كارت جو للمبدعين 👋 - قم بتفعيل حسابك للبدء!',
  },
  html: {
    en: `<div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',Arial,sans-serif;background-color:#f4f3fb;direction:ltr;">
   <!-- Header -->
   <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:36px 20px 44px 20px;text-align:center;">
      <div style="background-color:#ffffff;display:inline-block;padding:16px 30px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
         <img
            src="{{logoUrl}}"
            alt="CartJO Creators"
            width="140"
            height="40"
            style="display:block;margin:0 auto 6px auto;border:0;outline:none;"
            />
         <p style="margin:0;color:#666;font-size:12px;">
            Tell your story on Jordan's leading platform
         </p>
      </div>
   </div>

   <!-- Content card, overlapping header for a modern feel -->
   <div style="background-color:#ffffff;padding:36px 30px 28px 30px;text-align:left;margin:-24px 16px 0 16px;border-radius:16px;box-shadow:0 6px 20px rgba(102,126,234,0.10);position:relative;">
      <div style="text-align:center;font-size:40px;line-height:1;margin:0 0 12px 0;">🎉</div>
      <h2 style="color:#2d2a3d;font-size:22px;margin:0 0 8px 0;text-align:center;">
         Welcome, {{firstName}}!
      </h2>
      <p style="color:#666;font-size:15px;line-height:1.7;margin:0 0 24px 0;text-align:center;">
         Thanks for joining CartJO Creators. Just one quick step and you're ready to start sharing your passion.
      </p>

      <!-- 3-step progress tracker -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px 0;">
        <tr>
          <td width="33%" align="center" style="vertical-align:top;">
            <div style="width:36px;height:36px;line-height:36px;border-radius:50%;background-color:#667eea;color:#ffffff;font-size:15px;font-weight:700;margin:0 auto 8px auto;">1</div>
            <p style="margin:0;color:#2d2a3d;font-size:12px;font-weight:600;">Verify email</p>
            <p style="margin:2px 0 0 0;color:#999;font-size:11px;">You're here</p>
          </td>
          <td width="33%" align="center" style="vertical-align:top;">
            <div style="width:36px;height:36px;line-height:36px;border-radius:50%;background-color:#e9e6f7;color:#8b85b5;font-size:15px;font-weight:700;margin:0 auto 8px auto;">2</div>
            <p style="margin:0;color:#999;font-size:12px;font-weight:600;">Set up profile</p>
          </td>
          <td width="33%" align="center" style="vertical-align:top;">
            <div style="width:36px;height:36px;line-height:36px;border-radius:50%;background-color:#e9e6f7;color:#8b85b5;font-size:15px;font-weight:700;margin:0 auto 8px auto;">3</div>
            <p style="margin:0;color:#999;font-size:12px;font-weight:600;">Start creating</p>
          </td>
        </tr>
      </table>

      <div style="text-align:center;margin:0 0 8px 0;">
         <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
           <tr>
             <td bgcolor="#667eea" style="border-radius:8px;text-align:center;">
               <a
                 href="{{confirmationUrl}}"
                 style="display:inline-block;padding:16px 44px;font-size:16px;font-weight:600;font-family:'Segoe UI',Arial,sans-serif;color:#ffffff;text-decoration:none;line-height:1.2;"
               >
                 Confirm Email Address
               </a>
             </td>
           </tr>
         </table>
      </div>
      <p style="color:#999;font-size:12px;text-align:center;margin:10px 0 0 0;">
         This link expires in 24 hours.
      </p>

      <p style="color:#999;font-size:13px;line-height:1.7;margin:24px 0 0 0;text-align:center;">
         Button not working? Copy and paste this link into your browser:<br />
         <a href="{{confirmationUrl}}" style="color:#667eea;word-break:break-all;">{{confirmationUrl}}</a>
      </p>

      <p style="color:#aaa;font-size:12px;text-align:center;margin:20px 0 0 0;">
         Didn't create this account? You can safely ignore this email.
      </p>
   </div>

   <!-- Footer -->
   <div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',Arial,sans-serif;">
      <!-- Help Section -->
      <div style="text-align:center;padding:24px 20px;margin:20px 16px 0 16px;background-color:#ffffff;border-radius:12px;">
         <p style="color:#555;font-size:14px;margin:0 0 12px 0;">
            <span style="font-size:20px;">💬</span> Need help?
         </p>
         <p style="color:#666;font-size:13px;margin:0;line-height:1.8;">
            Email our support team at
            <a href="mailto:{{appUsersSupportEmail}}" style="color:#764ba2;text-decoration:none;font-weight:600;">{{appUsersSupportEmail}}</a><br/>
            or reach us on WhatsApp at
            <a href="{{whatsappLink}}" style="color:#764ba2;text-decoration:none;font-weight:600;">{{whatsappNumber}}</a>
         </p>
      </div>

      <!-- Social Media -->
      <div style="text-align:center;padding:24px 0 8px 0;margin-top:8px;">
         <p style="color:#666;font-size:13px;margin:0 0 14px 0;font-weight:600;">
           Follow our channels 🎉
         </p>
         <div>
            <a href="{{xLink}}" style="margin:0 6px;text-decoration:none;">
               <img src="{{xIconPath}}" width="18" height="18" alt="X Icon" style="display:inline-block;border:0;" />
            </a>
            <a href="{{facebookLink}}" style="margin:0 6px;text-decoration:none;">
              <img src="{{facebookIconPath}}" width="18" height="18" alt="Facebook Icon" style="display:inline-block;border:0;" />
            </a>
            <a href="{{instagramLink}}" style="margin:0 6px;text-decoration:none;">
              <img src="{{instagramIconPath}}" width="18" height="18" alt="Instagram Icon" style="display:inline-block;border:0;" />
            </a>
            <a href="{{snapchatLink}}" style="margin:0 6px;text-decoration:none;">
               <img src="{{snapchatIconPath}}" width="18" height="18" alt="Snapchat Icon" style="display:inline-block;border:0;" />
            </a>
            <a href="{{linkedInLink}}" style="margin:0 6px;text-decoration:none;">
               <img src="{{linkedinIconPath}}" width="18" height="18" alt="Linkedin Icon" style="display:inline-block;border:0;" />
            </a>
            <a href="{{tiktokLink}}" style="margin:0 6px;text-decoration:none;">
               <img src="{{tiktokIconPath}}" width="18" height="18" alt="Tiktok Icon" style="display:inline-block;border:0;" />
            </a>
         </div>
      </div>

      <!-- Footer Bottom -->
      <div style="padding:22px 20px 30px 20px;text-align:center;">
         <p style="color:#999;font-size:12px;margin:0;">
            {{copyRightsEn}}
         </p>
      </div>
   </div>
</div>`,
    ar: `<div style="max-width:600px;margin:0 auto;font-family:'Cairo','Segoe UI',Arial,sans-serif;background-color:#f4f3fb;direction:rtl;">
   <!-- Header -->
   <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:36px 20px 44px 20px;text-align:center;">
      <div style="background-color:#ffffff;display:inline-block;padding:16px 30px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
         <img
            src="{{logoUrl}}"
            alt="كارت جو للمبدعين"
            width="140"
            height="40"
            style="display:block;margin:0 auto 6px auto;border:0;outline:none;"
            />
         <p style="margin:0;color:#666;font-size:12px;">
            شارك قصتك عبر منصتنا الرائدة في الأردن
         </p>
      </div>
   </div>

   <!-- Content card -->
   <div style="background-color:#ffffff;padding:36px 30px 28px 30px;text-align:right;margin:-24px 16px 0 16px;border-radius:16px;box-shadow:0 6px 20px rgba(102,126,234,0.10);position:relative;">
      <div style="text-align:center;font-size:40px;line-height:1;margin:0 0 12px 0;">🎉</div>
      <h2 style="color:#2d2a3d;font-size:22px;margin:0 0 8px 0;text-align:center;">
         أهلًا بك، {{firstName}}!
      </h2>
      <p style="color:#666;font-size:15px;line-height:1.7;margin:0 0 24px 0;text-align:center;">
         شكرًا لانضمامك إلى كارت جو للمبدعين. خطوة واحدة فقط تفصلك عن مشاركة شغفك مع الجميع.
      </p>

      <!-- شريط الخطوات الثلاث -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px 0;">
        <tr>
          <td width="33%" align="center" style="vertical-align:top;">
            <div style="width:36px;height:36px;line-height:36px;border-radius:50%;background-color:#667eea;color:#ffffff;font-size:15px;font-weight:700;margin:0 auto 8px auto;">١</div>
            <p style="margin:0;color:#2d2a3d;font-size:12px;font-weight:600;">تفعيل البريد</p>
            <p style="margin:2px 0 0 0;color:#999;font-size:11px;">أنت هنا الآن</p>
          </td>
          <td width="33%" align="center" style="vertical-align:top;">
            <div style="width:36px;height:36px;line-height:36px;border-radius:50%;background-color:#e9e6f7;color:#8b85b5;font-size:15px;font-weight:700;margin:0 auto 8px auto;">٢</div>
            <p style="margin:0;color:#999;font-size:12px;font-weight:600;">إعداد الملف الشخصي</p>
          </td>
          <td width="33%" align="center" style="vertical-align:top;">
            <div style="width:36px;height:36px;line-height:36px;border-radius:50%;background-color:#e9e6f7;color:#8b85b5;font-size:15px;font-weight:700;margin:0 auto 8px auto;">٣</div>
            <p style="margin:0;color:#999;font-size:12px;font-weight:600;">ابدأ الإبداع</p>
          </td>
        </tr>
      </table>

      <div style="text-align:center;margin:0 0 8px 0;">
         <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
           <tr>
             <td bgcolor="#667eea" style="border-radius:8px;text-align:center;">
               <a
                 href="{{confirmationUrl}}"
                 style="display:inline-block;padding:16px 44px;font-size:16px;font-weight:600;font-family:'Cairo','Segoe UI',Arial,sans-serif;color:#ffffff;text-decoration:none;line-height:1.2;"
               >
                 تأكيد البريد الإلكتروني
               </a>
             </td>
           </tr>
         </table>
      </div>
      <p style="color:#999;font-size:12px;text-align:center;margin:10px 0 0 0;">
         ينتهي صلاحية هذا الرابط خلال 24 ساعة.
      </p>

      <p style="color:#999;font-size:13px;line-height:1.7;margin:24px 0 0 0;text-align:center;">
         إذا لم يعمل الزر، انسخ الرابط التالي وألصقه في المتصفح:<br />
         <a href="{{confirmationUrl}}" style="color:#667eea;word-break:break-all;direction:ltr;display:inline-block;">{{confirmationUrl}}</a>
      </p>

      <p style="color:#aaa;font-size:12px;text-align:center;margin:20px 0 0 0;">
         لم تقم بإنشاء هذا الحساب؟ يمكنك تجاهل هذه الرسالة بأمان.
      </p>
   </div>

   <!-- Footer -->
   <div style="max-width:600px;margin:0 auto;font-family:'Cairo','Segoe UI',Arial,sans-serif;">
      <!-- Help Section -->
      <div style="text-align:center;padding:24px 20px;margin:20px 16px 0 16px;background-color:#ffffff;border-radius:12px;">
         <p style="color:#555;font-size:14px;margin:0 0 12px 0;">
            <span style="font-size:20px;">💬</span> تحتاج مساعدة؟
         </p>
         <p style="color:#666;font-size:13px;margin:0;line-height:1.8;">
            تواصل مع فريق الدعم عبر البريد الإلكتروني
            <a href="mailto:{{appUsersSupportEmail}}" style="color:#764ba2;text-decoration:none;font-weight:600;">{{appUsersSupportEmail}}</a><br/>
            أو عبر واتساب على
            <a href="{{whatsappLink}}" style="color:#764ba2;text-decoration:none;font-weight:600;">{{whatsappNumber}}</a>
         </p>
      </div>

      <!-- Social Media -->
      <div style="text-align:center;padding:24px 0 8px 0;margin-top:8px;">
         <p style="color:#666;font-size:13px;margin:0 0 14px 0;font-weight:600;">
            تابعنا للحصول على عروض حصرية! 🎉
         </p>
         <div>
            <a href="{{xLink}}" style="margin:0 6px;text-decoration:none;">
               <img src="{{xIconPath}}" width="18" height="18" alt="X Icon" style="display:inline-block;border:0;" />
            </a>
            <a href="{{facebookLink}}" style="margin:0 6px;text-decoration:none;">
              <img src="{{facebookIconPath}}" width="18" height="18" alt="Facebook Icon" style="display:inline-block;border:0;" />
            </a>
            <a href="{{instagramLink}}" style="margin:0 6px;text-decoration:none;">
              <img src="{{instagramIconPath}}" width="18" height="18" alt="Instagram Icon" style="display:inline-block;border:0;" />
            </a>
            <a href="{{snapchatLink}}" style="margin:0 6px;text-decoration:none;">
               <img src="{{snapchatIconPath}}" width="18" height="18" alt="Snapchat Icon" style="display:inline-block;border:0;" />
            </a>
            <a href="{{linkedInLink}}" style="margin:0 6px;text-decoration:none;">
               <img src="{{linkedinIconPath}}" width="18" height="18" alt="Linkedin Icon" style="display:inline-block;border:0;" />
            </a>
            <a href="{{tiktokLink}}" style="margin:0 6px;text-decoration:none;">
               <img src="{{tiktokIconPath}}" width="18" height="18" alt="Tiktok Icon" style="display:inline-block;border:0;" />
            </a>
         </div>
      </div>

      <!-- Footer Bottom -->
      <div style="padding:22px 20px 30px 20px;text-align:center;">
         <p style="color:#999;font-size:12px;margin:0;">
           {{copyRightsAr}}
         </p>
      </div>
   </div>
</div>`,
  },
};

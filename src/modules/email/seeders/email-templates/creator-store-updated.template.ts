export const creatorStoreUpdatedTemplate = {
  subject: {
    en: 'Your CartJO store details were updated',
    ar: 'تم تحديث بيانات متجرك على كارت جو',
  },
  html: {
    en: `<div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',Arial,sans-serif;background-color:#f4f3fb;direction:ltr;">
   <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:36px 20px 44px 20px;text-align:center;">
      <div style="background-color:#ffffff;display:inline-block;padding:16px 30px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
         <img src="{{logoUrl}}" alt="CartJO Creators" width="140" height="40" style="display:block;margin:0 auto 6px auto;border:0;outline:none;" />
         <p style="margin:0;color:#666;font-size:12px;">Store settings update</p>
      </div>
   </div>

   <div style="background-color:#ffffff;padding:36px 30px 28px 30px;text-align:left;margin:-24px 16px 0 16px;border-radius:16px;box-shadow:0 6px 20px rgba(102,126,234,0.10);">
      <div style="text-align:center;font-size:40px;line-height:1;margin:0 0 12px 0;">✏️</div>
      <h2 style="color:#2d2a3d;font-size:22px;margin:0 0 8px 0;text-align:center;">Store details updated</h2>
      <p style="color:#666;font-size:15px;line-height:1.7;margin:0 0 8px 0;text-align:center;">
         Hi {{firstName}}, the following changes were saved to <strong>{{storeName}}</strong> on {{changedAt}}.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #ece9f7;border-radius:12px;overflow:hidden;margin:20px 0 24px 0;">
         <tr>
            <td style="padding:10px 16px;background:#faf9ff;color:#8b85b5;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">Field</td>
            <td style="padding:10px 16px;background:#faf9ff;color:#8b85b5;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">Change</td>
         </tr>
         {{changesRows}}
      </table>

      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:14px 16px;margin:0 0 24px 0;">
         <p style="color:#9a3412;font-size:13px;line-height:1.7;margin:0;">
            🔐 If you did not make these changes, secure your account and contact support right away.
         </p>
      </div>

      <div style="text-align:center;margin:0 0 8px 0;">
         <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>
            <td bgcolor="#667eea" style="border-radius:8px;text-align:center;">
               <a href="{{dashboardUrl}}" style="display:inline-block;padding:16px 44px;font-size:16px;font-weight:600;font-family:'Segoe UI',Arial,sans-serif;color:#ffffff;text-decoration:none;line-height:1.2;">Review store settings</a>
            </td>
         </tr></table>
      </div>
   </div>

   <div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',Arial,sans-serif;">
      <div style="text-align:center;padding:24px 20px;margin:20px 16px 0 16px;background-color:#ffffff;border-radius:12px;">
         <p style="color:#555;font-size:14px;margin:0 0 12px 0;"><span style="font-size:20px;">💬</span> Need help?</p>
         <p style="color:#666;font-size:13px;margin:0;line-height:1.8;">
            Email our support team at <a href="mailto:{{appUsersSupportEmail}}" style="color:#764ba2;text-decoration:none;font-weight:600;">{{appUsersSupportEmail}}</a><br/>
            or reach us on WhatsApp at <a href="{{whatsappLink}}" style="color:#764ba2;text-decoration:none;font-weight:600;">{{whatsappNumber}}</a>
         </p>
      </div>
      <div style="text-align:center;padding:24px 0 8px 0;margin-top:8px;">
         <p style="color:#666;font-size:13px;margin:0 0 14px 0;font-weight:600;">Follow our channels 🎉</p>
         <div>
            <a href="{{xLink}}" style="margin:0 6px;text-decoration:none;"><img src="{{xIconPath}}" width="18" height="18" alt="X" style="display:inline-block;border:0;" /></a>
            <a href="{{facebookLink}}" style="margin:0 6px;text-decoration:none;"><img src="{{facebookIconPath}}" width="18" height="18" alt="Facebook" style="display:inline-block;border:0;" /></a>
            <a href="{{instagramLink}}" style="margin:0 6px;text-decoration:none;"><img src="{{instagramIconPath}}" width="18" height="18" alt="Instagram" style="display:inline-block;border:0;" /></a>
            <a href="{{tiktokLink}}" style="margin:0 6px;text-decoration:none;"><img src="{{tiktokIconPath}}" width="18" height="18" alt="TikTok" style="display:inline-block;border:0;" /></a>
         </div>
      </div>
      <div style="padding:22px 20px 30px 20px;text-align:center;"><p style="color:#999;font-size:12px;margin:0;">{{copyRightsEn}}</p></div>
   </div>
</div>`,
    ar: `<div style="max-width:600px;margin:0 auto;font-family:'Cairo','Segoe UI',Arial,sans-serif;background-color:#f4f3fb;direction:rtl;">
   <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:36px 20px 44px 20px;text-align:center;">
      <div style="background-color:#ffffff;display:inline-block;padding:16px 30px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
         <img src="{{logoUrl}}" alt="كارت جو للمبدعين" width="140" height="40" style="display:block;margin:0 auto 6px auto;border:0;outline:none;" />
         <p style="margin:0;color:#666;font-size:12px;">تحديث إعدادات المتجر</p>
      </div>
   </div>

   <div style="background-color:#ffffff;padding:36px 30px 28px 30px;text-align:right;margin:-24px 16px 0 16px;border-radius:16px;box-shadow:0 6px 20px rgba(102,126,234,0.10);">
      <div style="text-align:center;font-size:40px;line-height:1;margin:0 0 12px 0;">✏️</div>
      <h2 style="color:#2d2a3d;font-size:22px;margin:0 0 8px 0;text-align:center;">تم تحديث بيانات المتجر</h2>
      <p style="color:#666;font-size:15px;line-height:1.7;margin:0 0 8px 0;text-align:center;">
         مرحبًا {{firstName}}، تم حفظ التغييرات التالية على <strong>{{storeName}}</strong> بتاريخ {{changedAt}}.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #ece9f7;border-radius:12px;overflow:hidden;margin:20px 0 24px 0;">
         <tr>
            <td style="padding:10px 16px;background:#faf9ff;color:#8b85b5;font-size:12px;font-weight:700;">الحقل</td>
            <td style="padding:10px 16px;background:#faf9ff;color:#8b85b5;font-size:12px;font-weight:700;">التغيير</td>
         </tr>
         {{changesRows}}
      </table>

      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:14px 16px;margin:0 0 24px 0;">
         <p style="color:#9a3412;font-size:13px;line-height:1.7;margin:0;">
            🔐 إذا لم تقم بهذه التغييرات، بادر بتأمين حسابك وتواصل مع الدعم فورًا.
         </p>
      </div>

      <div style="text-align:center;margin:0 0 8px 0;">
         <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>
            <td bgcolor="#667eea" style="border-radius:8px;text-align:center;">
               <a href="{{dashboardUrl}}" style="display:inline-block;padding:16px 44px;font-size:16px;font-weight:600;font-family:'Cairo','Segoe UI',Arial,sans-serif;color:#ffffff;text-decoration:none;line-height:1.2;">مراجعة إعدادات المتجر</a>
            </td>
         </tr></table>
      </div>
   </div>

   <div style="max-width:600px;margin:0 auto;font-family:'Cairo','Segoe UI',Arial,sans-serif;">
      <div style="text-align:center;padding:24px 20px;margin:20px 16px 0 16px;background-color:#ffffff;border-radius:12px;">
         <p style="color:#555;font-size:14px;margin:0 0 12px 0;"><span style="font-size:20px;">💬</span> تحتاج مساعدة؟</p>
         <p style="color:#666;font-size:13px;margin:0;line-height:1.8;">
            تواصل مع فريق الدعم عبر البريد <a href="mailto:{{appUsersSupportEmail}}" style="color:#764ba2;text-decoration:none;font-weight:600;">{{appUsersSupportEmail}}</a><br/>
            أو عبر واتساب على <a href="{{whatsappLink}}" style="color:#764ba2;text-decoration:none;font-weight:600;">{{whatsappNumber}}</a>
         </p>
      </div>
      <div style="text-align:center;padding:24px 0 8px 0;margin-top:8px;">
         <p style="color:#666;font-size:13px;margin:0 0 14px 0;font-weight:600;">تابعنا 🎉</p>
         <div>
            <a href="{{xLink}}" style="margin:0 6px;text-decoration:none;"><img src="{{xIconPath}}" width="18" height="18" alt="X" style="display:inline-block;border:0;" /></a>
            <a href="{{facebookLink}}" style="margin:0 6px;text-decoration:none;"><img src="{{facebookIconPath}}" width="18" height="18" alt="Facebook" style="display:inline-block;border:0;" /></a>
            <a href="{{instagramLink}}" style="margin:0 6px;text-decoration:none;"><img src="{{instagramIconPath}}" width="18" height="18" alt="Instagram" style="display:inline-block;border:0;" /></a>
            <a href="{{tiktokLink}}" style="margin:0 6px;text-decoration:none;"><img src="{{tiktokIconPath}}" width="18" height="18" alt="TikTok" style="display:inline-block;border:0;" /></a>
         </div>
      </div>
      <div style="padding:22px 20px 30px 20px;text-align:center;"><p style="color:#999;font-size:12px;margin:0;">{{copyRightsAr}}</p></div>
   </div>
</div>`,
  },
};

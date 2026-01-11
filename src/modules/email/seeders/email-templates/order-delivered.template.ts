export const orderDeliveredTemplate = {
  subject: {
    en: '✅ Your Order Has Been Delivered!',
    ar: '✅ تم توصيل طلبك بنجاح!',
  },
  html: {
    en: `<div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f8f9fa;">
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
   <div style="background-color: white; padding: 40px 30px;">
      <p style="color: #333; font-size: 24px; margin: 0 0 10px 0;">
         Hi, {{firstName}}!
      </p>
      <p style="color:#666;font-size:16px;line-height:1.6;margin-bottom:20px;">
         🎉 Your order <strong>{{orderId}}</strong> has been successfully delivered!
      </p>
      <p style="color:#666;font-size:16px;line-height:1.6;margin-bottom:20px;">
         We hope you enjoy your purchase. Thank you for choosing <strong>CartJO</strong>.
      </p>
      <div style="text-align: center; margin: 30px 0;">
         <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
            <tr>
               <td
                  bgcolor="#667eea"
                  style="
                  border-radius:8px;
                  text-align:center;
                  "
                  >
                  <a
                     href="{{orderUrl}}"
                     style="
                     display:inline-block;
                     padding:16px 40px;
                     font-size:16px;
                     font-weight:600;
                     font-family:'Cairo','Segoe UI',Arial,sans-serif;
                     color:#ffffff;
                     text-decoration:none;
                     line-height:1.2;
                     "
                     >View Order Details</a>
               </td>
            </tr>
         </table>
      </div>
      <p style="color: #999; font-size: 13px; line-height: 1.6;">
         If the button doesn’t work, you can copy and paste this link:<br>
         <a href="{{orderUrl}}" style="color: #667eea; word-break: break-all;">{{orderUrl}}</a>
      </p>
      <p style="color:#666;font-size:15px;text-align:center;">
         Thank you for shopping with <strong>CartJO</strong> 🛒
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
               {{copyRightsEn}}
            </p>
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
   مرحبًا ، {{firstName}}!
</h2>
<p style="color:#666;font-size:16px;line-height:1.8;">
      🎉 تم توصيل طلبك رقم <strong>{{orderId}}</strong> بنجاح!
   </p>

   <p style="color:#666;font-size:16px;line-height:1.8;">
      نأمل أن تكون تجربتك معنا رائعة، شكرًا لاختيارك <strong>كارت جو</strong>.
   </p>
<p style="color: #666; font-size: 16px; line-height: 1.8; margin-bottom: 20px;"> يمكنك تتبع حالة طلبك في أي وقت من خلال الزر التالي: </p>
<div style="text-align:center;margin:30px 0;">
   <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
      <tr>
         <td
            bgcolor="#667eea"
            style="
            border-radius:8px;
            text-align:center;
            "
            >
            <a
               href="{{orderUrl}}"
               style="
               display:inline-block;
               padding:16px 40px;
               font-size:16px;
               font-weight:600;
               font-family:'Cairo','Segoe UI',Arial,sans-serif;
               color:#ffffff;
               text-decoration:none;
               line-height:1.2;
               "
               >
             عرض تفاصيل الطلب</a>
         </td>
      </tr>
   </table>
</div>
<p style="color:#999;font-size:13px;line-height:1.7;margin:25px 0 0 0;">
   إذا لم يعمل الزر، انسخ هذا الرابط وألصقه في المتصفح:<br />
   <a
      href="{{orderUrl}}"
      style="color:#667eea;word-break:break-all;direction:ltr;display:inline-block;"
      >
   {{orderUrl}}
   </a>
</p>
<p style="text-align:center;color:#666;">
      شكرًا لتسوقك من <strong>CartJO</strong> 🛒
   </p><div></div>
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
           {{copyRightsAr}}
         </p>
      </div>
   </div>
</div>`,
  },
};

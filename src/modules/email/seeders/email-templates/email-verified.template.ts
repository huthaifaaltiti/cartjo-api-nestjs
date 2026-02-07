export const emailVerifiedTemplate = {
  subject: {
    en: 'Welcome Aboard! Your Email is Verified 🎊',
    ar: 'مرحباً بك! تم التحقق من بريدك الإلكتروني بنجاح 🎊',
  },
  html: {
    en: `<div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f8f9fa;">
   <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
      <div style="background-color: white; display: inline-block; padding: 15px 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
         <h1 style="margin: 0; color: #667eea; font-size: 32px; font-weight: bold;">CartJO</h1>
         <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Your Shopping Destination in Jordan</p>
      </div>
   </div>
   <div style="background-color: white; padding: 40px 30px;">
      <h2 style="color: #333; font-size: 24px; margin: 0 0 10px 0;">Great news, {{firstName}}! 🎉</h2>
      <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
         Your email address has been successfully verified. Your CartJO account is now fully active and ready for your first order.
      </p>
      <div style="text-align: center; margin: 30px 0;">
         <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
            <tr>
               <td bgcolor="#667eea" style="border-radius:8px; text-align:center;">
                  <a href="{{appURL}}" style="display:inline-block; padding:16px 40px; font-size:16px; font-weight:600; font-family:'Cairo','Segoe UI',Arial,sans-serif; color:#ffffff; text-decoration:none; line-height:1.2;">
                     Start Shopping Now
                  </a>
               </td>
            </tr>
         </table>
      </div>

      <p style="color:#999;font-size:13px;line-height:1.6;">
          If the button doesn't work, you can copy and paste this link:<br>
          <a href="{{appURL}}" style="color:#667eea;word-break:break-all;">{{appURL}}</a>
      </p>

      <p style="color: #666; font-size: 15px; margin: 20px 0;">
         We are excited to have you with us. Explore the best deals in Jordan today!
      </p>
   </div>
   <div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',Arial,sans-serif;background-color:#f8f9fa;direction:ltr;">
      <div style="background-color:#ffffff;text-align:left;">
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
         <div style="text-align:center;padding:24px 0;border-top:1px solid #e9ecef;margin-top:24px;">
            <p style="color:#666;font-size:14px;margin:0 0 16px 0;font-weight:600;">
               Follow us for exclusive offers! 🎉
            </p>
            <div>
               <a href="{{xLink}}" style="margin:0 5px;text-decoration:none;"><img src="{{xIconPath}}" width="16" height="16" alt="X" style="display:inline-block;border:0;"></a>
               <a href="{{facebookLink}}" style="margin:0 5px;text-decoration:none;"><img src="{{facebookIconPath}}" width="16" height="16" alt="FB" style="display:inline-block;border:0;"></a>
               <a href="{{instagramLink}}" style="margin:0 5px;text-decoration:none;"><img src="{{instagramIconPath}}" width="16" height="16" alt="IG" style="display:inline-block;border:0;"></a>
            </div>
         </div>
         <div style="background-color:#f8f9fa;padding:30px 20px;text-align:center;border-top:1px solid #e9ecef;">
            <p style="color:#666;font-size:12px;margin:0;">
               {{copyRightsEn}}
            </p>
         </div>
      </div>
   </div>
</div>`,

    ar: `<div style="max-width: 600px; margin: 0 auto; font-family: 'Cairo', 'Segoe UI', Arial, sans-serif; background-color: #f8f9fa; direction: rtl;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <div style="background-color: white; display: inline-block; padding: 15px 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h1 style="margin: 0; color: #667eea; font-size: 32px; font-weight: bold;">كارت جو</h1>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">وجهتك للتسوق في الأردن</p>
          </div>
        </div>

        <div style="background-color: white; padding: 40px 30px; text-align: right;">
          <h2 style="color: #333; font-size: 24px; margin: 0 0 10px 0;">أخبار رائعة يا {{firstName}}! 🎉</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
            تم التحقق من بريدك الإلكتروني بنجاح. حسابك في كارت جو الآن نشط بالكامل وجاهز لطلبك الأول.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
              <tr>
                <td bgcolor="#667eea" style="border-radius:8px; text-align:center;">
                  <a href="{{appURL}}" style="display:inline-block; padding:16px 40px; font-size:16px; font-weight:600; font-family:'Cairo','Segoe UI',Arial,sans-serif; color:#ffffff; text-decoration:none; line-height:1.2;">
                    ابدأ التسوق الآن
                  </a>
                </td>
              </tr>
            </table>
          </div>

          <p style="color:#999;font-size:13px;line-height:1.7;margin:25px 0 0 0;">
                إذا لم يعمل الزر، انسخ هذا الرابط وألصقه في المتصفح:<br />
                <a href="{{appURL}}" style="color:#667eea;word-break:break-all;direction:ltr;display:inline-block;">{{appURL}}</a>
          </p>

          <p style="color: #666; font-size: 15px; margin: 20px 0;">
            نحن متحمسون لانضمامك إلينا. استكشف أفضل العروض في الأردن اليوم!
          </p>
        </div>

      <div style="max-width:600px;margin:0 auto;font-family:'Cairo','Segoe UI',Arial,sans-serif;background-color:#ffffff;direction:rtl;">
         <div style="text-align:center;padding:20px;background-color:#f8f9fa;border-radius:12px;">
            <p style="color:#555;font-size:14px;margin:0 0 12px 0;">
               <span style="font-size:20px;">💬</span> تحتاج مساعدة؟
            </p>
            <p style="color:#666;font-size:13px;margin:0;line-height:1.8;">
               تواصل مع فريق الدعم من خلال البريد الإلكتروني <a href="mailto:{{appUsersSupportEmail}}" style="color:#764ba2;text-decoration:none;font-weight:600;">{{appUsersSupportEmail}}</a><br/>
               أو عبر تطبيق واتساب من خلال <a href="{{whatsappLink}}" style="color:#764ba2;text-decoration:none;font-weight:600;">{{whatsappNumber}}</a>
            </p>
         </div>
         <div style="text-align:center;padding:24px 0;border-top:1px solid #e9ecef;margin-top:24px;">
            <p style="color:#666;font-size:14px;margin:0 0 16px 0;font-weight:600;">
               تابعنا للحصول على عروض حصرية! 🎉
            </p>
            <div>
                <a href="{{xLink}}" style="margin:0 5px;text-decoration:none;"><img src="{{xIconPath}}" width="16" height="16" alt="X" style="display:inline-block;border:0;"></a>
               <a href="{{facebookLink}}" style="margin:0 5px;text-decoration:none;"><img src="{{facebookIconPath}}" width="16" height="16" alt="FB" style="display:inline-block;border:0;"></a>
               <a href="{{instagramLink}}" style="margin:0 5px;text-decoration:none;"><img src="{{instagramIconPath}}" width="16" height="16" alt="IG" style="display:inline-block;border:0;"></a>
            </div>
         </div>
         <div style="background-color:#f8f9fa;padding:30px 20px;text-align:center;border-top:1px solid #e9ecef;">
            <p style="color:#666;font-size:12px;margin:0;">
              {{copyRightsAr}}
            </p>
         </div>
      </div>
   </div>`,
  },
};

export const passwordChangedTemplate = {
  subject: {
    en: '🔐 Your Password Has Been Changed',
    ar: '🔐 تم تغيير كلمة المرور بنجاح',
  },
  html: {
    en: `<div style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background-color:#f8f9fa;">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:40px 20px;text-align:center;">
            <div style="background-color:#ffffff;display:inline-block;padding:18px 32px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                <img src="{{logoUrl}}" alt="CartJO" width="140" height="40" style="display:block;margin:0 auto 8px auto;border:0;outline:none;" />
                <p style="margin:0;color:#666;font-size:12px;">Your daily shopping made easy in Jordan</p>
            </div>
        </div>

        <!-- Content -->
        <div style="background-color:#ffffff;padding:40px 30px;">
            <p style="color:#333;font-size:24px;margin:0 0 10px 0;">Hi, {{firstName}}!</p>
            
            <p style="color:#666;font-size:16px;line-height:1.6;">
                This is a confirmation that your account password was <strong>successfully changed</strong>. At: {{date}}.
            </p>

            <p style="color:#666;font-size:16px;line-height:1.6;">
                If you did not make this change, please contact our support team immediately to secure your account.
            </p>

            <p style="color:#666;text-align:center;">Your security matters to us 🤍</p>

            <!-- Help Section -->
            <div style="text-align:center;padding:20px;background-color:#f8f9fa;border-radius:12px;margin-top:24px;">
                <p style="color:#555;font-size:14px;margin:0 0 12px 0;">
                    <span style="font-size:20px;">💬</span> Need help?
                </p>
                <p style="color:#666;font-size:13px;margin:0;line-height:1.8;">
                    Contact our support team via email at
                    <a href="mailto:{{appUsersSupportEmail}}" style="color:#764ba2;text-decoration:none;font-weight:600;">{{appUsersSupportEmail}}</a><br/>
                    or reach us on WhatsApp at
                    <a href="{{whatsappLink}}" style="color:#764ba2;text-decoration:none;font-weight:600;">{{whatsappNumber}}</a>
                </p>
            </div>

            <!-- Social Media -->
            <div style="text-align:center;padding:24px 0;border-top:1px solid #e9ecef;margin-top:24px;">
                <p style="color:#666;font-size:14px;margin:0 0 16px 0;font-weight:600;">
                    Follow us for updates & offers 🎉
                </p>
                <div>
                    <a href="{{xLink}}"><img src="{{xIconPath}}" width="16" height="16" alt="X" /></a>
                    <a href="{{facebookLink}}"><img src="{{facebookIconPath}}" width="16" height="16" alt="Facebook" /></a>
                    <a href="{{instagramLink}}"><img src="{{instagramIconPath}}" width="16" height="16" alt="Instagram" /></a>
                    <a href="{{snapchatLink}}"><img src="{{snapchatIconPath}}" width="16" height="16" alt="Snapchat" /></a>
                    <a href="{{linkedInLink}}"><img src="{{linkedinIconPath}}" width="16" height="16" alt="LinkedIn" /></a>
                    <a href="{{tiktokLink}}"><img src="{{tiktokIconPath}}" width="16" height="16" alt="TikTok" /></a>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color:#f8f9fa;padding:30px 20px;text-align:center;border-top:1px solid #e9ecef;">
            <p style="color:#666;font-size:12px;margin:0;">
                {{copyRightsEn}}
            </p>
        </div>
    </div>`,

    ar: `<div style="max-width:600px;margin:0 auto;font-family:'Cairo','Segoe UI',Arial,sans-serif;background-color:#f8f9fa;direction:rtl;">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:40px 20px;text-align:center;">
            <div style="background-color:#ffffff;display:inline-block;padding:18px 32px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                <img src="{{logoUrl}}" alt="كارت جو" width="140" height="40" style="display:block;margin:0 auto 8px auto;border:0;outline:none;" />
                <p style="margin:0;color:#666;font-size:12px;">تسوّقك اليومي أصبح سهلاً في الأردن</p>
            </div>
        </div>

        <!-- Content -->
        <div style="background-color:#ffffff;padding:40px 30px;text-align:right;">
            <h2 style="color:#333;font-size:24px;margin:0 0 10px 0;">مرحبًا، {{firstName}}!</h2>
            
            <p style="color:#666;font-size:16px;line-height:1.8;">
                نود إعلامك بأنه تم <strong>تغيير كلمة المرور الخاصة بحسابك بنجاح</strong>. بتاريخ: {{date}}.
            </p>

            <p style="color:#666;font-size:16px;line-height:1.8;">
                إذا لم تقم بهذا الإجراء، يرجى التواصل فورًا مع فريق الدعم لحماية حسابك.
            </p>

            <p style="text-align:center;color:#666;">أمانك يهمنا 🤍</p>

            <!-- Help Section -->
            <div style="text-align:center;padding:20px;background-color:#f8f9fa;border-radius:12px;margin-top:24px;">
                <p style="color:#555;font-size:14px;margin:0 0 12px 0;">
                    <span style="font-size:20px;">💬</span> تحتاج مساعدة؟
                </p>
                <p style="color:#666;font-size:13px;margin:0;line-height:1.8;">
                    تواصل مع فريق الدعم عبر البريد الإلكتروني
                    <a href="mailto:{{appUsersSupportEmail}}" style="color:#764ba2;text-decoration:none;font-weight:600;">{{appUsersSupportEmail}}</a><br/>
                    أو عبر واتساب
                    <a href="{{whatsappLink}}" style="color:#764ba2;text-decoration:none;font-weight:600;">{{whatsappNumber}}</a>
                </p>
            </div>

            <!-- Social Media -->
            <div style="text-align:center;padding:24px 0;border-top:1px solid #e9ecef;margin-top:24px;">
                <p style="color:#666;font-size:14px;margin:0 0 16px 0;font-weight:600;">
                    تابعنا للحصول على آخر التحديثات 🎉
                </p>
                <div>
                    <a href="{{xLink}}"><img src="{{xIconPath}}" width="16" height="16" alt="X" /></a>
                    <a href="{{facebookLink}}"><img src="{{facebookIconPath}}" width="16" height="16" alt="Facebook" /></a>
                    <a href="{{instagramLink}}"><img src="{{instagramIconPath}}" width="16" height="16" alt="Instagram" /></a>
                    <a href="{{snapchatLink}}"><img src="{{snapchatIconPath}}" width="16" height="16" alt="Snapchat" /></a>
                    <a href="{{linkedInLink}}"><img src="{{linkedinIconPath}}" width="16" height="16" alt="LinkedIn" /></a>
                    <a href="{{tiktokLink}}"><img src="{{tiktokIconPath}}" width="16" height="16" alt="TikTok" /></a>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color:#f8f9fa;padding:30px 20px;text-align:center;border-top:1px solid #e9ecef;">
            <p style="color:#666;font-size:12px;margin:0;">
                {{copyRightsAr}}
            </p>
        </div>
    </div>`,
  },
};

export const privacyPolicyTemplate = {
  subject: {
    en: 'Important: CartJO Privacy Policy Update 🔒',
    ar: 'مهم: تحديث سياسة الخصوصية لكارت جو 🔒',
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
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="display: inline-block; background-color: #e8eaf6; padding: 15px; border-radius: 50%; margin-bottom: 15px;">
              <span style="font-size: 32px;">🔒</span>
            </div>
          </div>
          
          <h2 style="color: #333; font-size: 24px; margin: 0 0 10px 0; text-align: center;">Privacy Policy Update</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            We've updated our Privacy Policy to enhance the protection of your personal information and provide greater transparency about how we handle your data at CartJO.
          </p>
          
          <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 15px 20px; margin: 20px 0;">
            <p style="color: #555; font-size: 14px; margin: 0 0 10px 0; line-height: 1.5;">
              <strong>What's Changed:</strong>
            </p>
            <ul style="color: #555; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Enhanced data security measures</li>
              <li>Clearer information about data usage</li>
              <li>Updated cookie policies</li>
              <li>Your rights regarding personal data</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{policyUrl}}" 
              style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
              Review Privacy Policy
            </a>
          </div>
          
          <p style="color: #999; font-size: 13px; line-height: 1.5; margin: 25px 0 0 0;">
            The updated policy takes effect immediately. By continuing to use CartJO, you agree to our updated Privacy Policy.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 30px 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="color: #999; font-size: 13px; margin: 0 0 10px 0;">
            Questions about our privacy practices? Contact us at privacy@cartjo.com
          </p>
          <p style="color: #666; font-size: 12px; margin: 0;">
<<<<<<< HEAD
            © 2025 CartJO. All rights reserved.<br>
            Amman, Jordan
=======
            {{copyRightsEn}}
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
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
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="display: inline-block; background-color: #e8eaf6; padding: 15px; border-radius: 50%; margin-bottom: 15px;">
              <span style="font-size: 32px;">🔒</span>
            </div>
          </div>
          
          <h2 style="color: #333; font-size: 24px; margin: 0 0 10px 0; text-align: center;">تحديث سياسة الخصوصية</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
            قمنا بتحديث سياسة الخصوصية الخاصة بنا لتعزيز حماية معلوماتك الشخصية وتوفير شفافية أكبر حول كيفية التعامل مع بياناتك في كارت جو.
          </p>
          
          <div style="background-color: #f8f9fa; border-right: 4px solid #667eea; padding: 15px 20px; margin: 20px 0;">
            <p style="color: #555; font-size: 14px; margin: 0 0 10px 0; line-height: 1.7;">
              <strong>ما الذي تغير:</strong>
            </p>
            <ul style="color: #555; font-size: 14px; margin: 0; padding-right: 20px; line-height: 1.8;">
              <li>تدابير أمنية محسّنة للبيانات</li>
              <li>معلومات أوضح حول استخدام البيانات</li>
              <li>سياسات محدّثة لملفات تعريف الارتباط</li>
              <li>حقوقك فيما يتعلق بالبيانات الشخصية</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{policyUrl}}" 
              style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
              مراجعة سياسة الخصوصية
            </a>
          </div>
          
          <p style="color: #999; font-size: 13px; line-height: 1.7; margin: 25px 0 0 0; text-align: right;">
            تدخل السياسة المحدثة حيز التنفيذ فورًا. من خلال الاستمرار في استخدام كارت جو، فإنك توافق على سياسة الخصوصية المحدثة.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 30px 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="color: #999; font-size: 13px; margin: 0 0 10px 0;">
            لديك أسئلة حول ممارسات الخصوصية لدينا؟ تواصل معنا على privacy@cartjo.com
          </p>
          <p style="color: #666; font-size: 12px; margin: 0;">
<<<<<<< HEAD
            © 2025 كارت جو. جميع الحقوق محفوظة.<br>
            عمّان، الأردن
=======
           {{copyRightsAr}}
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
          </p>
        </div>
      </div>
    `,
  },
};
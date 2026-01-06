export const copyRights = () => {
  const currentYear = new Date().getFullYear();

  return {
    copyRightsAr: `© كارت جو ${currentYear}. جميع الحقوق محفوظة`,
    copyRightsEn: `© ${currentYear} CartJO. All Rights Reserved`,
  };
};

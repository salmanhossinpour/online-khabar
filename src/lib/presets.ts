import { SiteSettings } from '../types';

export interface ThemePresetInfo {
  id: 'modern' | 'newspaper' | 'tech' | 'breaking' | 'lifestyle';
  name: string;
  description: string;
  badge: string;
  previewColor: string;
  settingsPartial: Partial<SiteSettings>;
}

export const THEME_PRESETS: ThemePresetInfo[] = [
  {
    id: 'modern',
    name: 'پایگاه خبری مدرن (Default Minimal)',
    description: 'طراحی مینی‌مال، فونت تمیز، کارت‌های خلوت، رنگ آبی سورمه‌ای و ترکیب عالی فضاهای خالی.',
    badge: 'محبوب‌ترین',
    previewColor: '#2563eb',
    settingsPartial: {
      primaryColor: '#2563eb',
      secondaryColor: '#3b82f6',
      fontFamily: 'vazir',
      headerStyle: 'magazine',
      footerStyle: 'multicolumn',
      cornerRadius: 'md',
      activeThemePreset: 'modern',
    },
  },
  {
    id: 'newspaper',
    name: 'روزنامه کلاسیک مطبوعاتی (Classic Editorial)',
    description: 'الهام گرفته از روزنامه‌های معتبر، فونت سنتی، حاشیه‌های مشخص، کاغذ گرم و ستون‌بندی مطبوعاتی.',
    badge: 'کلاسیک',
    previewColor: '#78350f',
    settingsPartial: {
      primaryColor: '#854d0e',
      secondaryColor: '#dc2626',
      fontFamily: 'iransans',
      headerStyle: 'newspaper',
      footerStyle: 'magazine',
      cornerRadius: 'none',
      activeThemePreset: 'newspaper',
    },
  },
  {
    id: 'tech',
    name: 'مجله فناوری و دیجیتال (Tech Minimal)',
    description: 'طراحی نوین و تیره با رنگ‌های نئونی، هایلایت‌های شیشه‌ای و فونت مدرن مناسب فناوری و گجت.',
    badge: 'دیجیتال',
    previewColor: '#0284c7',
    settingsPartial: {
      primaryColor: '#0284c7',
      secondaryColor: '#06b6d4',
      fontFamily: 'vazir',
      headerStyle: 'compact',
      footerStyle: 'multicolumn',
      cornerRadius: 'lg',
      activeThemePreset: 'tech',
    },
  },
  {
    id: 'breaking',
    name: 'خبرگزاری فوری و سرتیتر (Hot Breaking News)',
    description: 'تاکید بر تیترهای اول، نوار قرمز اخبار فوری، اسلایدرهای پرانرژی و سرعت بالای اطلاع‌رسانی.',
    badge: 'پرانرژی',
    previewColor: '#dc2626',
    settingsPartial: {
      primaryColor: '#dc2626',
      secondaryColor: '#991b1b',
      fontFamily: 'shabnam',
      headerStyle: 'magazine',
      footerStyle: 'multicolumn',
      cornerRadius: 'sm',
      activeThemePreset: 'breaking',
    },
  },
  {
    id: 'lifestyle',
    name: 'مجله سبک زندگی و هنر (Warm Lifestyle)',
    description: 'رنگ‌های گرم نچرال، زوایای نرم و گرد، تصاویر عریض و فضای آرامش‌بخش.',
    badge: 'هنری',
    previewColor: '#0d9488',
    settingsPartial: {
      primaryColor: '#0d9488',
      secondaryColor: '#0284c7',
      fontFamily: 'vazir',
      headerStyle: 'minimal',
      footerStyle: 'minimal',
      cornerRadius: 'full',
      activeThemePreset: 'lifestyle',
    },
  },
];

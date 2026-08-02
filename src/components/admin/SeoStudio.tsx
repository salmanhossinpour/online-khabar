import React, { useState, useEffect } from 'react';
import { SiteSettings, SeoSettings, Article } from '../../types';
import {
  Globe,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Save,
  Search,
  Share2,
  FileCode,
  Layers,
  Activity,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Info,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

interface SeoStudioProps {
  settings: SiteSettings;
  articles: Article[];
  onSaveSettings: (updated: SiteSettings) => Promise<void>;
}

export const SeoStudio: React.FC<SeoStudioProps> = ({ settings, articles, onSaveSettings }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [copied, setCopied] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [seo, setSeo] = useState<SeoSettings>({
    metaTitle: settings.seo?.metaTitle || `${settings.siteName} | جدیدترین اخبار و تحلیل‌های روز`,
    metaDescription: settings.seo?.metaDescription || settings.siteSubtitle || 'آخرین اخبار سیاسی، اقتصادی، فناوری و ورزشی ایران و جهان',
    keywords: settings.seo?.keywords || 'خبر, اخبار ایران, اخبار فناوری, پایگاه خبری, خبرنگار آنلاین',
    canonicalUrl: settings.seo?.canonicalUrl || 'https://khabar.ir',
    ogTitle: settings.seo?.ogTitle || settings.siteName,
    ogDescription: settings.seo?.ogDescription || settings.siteSubtitle,
    ogImage: settings.seo?.ogImage || settings.siteLogoUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=1200',
    twitterHandle: settings.seo?.twitterHandle || '@khabar_online',
    robotsTxt: settings.seo?.robotsTxt || `User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://khabar.ir/sitemap.xml`,
    enableSitemap: settings.seo?.enableSitemap ?? true,
    enableStructuredData: settings.seo?.enableStructuredData ?? true,
    googleSearchConsoleVerification: settings.seo?.googleSearchConsoleVerification || '',
    indexingStatus: settings.seo?.indexingStatus || 'indexed',
  });

  useEffect(() => {
    if (settings.seo) {
      setSeo({
        metaTitle: settings.seo.metaTitle || `${settings.siteName} | جدیدترین اخبار و تحلیل‌های روز`,
        metaDescription: settings.seo.metaDescription || settings.siteSubtitle || '',
        keywords: settings.seo.keywords || '',
        canonicalUrl: settings.seo.canonicalUrl || 'https://khabar.ir',
        ogTitle: settings.seo.ogTitle || settings.siteName,
        ogDescription: settings.seo.ogDescription || settings.siteSubtitle,
        ogImage: settings.seo.ogImage || '',
        twitterHandle: settings.seo.twitterHandle || '',
        robotsTxt: settings.seo.robotsTxt || `User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://khabar.ir/sitemap.xml`,
        enableSitemap: settings.seo.enableSitemap ?? true,
        enableStructuredData: settings.seo.enableStructuredData ?? true,
        googleSearchConsoleVerification: settings.seo.googleSearchConsoleVerification || '',
        indexingStatus: settings.seo.indexingStatus || 'indexed',
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveSettings({
        ...settings,
        seo: seo,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAutoFixSeo = () => {
    setSeo((prev) => ({
      ...prev,
      metaTitle: `${settings.siteName} | پایگاه خبری و تحلیلی لحظه‌ای ایران و جهان`,
      metaDescription: `جدیدترین اخبار و تحلیل‌های زنده سیاسی، اقتصادی، تکنولوژی، ورزشی و بین‌المللی با پوشش ۲۴ ساعته در ${settings.siteName}.`,
      keywords: `خبر, اخبار ایران, ${settings.siteName}, آخرین اخبار, خبر فوری, تحلیل اقتصادی`,
      canonicalUrl: prev.canonicalUrl || 'https://khabar.ir',
      ogTitle: `${settings.siteName} - اخبار فوری و تحلیل جامع`,
      ogDescription: `پوشش لحظه‌ای و مستقل آخرین رخدادهای خبری، سیاسی، فناوری و بین‌المللی در ${settings.siteName}`,
      ogImage: prev.ogImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=1200',
      enableSitemap: true,
      enableStructuredData: true,
      robotsTxt: `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nSitemap: ${prev.canonicalUrl || 'https://khabar.ir'}/sitemap.xml`,
    }));
  };

  // SEO Score Calculation
  const calculateScore = () => {
    let score = 0;
    const titleLen = (seo.metaTitle || '').length;
    if (titleLen >= 25 && titleLen <= 65) score += 20;
    else if (titleLen > 0) score += 10;

    const descLen = (seo.metaDescription || '').length;
    if (descLen >= 80 && descLen <= 170) score += 20;
    else if (descLen > 0) score += 10;

    if ((seo.keywords || '').split(',').filter((k) => k.trim()).length >= 3) score += 15;

    if (seo.ogImage && seo.ogImage.startsWith('http')) score += 15;

    if (seo.enableSitemap && seo.robotsTxt && seo.robotsTxt.includes('Sitemap:')) score += 15;

    if (seo.enableStructuredData) score += 15;

    return Math.min(100, score);
  };

  const seoScore = calculateScore();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const stepsList = [
    { id: 1, title: 'عناوین و متاتگ‌های پایه', icon: Search, desc: 'عنوان گوگل، توضیحات متا و کلمات کلیدی' },
    { id: 2, title: 'شبکه‌های اجتماعی (OG)', icon: Share2, desc: 'پیش‌نمایش اشتراک‌گذاری در تلگرام/توییتر' },
    { id: 3, title: 'نقشه سایت و فایل ربات', icon: FileCode, desc: 'Sitemap.xml و Robots.txt' },
    { id: 4, title: 'داده‌های ساختاریافته', icon: Layers, desc: 'JSON-LD Schema.org اخبار' },
    { id: 5, title: 'آنالیز و چک‌لیست سلامت', icon: Activity, desc: 'ارزیابی نهایی و اصلاح خودکار' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white border border-blue-800/50 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-extrabold text-xs mb-1">
            <Globe className="w-4 h-4" />
            <span>سامانه هوشمند بهینه‌سازی موتورهای جستجو (SEO Wizard)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">مدیریت سئوی مرحله‌به‌مرحله سایت</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            سایت خود را در ۵ گام استاندارد مطابق آخرین الگوریتم‌های گوگل، شبکه‌های اجتماعی و استاندارد Schema.org سئو کنید.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleAutoFixSeo}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all"
            title="بهینه‌سازی هوشمند و اصلاح خودکار مقادیر"
          >
            <Sparkles className="w-4 h-4" />
            <span>بهینه‌سازی خودکار سئو</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-2 shadow-lg transition-all"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : savedSuccess ? (
              <Check className="w-4 h-4 text-emerald-200" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'در حال ذخیره...' : savedSuccess ? 'ذخیره شد!' : 'ذخیره تنظیمات سئو'}</span>
          </button>
        </div>
      </div>

      {/* Step Navigator Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {stepsList.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isDone = currentStep > step.id;

          return (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id as any)}
              className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg ring-2 ring-blue-400/30'
                  : isDone
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-slate-800 dark:text-slate-200'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                    isActive
                      ? 'bg-white text-blue-600'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {isDone ? '✓' : step.id}
                </span>
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              </div>
              <div>
                <h4 className={`text-xs font-black block leading-tight ${isActive ? 'text-white' : ''}`}>
                  {step.title}
                </h4>
                <p className={`text-[10px] mt-0.5 truncate ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                  {step.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Step Content Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Step 1: Meta Tags */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-600" />
                  <span>مرحله ۱: تنظیمات عنوان، متاتگ‌ها و کلمات کلیدی گوگل</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  عنوان اصلی سایت و توضیحات متاتگ مستقیماً در نتایج موتورهای جستجو نمایش داده می‌شوند.
                </p>
              </div>
            </div>

            {/* Google Search Snippet Preview */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                پیش‌نمایش زنده در صفحه نتایج گوگل (Google Search Preview):
              </span>
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-mono text-left" dir="ltr">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px] font-bold">G</span>
                <span className="text-slate-700 dark:text-slate-300 truncate">{seo.canonicalUrl || 'https://khabar.ir'}</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer">
                {seo.metaTitle || 'عنوان سایت در موتورهای جستجو'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                {seo.metaDescription || 'توضیحات کوتاه سایت که در زیر لینک گوگل نمایش داده می‌شود...'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold">عنوان اصلی متاتگ سایت (Meta Title):</label>
                  <span className={`text-[11px] font-mono font-bold ${
                    (seo.metaTitle || '').length >= 30 && (seo.metaTitle || '').length <= 60
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {(seo.metaTitle || '').length} / ۶۰ کاراکتر
                  </span>
                </div>
                <input
                  type="text"
                  value={seo.metaTitle || ''}
                  onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })}
                  placeholder="مثال: خبرنگار آنلاین | جدیدترین اخبار سیاسی، اقتصادی و فناوری"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold">توضیحات متاتگ اصلی (Meta Description):</label>
                  <span className={`text-[11px] font-mono font-bold ${
                    (seo.metaDescription || '').length >= 100 && (seo.metaDescription || '').length <= 160
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {(seo.metaDescription || '').length} / ۱۶۰ کاراکتر
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={seo.metaDescription || ''}
                  onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                  placeholder="خلاصه‌ای جذاب و استاندارد برای قرارگیری در نتایج گوگل..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">کلمات کلیدی اصلی (با ویرگول جدا کنید):</label>
                <input
                  type="text"
                  value={seo.keywords || ''}
                  onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
                  placeholder="خبر, اخبار ایران, اخبار فناوری, پایگاه خبری"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">آدرس مبنای دامنه‌ اصلی (Canonical URL):</label>
                <input
                  type="text"
                  value={seo.canonicalUrl || ''}
                  onChange={(e) => setSeo({ ...seo, canonicalUrl: e.target.value })}
                  placeholder="https://khabar.ir"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono text-left"
                  dir="ltr"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold mb-1">کد اثبات مالکیت گوگل (Google Search Console Verification Meta Tag):</label>
                <input
                  type="text"
                  value={seo.googleSearchConsoleVerification || ''}
                  onChange={(e) => setSeo({ ...seo, googleSearchConsoleVerification: e.target.value })}
                  placeholder="google-site-verification=XXXXXXXXXXXXXXXXXXXXXX"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono text-left"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Open Graph & Social Cards */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-indigo-600" />
                  <span>مرحله ۲: پروتکل Open Graph و کارت‌های شبکه‌های اجتماعی</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  هنگامی که لینک سایت در تلگرام، اینستاگرام، واتس‌اپ یا توییتر به اشتراک گذاشته می‌شود، این بنر و اطلاعات نمایش داده خواهد شد.
                </p>
              </div>
            </div>

            {/* Live Social Card Preview */}
            <div className="max-w-md mx-auto bg-slate-900 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-xl">
              <div className="relative aspect-video bg-slate-800">
                {seo.ogImage ? (
                  <img src={seo.ogImage} alt="Social Banner Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-4 text-center">
                    <Share2 className="w-8 h-8 mb-2" />
                    <span className="text-xs">بدون تصویر شاخص شبکه اجتماعی</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-blue-600/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold">
                  Telegram / WhatsApp Card
                </div>
              </div>
              <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-blue-400 block" dir="ltr">{seo.canonicalUrl || 'khabar.ir'}</span>
                <h4 className="font-bold text-sm text-white line-clamp-1">{seo.ogTitle || seo.metaTitle || 'عنوان پست'}</h4>
                <p className="text-xs text-slate-400 line-clamp-2">{seo.ogDescription || seo.metaDescription || 'توضیحات اشتراک‌گذاری'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1">عنوان Open Graph (شبکه‌های اجتماعی):</label>
                <input
                  type="text"
                  value={seo.ogTitle || ''}
                  onChange={(e) => setSeo({ ...seo, ogTitle: e.target.value })}
                  placeholder="عنوان ویژه برای تلگرام و توییتر"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">نام کاربری توییتر / X Handle:</label>
                <input
                  type="text"
                  value={seo.twitterHandle || ''}
                  onChange={(e) => setSeo({ ...seo, twitterHandle: e.target.value })}
                  placeholder="@khabar_online"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono text-left"
                  dir="ltr"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold mb-1">لینک تصویر شاخص شبکه های اجتماعی (OG Image URL):</label>
                <input
                  type="text"
                  value={seo.ogImage || ''}
                  onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono text-left"
                  dir="ltr"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold mb-1">توضیحات Open Graph (OG Description):</label>
                <textarea
                  rows={2}
                  value={seo.ogDescription || ''}
                  onChange={(e) => setSeo({ ...seo, ogDescription: e.target.value })}
                  placeholder="توضیحات جذاب هنگام ارسال لینک در گروه‌ها و کانال‌ها..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Sitemap & Robots */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-emerald-600" />
                  <span>مرحله ۳: فایل‌های Robots.txt و نقشه سایت Sitemap.xml</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  دستورالعمل ربات‌های خزنده‌ موتورهای جستجو و آدرس نقشه فایل‌های XML سایت.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Robots.txt Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold">محتوای فایل Robots.txt:</label>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        seo.robotsTxt || '',
                        'robots'
                      )
                    }
                    className="text-[11px] text-blue-600 font-bold flex items-center gap-1 hover:underline"
                  >
                    {copied === 'robots' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied === 'robots' ? 'کپی شد' : 'کپی متون'}</span>
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={seo.robotsTxt || ''}
                  onChange={(e) => setSeo({ ...seo, robotsTxt: e.target.value })}
                  className="w-full bg-slate-900 text-emerald-400 font-mono text-xs p-3 rounded-2xl border border-slate-800 leading-relaxed text-left"
                  dir="ltr"
                />
              </div>

              {/* Sitemap Generator Status */}
              <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-500" />
                  <span>وضعیت نقشه سایت هوشمند (Sitemap.xml):</span>
                </h4>

                <label className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <div>
                    <span className="font-bold text-xs block">فعال‌سازی و تولید خودکار Sitemap.xml</span>
                    <span className="text-[10px] text-slate-400">شامل تمامی {articles.length} مقاله و اخبار منتشر شده</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={seo.enableSitemap ?? true}
                    onChange={(e) => setSeo({ ...seo, enableSitemap: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                </label>

                <div className="p-3 bg-slate-900 text-slate-300 rounded-xl font-mono text-[11px] space-y-1 text-left overflow-x-auto" dir="ltr">
                  <span className="text-slate-500 block">&lt;!-- Sample Generated Sitemap Header --&gt;</span>
                  <span className="text-emerald-400">&lt;urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"&gt;</span>
                  <div className="pl-3 text-slate-300">
                    <div>&lt;url&gt;&lt;loc&gt;{seo.canonicalUrl || 'https://khabar.ir'}&lt;/loc&gt;&lt;priority&gt;1.0&lt;/priority&gt;&lt;/url&gt;</div>
                    <div>&lt;url&gt;&lt;loc&gt;{seo.canonicalUrl || 'https://khabar.ir'}/news/sample&lt;/loc&gt;&lt;priority&gt;0.8&lt;/priority&gt;&lt;/url&gt;</div>
                  </div>
                  <span className="text-emerald-400">&lt;/urlset&gt;</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `${seo.canonicalUrl || 'https://khabar.ir'}/sitemap.xml`,
                        'sitemap-link'
                      )
                    }
                    className="flex-1 py-2 px-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {copied === 'sitemap-link' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>کپی آدرس ساید‌مپ</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Structured Data JSON-LD */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-600" />
                  <span>مرحله ۴: داده‌های ساختاریافته (Structured Data Schema.org)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  کدهای JSON-LD که به گوگل امکان نمایش اخبار در Google News و Rich Snippet‌ها را می‌دهد.
                </p>
              </div>
            </div>

            <label className="flex items-center justify-between p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 cursor-pointer">
              <div>
                <span className="font-bold text-xs block text-purple-900 dark:text-purple-200">
                  تزریق خودکار اسکیمای NewsArticle و WebSite
                </span>
                <span className="text-[11px] text-purple-700 dark:text-purple-300">
                  تولید خودکار کدهای استاندارد هدر سایت و صفحات خبری جهت کسب امتیاز بالا در Google Search Console
                </span>
              </div>
              <input
                type="checkbox"
                checked={seo.enableStructuredData ?? true}
                onChange={(e) => setSeo({ ...seo, enableStructuredData: e.target.checked })}
                className="w-5 h-5 text-purple-600 rounded"
              />
            </label>

            <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-left overflow-x-auto space-y-2" dir="ltr">
              <span className="text-slate-500 block">&lt;script type="application/ld+json"&gt;</span>
              <pre className="text-amber-300 leading-relaxed">
{JSON.stringify(
  {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: settings.siteName,
    url: seo.canonicalUrl || 'https://khabar.ir',
    logo: seo.ogImage || settings.siteLogoUrl || 'https://khabar.ir/logo.png',
    sameAs: [
      settings.socialLinks?.telegram,
      settings.socialLinks?.instagram,
      settings.socialLinks?.twitter,
    ].filter(Boolean),
  },
  null,
  2
)}
              </pre>
              <span className="text-slate-500 block">&lt;/script&gt;</span>
            </div>
          </div>
        )}

        {/* Step 5: SEO Health Check & Auto Fix */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  <span>مرحله ۵: چک‌لیست سلامت سئو و امتیاز نهایی سایت</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  ارزیابی زنده شاخص‌های استاندارد SEO همراه با پیشنهادهای اصلاح آنی
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-left" dir="ltr">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{seoScore}</span>
                  <span className="text-xs text-slate-400"> / 100</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span>امتیاز کلی کیفیت سئوی پایگاه خبری:</span>
                <span className="text-emerald-600 font-extrabold">
                  {seoScore >= 80 ? 'عالی (سبز)' : seoScore >= 50 ? 'متوسط (نیاز به تکمیل)' : 'ضعیف'}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    seoScore >= 80 ? 'bg-emerald-500' : seoScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${seoScore}%` }}
                />
              </div>
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                {
                  title: 'طول عنوان متاتگ (Meta Title)',
                  passed: (seo.metaTitle || '').length >= 25 && (seo.metaTitle || '').length <= 65,
                  detail: `${(seo.metaTitle || '').length} کاراکتر (باید بین ۳۰ تا ۶۰ کاراکتر باشد)`,
                },
                {
                  title: 'طول توضیحات متاتگ (Meta Description)',
                  passed: (seo.metaDescription || '').length >= 80 && (seo.metaDescription || '').length <= 170,
                  detail: `${(seo.metaDescription || '').length} کاراکتر (باید بین ۱۰۰ تا ۱۶۰ کاراکتر باشد)`,
                },
                {
                  title: 'تعریف کلمات کلیدی اصلی سایت',
                  passed: (seo.keywords || '').split(',').filter((k) => k.trim()).length >= 3,
                  detail: `${(seo.keywords || '').split(',').filter((k) => k.trim()).length} کلمه کلیدی تعریف شده`,
                },
                {
                  title: 'تنظیم بنر شاخص شبکه‌های اجتماعی (OG Image)',
                  passed: !!(seo.ogImage && seo.ogImage.startsWith('http')),
                  detail: seo.ogImage ? 'بنر استاندارد تنظیم شده است' : 'تصویر لود نشده است',
                },
                {
                  title: 'تنظیم آدرس اصلی (Canonical URL)',
                  passed: !!(seo.canonicalUrl && seo.canonicalUrl.startsWith('http')),
                  detail: seo.canonicalUrl || 'تعریف نشده',
                },
                {
                  title: 'فایل Robots.txt و لینک Sitemap.xml',
                  passed: !!(seo.enableSitemap && seo.robotsTxt && seo.robotsTxt.includes('Sitemap:')),
                  detail: seo.enableSitemap ? 'Sitemap به فایل ربات متصل است' : 'غیرفعال',
                },
                {
                  title: 'داده‌های ساختاریافته Schema.org',
                  passed: !!seo.enableStructuredData,
                  detail: seo.enableStructuredData ? 'کدهای اسکیما فعال است' : 'غیرفعال',
                },
                {
                  title: 'تعداد اخبار اندکس شده جهت تحلیل سئو',
                  passed: articles.length > 0,
                  detail: `${articles.length} مقاله آماده ایندکس در گوگل`,
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                    item.passed
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                      : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40'
                  }`}
                >
                  {item.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white">{item.title}</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Auto Fix Banner */}
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-indigo-950 dark:text-indigo-200">
                    اصلاح خودکار و هوشمند تمام خطاهای سئو
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    تنظیم مقادیر طلایی برای عناوین، کلمات کلیدی، فایل Robots و اسکیما تنها با یک کلیک
                  </p>
                </div>
              </div>

              <button
                onClick={handleAutoFixSeo}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shrink-0 transition-all shadow-md"
              >
                اصلاح یک‌کلیکه سئو
              </button>
            </div>
          </div>
        )}

        {/* Step Navigation Controls */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1) as any)}
            disabled={currentStep === 1}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2 hover:bg-slate-200 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>مرحله قبل</span>
          </button>

          <span className="text-xs text-slate-400 font-bold">
            گام {currentStep} از ۵
          </span>

          {currentStep < 5 ? (
            <button
              onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1) as any)}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <span>مرحله بعد</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>پایان و ذخیره نهایی سئو</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

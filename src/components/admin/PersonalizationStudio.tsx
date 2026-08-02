import React, { useState } from 'react';
import { SiteSettings, HeaderStyle, FooterStyle, FontFamily, CornerRadius } from '../../types';
import { THEME_PRESETS } from '../../lib/presets';
import { Palette, Layout, Type, Check, Sparkles, RefreshCw, Smartphone, Upload, Image as ImageIcon, X } from 'lucide-react';

interface PersonalizationStudioProps {
  settings: SiteSettings;
  onSaveSettings: (settings: SiteSettings) => Promise<void>;
}

export const PersonalizationStudio: React.FC<PersonalizationStudioProps> = ({ settings, onSaveSettings }) => {
  const [formData, setFormData] = useState<SiteSettings>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('حجم تصویر لوگو نباید بیشتر از ۱۰ مگابایت باشد.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          siteLogoUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const COLOR_SWATCHES = [
    { name: 'آبی اقیانوسی (اصلی)', hex: '#2563eb' },
    { name: 'قرمز خبری فوری', hex: '#dc2626' },
    { name: 'زمردی اقتصادی', hex: '#16a34a' },
    { name: 'کهربایی ویژه', hex: '#d97706' },
    { name: 'بنفش هنری', hex: '#9333ea' },
    { name: 'فیروزه‌ای تکنولوژی', hex: '#0284c7' },
    { name: 'سیاه مینیمال', hex: '#1e293b' },
  ];

  const handlePresetApply = (presetId: string) => {
    const preset = THEME_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setFormData((prev) => ({
        ...prev,
        ...preset.settingsPartial,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveSettings(formData);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn text-slate-900 dark:text-slate-100">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> استودیو شخصی‌سازی حرفه‌ای
          </span>
          <h3 className="text-xl font-extrabold">طراحی و ظاهر سایت خود را شخصی‌سازی کنید</h3>
          <p className="text-xs text-blue-100 mt-1">
            تغییر لوگو، تم رنگی، فونت، استایل هدر و فوتر و قالب‌های آماده با دکمه اعمال آنی
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-xs px-6 py-3 rounded-xl shadow-md transition-all shrink-0 flex items-center gap-2"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          <span>{isSaving ? 'در حال ذخیره‌سازی...' : 'ذخیره تغییرات تم'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>تغییرات ظاهر سایت با موفقیت در دیتابیس NeDB ذخیره شد!</span>
        </div>
      )}

      {/* 1. Pre-made Theme Models (مدل‌های آماده سایت) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-base font-extrabold text-slate-900 dark:text-white">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>۱. قالب‌های آماده سایت (یک کلیک برای تغییر کامل)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {THEME_PRESETS.map((preset) => {
            const isSelected = formData.activeThemePreset === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => handlePresetApply(preset.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="w-4 h-4 rounded-full border border-white shadow"
                      style={{ backgroundColor: preset.previewColor }}
                    />
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-1.5 py-0.2 rounded">
                      {preset.badge}
                    </span>
                  </div>
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white mb-1">{preset.name}</h5>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[10px]">
                  <span className={isSelected ? 'text-blue-600 font-bold' : 'text-slate-400'}>
                    {isSelected ? '✓ قالب فعال' : 'انتخاب قالب'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Brand Identity & Logos (هویت بصری و برند) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-base font-extrabold text-slate-900 dark:text-white">
          <Type className="w-5 h-5 text-blue-600" />
          <span>۲. اطلاعات و برندینگ پایگاه خبری</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1">عنوان اصلی سایت:</label>
            <input
              type="text"
              value={formData.siteName}
              onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">شعار و زیرعنوان پایگاه خبری:</label>
            <input
              type="text"
              value={formData.siteSubtitle}
              onChange={(e) => setFormData({ ...formData, siteSubtitle: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div className="md:col-span-2 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <label className="block text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>لوگوی اختصاصی سایت (آپلود مستقیم فایل از سیستم شما):</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div className="sm:col-span-2 space-y-2">
                <label className="border-2 border-dashed border-blue-400/60 hover:border-blue-600 bg-white dark:bg-slate-900 p-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors text-xs font-bold text-slate-700 dark:text-slate-200">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileUpload}
                    className="hidden"
                  />
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>انتخاب فایل لوگو از سیستم / رایانه</span>
                </label>

                <input
                  type="text"
                  placeholder="یا درج آدرس مستقیم اینترنتی لوگو (URL)..."
                  value={formData.siteLogoUrl || ''}
                  onChange={(e) => setFormData({ ...formData, siteLogoUrl: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs"
                />
              </div>

              {/* Logo Preview */}
              <div>
                {formData.siteLogoUrl ? (
                  <div className="relative p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center min-h-[70px]">
                    <img
                      src={formData.siteLogoUrl}
                      alt="لوگو"
                      className="max-h-14 max-w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, siteLogoUrl: '' }))}
                      className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full shadow hover:bg-red-700 transition-colors"
                      title="حذف لوگو"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="min-h-[70px] rounded-xl bg-slate-200 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 gap-1">
                    <ImageIcon className="w-5 h-5" />
                    <span className="text-[10px]">لوگویی آپلود نشده</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">نحوه نمایش لوگو در هدر:</label>
            <select
              value={formData.logoType}
              onChange={(e) => setFormData({ ...formData, logoType: e.target.value as any })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold"
            >
              <option value="both">لوگو تصویری + عنوان متنی</option>
              <option value="image">فقط لوگوی تصویری</option>
              <option value="text">فقط عنوان متنی</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Color Palette & Typography (پالت رنگ و فونت) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-base font-extrabold text-slate-900 dark:text-white">
          <Palette className="w-5 h-5 text-purple-600" />
          <span>۳. پالت رنگی و تایپوگرافی سایت</span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-2">رنگ اصلی برند (Primary Color):</label>
            <div className="flex flex-wrap items-center gap-3">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch.hex}
                  type="button"
                  onClick={() => setFormData({ ...formData, primaryColor: swatch.hex })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    formData.primaryColor === swatch.hex
                      ? 'border-slate-900 dark:border-white ring-2 ring-blue-500/50 scale-105'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: swatch.hex }} />
                  <span>{swatch.name}</span>
                </button>
              ))}

              <div className="flex items-center gap-2 mr-auto">
                <span className="text-xs text-slate-500">کد سفارشی:</span>
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-8 h-8 rounded border-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-xs font-bold mb-1">فونت اصلی سایت:</label>
              <select
                value={formData.fontFamily}
                onChange={(e) => setFormData({ ...formData, fontFamily: e.target.value as FontFamily })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold"
              >
                <option value="vazir">وزیرمتن استاندارد (Vazirmatn Regular/Medium)</option>
                <option value="vazir-bold">وزیرمتن بولد (Vazirmatn Bold - ۷۰۰/۸۰۰)</option>
                <option value="vazir-light">وزیرمتن لایت (Vazirmatn Light - ۳۰۰)</option>
                <option value="shabnam">شبنم (Shabnam - پرانرژی مطبوعاتی)</option>
                <option value="iransans">ایران‌سنس کلاسیک (IRANSans - روزنامه‌ای)</option>
                <option value="system">فونت سیستمی استاندارد</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">انحنای زوایا (Corner Radius):</label>
              <select
                value={formData.cornerRadius}
                onChange={(e) => setFormData({ ...formData, cornerRadius: e.target.value as CornerRadius })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold"
              >
                <option value="none">بدون انحنا (Sharp Classic - روزنامه‌ای)</option>
                <option value="sm">انحنای ملایم (Small - ۴ پیکسل)</option>
                <option value="md">انحنای مدرن (Medium - ۸ پیکسل)</option>
                <option value="lg">انحنای نرم (Large - ۱۲ پیکسل)</option>
                <option value="full">انحنای گرد کامل (Pill)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Layouts: Header & Footer & Mobile Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-base font-extrabold text-slate-900 dark:text-white">
          <Layout className="w-5 h-5 text-emerald-600" />
          <span>۴. استایل هدر، فوتر و باتوم‌بار موبایل</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Header Layout */}
          <div>
            <label className="block text-xs font-bold mb-2">چیدمان هدر (Header Style):</label>
            <div className="space-y-2">
              {[
                { id: 'magazine', title: 'مجله‌ای ترکیبی (تاریخ + لوگو + منو)', desc: 'شامل نوار بالا، آب و هوا، لوگو و منوی دسته‌ها' },
                { id: 'minimal', title: 'مینی‌مال تک‌خطی (Minimal Clean)', desc: 'لوگو، جستجو، نشان‌شده و ورود در یک خط' },
                { id: 'newspaper', title: 'مطبو‌عاتی کلاسیک (Newspaper)', desc: 'تیتر سنتی وسط‌چین با حواشی روزنامه‌ای' },
                { id: 'compact', title: 'فشرده چسبان (Compact Sticky)', desc: 'هدر کم‌ارتفاع مناسب خواندن راحت' },
              ].map((h) => (
                <label
                  key={h.id}
                  className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    formData.headerStyle === h.id
                      ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/20'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="headerStyle"
                    checked={formData.headerStyle === h.id}
                    onChange={() => setFormData({ ...formData, headerStyle: h.id as HeaderStyle })}
                    className="mt-1"
                  />
                  <div>
                    <span className="font-bold text-xs block text-slate-900 dark:text-white">{h.title}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{h.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Footer & Mobile Toggles */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-2">چیدمان فوتر (Footer Style):</label>
              <select
                value={formData.footerStyle}
                onChange={(e) => setFormData({ ...formData, footerStyle: e.target.value as FooterStyle })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold"
              >
                <option value="multicolumn">چند ستونه جامع (درباره + خبرنامه + لینک‌ها)</option>
                <option value="magazine">مطبوعاتی وسط‌چین با نمادهای اعتماد</option>
                <option value="minimal">مینی‌مال ساده با کپی‌رایت</option>
              </select>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <div>
                  <span className="font-bold text-xs block">نمایش نوار تاریخ شمسی روز در بالای هدر</span>
                  <span className="text-[10px] text-slate-400">تاریخ شمسی روز در نوار بالای سایت</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.showWeatherAndDate}
                  onChange={(e) => setFormData({ ...formData, showWeatherAndDate: e.target.checked })}
                  className="w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <div>
                  <span className="font-bold text-xs block">نمایش نوار اخبار فوری (Breaking Ticker)</span>
                  <span className="text-[10px] text-slate-400">نوار قرمز رنگ متحرک در بالا یا پایین هدر</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.showBreakingTicker}
                  onChange={(e) => setFormData({ ...formData, showBreakingTicker: e.target.checked })}
                  className="w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <div>
                  <span className="font-bold text-xs block flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-blue-600" /> نمایش باتوم‌بار موبایل (Mobile Bottom Nav)
                  </span>
                  <span className="text-[10px] text-slate-400">منوی شناور در پایین صفحه برای گوشی‌های هوشمند</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.showMobileBottomNav}
                  onChange={(e) => setFormData({ ...formData, showMobileBottomNav: e.target.checked })}
                  className="w-4 h-4"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Contact & Social Links */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-base font-extrabold text-slate-900 dark:text-white">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <span>۵. لینک‌های شبکه اجتماعی و اطلاعات ارتباط با ما</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          توجه: فقط آدرس‌ها و اطلاعاتی که پر شوند در فوتر و بخش ارتباط با ما نمایش داده می‌شوند. در صورت خالی بودن، کلاً مخفی خواهند شد.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1">لینک کانال تلگرام:</label>
            <input
              type="text"
              placeholder="https://t.me/your_channel"
              value={formData.socialLinks?.telegram || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, telegram: e.target.value },
                })
              }
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">لینک صفحه اینستاگرام:</label>
            <input
              type="text"
              placeholder="https://instagram.com/your_page"
              value={formData.socialLinks?.instagram || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, instagram: e.target.value },
                })
              }
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">لینک توییتر / X:</label>
            <input
              type="text"
              placeholder="https://twitter.com/your_account"
              value={formData.socialLinks?.twitter || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, twitter: e.target.value },
                })
              }
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">لینک پیام‌رسان بله:</label>
            <input
              type="text"
              placeholder="https://ble.ir/your_channel"
              value={formData.socialLinks?.bale || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, bale: e.target.value },
                })
              }
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">لینک واتس‌اپ:</label>
            <input
              type="text"
              placeholder="https://wa.me/989120000000"
              value={formData.socialLinks?.whatsapp || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, whatsapp: e.target.value },
                })
              }
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">لینک یوتیوب:</label>
            <input
              type="text"
              placeholder="https://youtube.com/@channel"
              value={formData.socialLinks?.youtube || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, youtube: e.target.value },
                })
              }
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">لینک خوراک RSS:</label>
            <input
              type="text"
              placeholder="/rss.xml"
              value={formData.socialLinks?.rss || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, rss: e.target.value },
                })
              }
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">شماره تلفن تماس / پشتیبانی:</label>
            <input
              type="text"
              placeholder="۰۲۱-۸۸۸۸۸۸۸۸"
              value={formData.contactPhone || ''}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">ایمیل تماس و ارتباط با ما:</label>
            <input
              type="email"
              placeholder="info@yoursite.ir"
              value={formData.contactEmail || ''}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
            />
          </div>
        </div>
      </div>
    </form>
  );
};

import React, { useState } from 'react';
import { Ad } from '../../types';
import { Tag, Plus, ExternalLink, Eye, MousePointerClick, Trash2, Edit, Upload, Image as ImageIcon, X } from 'lucide-react';

interface AdManagerProps {
  ads: Ad[];
  onSaveAd: (ad: Partial<Ad>) => Promise<void>;
  onDeleteAd: (id: string) => Promise<void>;
}

export const AdManager: React.FC<AdManagerProps> = ({ ads, onSaveAd, onDeleteAd }) => {
  const [editingAd, setEditingAd] = useState<Partial<Ad> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleAdImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('حجم تصویر نباید بیشتر از ۱۰ مگابایت باشد.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingAd((prev) => (prev ? { ...prev, imageUrl: reader.result as string } : null));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateNew = () => {
    setEditingAd({
      title: 'بنر تبلیغاتی جدید',
      position: 'sidebar',
      imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800',
      targetUrl: 'https://example.com',
      isActive: true,
      clicks: 0,
      impressions: 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd || !editingAd.title) return;

    setIsSaving(true);
    try {
      await onSaveAd(editingAd);
      setEditingAd(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const getPositionName = (pos: string) => {
    switch (pos) {
      case 'top_leaderboard':
        return 'بنر بالای سایت (۷۲۸x۹۰ لیدربورد)';
      case 'sidebar':
        return 'بنر ستون کناری (۳۰۰x۲۵۰ یا ۳۰۰x۶۰۰)';
      case 'in_article':
        return 'بنر درون متن مقاله (In-Article)';
      case 'feed_grid':
        return 'کارت آگهی بین لیست اخبار (Native Feed)';
      case 'bottom_sticky':
        return 'بنر شناور پایین صفحه (Mobile Sticky)';
      default:
        return pos;
    }
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-500" /> مدیریت تبلیغات و حامیان مالی
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            تعریف بنرهای تبلیغاتی، لینک هدف، فعال/غیرفعال‌سازی و مشاهده آمار آگهی‌ها
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>تعریف بنر تبلیغاتی جدید</span>
        </button>
      </div>

      {/* Ad Creation / Editing Modal Form */}
      {editingAd && (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-50 dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-fadeIn"
        >
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
            {editingAd.id ? 'ویرایش بنر تبلیغاتی' : 'ایجاد بنر جدید'}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">عنوان بنر آگهی:</label>
              <input
                type="text"
                required
                value={editingAd.title || ''}
                onChange={(e) => setEditingAd({ ...editingAd, title: e.target.value })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">موقعیت جایگذاری بنر:</label>
              <select
                value={editingAd.position || 'sidebar'}
                onChange={(e) => setEditingAd({ ...editingAd, position: e.target.value as any })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold"
              >
                <option value="top_leaderboard">بنر بالای سایت (Top Leaderboard)</option>
                <option value="sidebar">بنر ستون کناری (Sidebar)</option>
                <option value="in_article">بنر بین متن خبر (In-Article)</option>
                <option value="feed_grid">کارت آگهی بین اخبار (Feed Grid)</option>
                <option value="bottom_sticky">بنر شناور پایین صفحه (Bottom Sticky)</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="block text-xs font-bold mb-1">تصویر بنر آگهی (آپلود از دستگاه):</label>
              <div className="flex items-center gap-3">
                <label className="flex-1 border-2 border-dashed border-blue-400/60 hover:border-blue-600 bg-white dark:bg-slate-900 p-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors text-xs font-bold text-slate-700 dark:text-slate-200">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAdImageUpload}
                    className="hidden"
                  />
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>انتخاب تصویر از کامپیوتر / دستگاه</span>
                </label>

                {editingAd.imageUrl && (
                  <img
                    src={editingAd.imageUrl}
                    alt="پیش‌نمایش"
                    className="w-16 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold mb-1">لینک هدف هنگام کلیک (Target URL):</label>
              <input
                type="text"
                required
                value={editingAd.targetUrl || ''}
                onChange={(e) => setEditingAd({ ...editingAd, targetUrl: e.target.value })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editingAd.isActive ?? true}
                onChange={(e) => setEditingAd({ ...editingAd, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">بنر فعال باشد و نمایش داده شود</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditingAd(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              >
                {isSaving ? 'در حال ذخیره...' : 'ذخیره بنر'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Ads List Table */}
      <div className="grid grid-cols-1 gap-4">
        {ads.map((ad) => (
          <div
            key={ad.id}
            className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <img src={ad.imageUrl} alt={ad.title} className="w-20 h-14 rounded-lg object-cover shrink-0 border" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                      ad.isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {ad.isActive ? 'فعال' : 'غیرفعال'}
                  </span>
                  <span className="text-[11px] text-blue-600 font-bold">{getPositionName(ad.position)}</span>
                </div>
                <h5 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{ad.title}</h5>
                <a
                  href={ad.targetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-slate-400 hover:underline flex items-center gap-1 mt-1"
                >
                  <span>{ad.targetUrl}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Stats & Actions */}
            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1" title="نمایش‌ها">
                  <Eye className="w-4 h-4 text-slate-400" /> {(ad.impressions || 0).toLocaleString('fa-IR')}
                </span>
                <span className="flex items-center gap-1 font-bold text-emerald-600" title="کلیک‌ها">
                  <MousePointerClick className="w-4 h-4" /> {(ad.clicks || 0).toLocaleString('fa-IR')} کلیک
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingAd(ad)}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white transition-colors"
                  title="ویرایش"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteAd(ad.id)}
                  className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

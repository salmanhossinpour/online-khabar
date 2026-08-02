import React, { useState } from 'react';
import { SiteSettings, Article, Category, Ad, Comment, User } from '../../types';
import { PersonalizationStudio } from './PersonalizationStudio';
import { SeoStudio } from './SeoStudio';
import { ArticleEditor } from './ArticleEditor';
import { AdManager } from './AdManager';
import { MessengerImporter } from './MessengerImporter';
import {
  X,
  LayoutDashboard,
  Palette,
  Newspaper,
  PenTool,
  Tag,
  MessageSquare,
  Grid,
  Eye,
  Heart,
  Plus,
  Trash2,
  Edit,
  Check,
  Ban,
  ShieldCheck,
  Send,
  LogOut,
  Globe,
} from 'lucide-react';
import { updateComment, deleteComment, saveCategory, deleteCategory } from '../../lib/api';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettings;
  onSaveSettings: (settings: SiteSettings) => Promise<void>;
  articles: Article[];
  categories: Category[];
  ads: Ad[];
  comments: Comment[];
  currentUser: User | null;
  onSaveArticle: (article: Partial<Article>) => Promise<void>;
  onDeleteArticle: (id: string) => Promise<void>;
  onSaveAd: (ad: Partial<Ad>) => Promise<void>;
  onDeleteAd: (id: string) => Promise<void>;
  onRefreshData: () => void;
  onLogout?: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  articles,
  categories,
  ads,
  comments,
  currentUser,
  onSaveArticle,
  onDeleteArticle,
  onSaveAd,
  onDeleteAd,
  onRefreshData,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'personalization' | 'seo' | 'articles' | 'write' | 'messenger' | 'ads' | 'comments' | 'categories'
  >('overview');

  const [articleToEdit, setArticleToEdit] = useState<Article | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');

  if (!isOpen) return null;

  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);
  const totalLikes = articles.reduce((sum, a) => sum + (a.likes || 0), 0);
  const totalClicks = ads.reduce((sum, a) => sum + (a.clicks || 0), 0);

  const handleApproveComment = async (id: string) => {
    await updateComment(id, { status: 'approved' });
    onRefreshData();
  };

  const handleDeleteComment = async (id: string) => {
    await deleteComment(id);
    onRefreshData();
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await saveCategory({
      name: newCatName,
      slug: newCatSlug || newCatName.toLowerCase().replace(/\s+/g, '-'),
      color: '#3b82f6',
    });
    setNewCatName('');
    setNewCatSlug('');
    onRefreshData();
  };

  const handleDeleteCat = async (id: string) => {
    await deleteCategory(id);
    onRefreshData();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-center p-2 sm:p-4 animate-fadeIn overflow-hidden">
      <div className="relative w-full max-w-6xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto flex flex-col md:flex-row h-[92vh] overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Admin Sidebar Tabs */}
        <div className="w-full md:w-64 bg-slate-900 text-white p-4 flex flex-col justify-between shrink-0 border-b md:border-b-0 md:border-l border-slate-800">
          <div>
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">پنل مدیریت پیشرفته</h4>
                <span className="text-[10px] text-blue-400 font-medium">NeDB Database Engine</span>
              </div>
            </div>

            <nav className="space-y-1">
              {[
                { id: 'overview', label: '📊 آمار و داشبورد', icon: LayoutDashboard },
                { id: 'personalization', label: '🎨 استودیو شخصی‌سازی', icon: Palette },
                { id: 'seo', label: '🚀 سئو و بهینه‌سازی (SEO Wizard)', icon: Globe },
                { id: 'articles', label: '📰 مدیریت اخبار', icon: Newspaper },
                { id: 'write', label: '✍️ استودیو نویسندگی', icon: PenTool },
                { id: 'messenger', label: '📱 پایش پیام‌رسان‌ها (تلگرام/بله/واتس‌اپ)', icon: Send },
                { id: 'ads', label: '📢 تبلیغات و حامیان', icon: Tag },
                { id: 'categories', label: '🗂️ دسته‌بندی‌ها', icon: Grid },
                { id: 'comments', label: '💬 مدیریت دیدگاه‌ها', icon: MessageSquare },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (tab.id === 'write') setArticleToEdit(null);
                      setActiveTab(tab.id as any);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-white truncate max-w-[120px]">{currentUser?.name || 'کاربر ارشد'}</span>
            <div className="flex items-center gap-1">
              {onLogout && (
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="p-1.5 rounded-lg bg-red-950/80 text-red-300 hover:bg-red-600 hover:text-white transition-colors"
                  title="خروج کامل از حساب کاربری"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="بستن پنجره"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {/* 1. Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">داشبورد آمار و تحلیل عملکرد</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                  <span className="text-xs text-blue-600 font-bold block">کل مقالات و اخبار</span>
                  <span className="text-2xl font-black text-blue-900 dark:text-blue-100 mt-1 block">
                    {articles.length.toLocaleString('fa-IR')}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-xs text-emerald-600 font-bold block">مجموع بازدید اخبار</span>
                  <span className="text-2xl font-black text-emerald-900 dark:text-emerald-100 mt-1 block">
                    {totalViews.toLocaleString('fa-IR')}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                  <span className="text-xs text-amber-600 font-bold block">کل لایک‌های کاربران</span>
                  <span className="text-2xl font-black text-amber-900 dark:text-amber-100 mt-1 block">
                    {totalLikes.toLocaleString('fa-IR')}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                  <span className="text-xs text-purple-600 font-bold block">کلیک تبلیغات</span>
                  <span className="text-2xl font-black text-purple-900 dark:text-purple-100 mt-1 block">
                    {totalClicks.toLocaleString('fa-IR')}
                  </span>
                </div>
              </div>

              {/* Quick Action Shortcuts */}
              <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-3">
                <h4 className="font-extrabold text-sm text-blue-400">میانبرهای مدیریت سریع:</h4>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('personalization')}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-xs"
                  >
                    🎨 تغییر لوگو و رنگ تم
                  </button>
                  <button
                    onClick={() => setActiveTab('messenger')}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 font-bold text-xs"
                  >
                    📱 پایش تلگرام، بله و واتس‌اپ
                  </button>
                  <button
                    onClick={() => {
                      setArticleToEdit(null);
                      setActiveTab('write');
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs"
                  >
                    ✍️ نگارش خبر جدید با هوش مصنوعی
                  </button>
                  <button
                    onClick={() => setActiveTab('seo')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-xs"
                  >
                    🚀 دستیار سئو و نقشه سایت
                  </button>
                  <button
                    onClick={() => setActiveTab('ads')}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 font-bold text-xs"
                  >
                    📢 تعریف بنر جدید
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. Personalization Studio */}
          {activeTab === 'personalization' && (
            <PersonalizationStudio settings={settings} onSaveSettings={onSaveSettings} />
          )}

          {/* 3. SEO Studio */}
          {activeTab === 'seo' && (
            <SeoStudio settings={settings} articles={articles} onSaveSettings={onSaveSettings} />
          )}

          {/* 3. News Articles Management */}
          {activeTab === 'articles' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black">مدیریت لیست اخبار</h3>
                <button
                  onClick={() => {
                    setArticleToEdit(null);
                    setActiveTab('write');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> خبر جدید
                </button>
              </div>

              <div className="space-y-3">
                {articles.map((art) => (
                  <div
                    key={art.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <img src={art.imageUrl} alt={art.title} className="w-16 h-12 rounded-lg object-cover shrink-0" />
                      <div>
                        <span className="text-[10px] text-blue-600 font-bold">{art.category}</span>
                        <h5 className="font-bold text-xs line-clamp-1">{art.title}</h5>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>{art.views} بازدید</span>
                          <span>•</span>
                          <span>{new Date(art.createdAt).toLocaleDateString('fa-IR')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => {
                          setArticleToEdit(art);
                          setActiveTab('write');
                        }}
                        className="p-1.5 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 text-xs font-bold"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteArticle(art.id)}
                        className="p-1.5 rounded-lg bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-200 text-xs font-bold"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Write / Article Editor */}
          {activeTab === 'write' && (
            <ArticleEditor
              articleToEdit={articleToEdit}
              categories={categories}
              currentUser={currentUser}
              onSaveArticle={onSaveArticle}
              onCancel={() => setActiveTab('articles')}
            />
          )}

          {/* Messenger News Importer (Telegram, Bale, WhatsApp) */}
          {activeTab === 'messenger' && (
            <MessengerImporter
              categories={categories}
              currentUser={currentUser}
              onSaveArticle={onSaveArticle}
            />
          )}

          {/* 5. Ads Manager */}
          {activeTab === 'ads' && (
            <AdManager ads={ads} onSaveAd={onSaveAd} onDeleteAd={onDeleteAd} />
          )}

          {/* 6. Categories Manager */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <h3 className="text-xl font-black">مدیریت دسته‌بندی‌های خبر</h3>

              <form onSubmit={handleAddCategory} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-3">
                <h4 className="text-xs font-bold">افزودن دسته جدید:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="نام دسته (مثلاً: بورس و طلا)"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="bg-white dark:bg-slate-900 border p-2 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    placeholder="اسلاگ لاتین (مثلاً: economy)"
                    value={newCatSlug}
                    onChange={(e) => setNewCatSlug(e.target.value)}
                    className="bg-white dark:bg-slate-900 border p-2 rounded-xl text-xs"
                  />
                </div>
                <button type="submit" className="bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl">
                  ثبت دسته‌بندی
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 bg-white dark:bg-slate-800 rounded-xl border flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="font-bold text-xs">{c.name}</span>
                      <span className="text-[10px] text-slate-400">({c.slug})</span>
                    </div>
                    <button onClick={() => handleDeleteCat(c.id)} className="text-red-500 text-xs">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. Comments Manager */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <h3 className="text-xl font-black">مدیریت دیدگاه‌های کاربران</h3>
              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-blue-600">{c.userName}</span>
                      <span className="text-[10px] text-slate-400">{c.articleTitle}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300">{c.content}</p>
                    <div className="flex items-center justify-between pt-2 text-xs">
                      <span
                        className={`font-bold text-[10px] px-2 py-0.5 rounded ${
                          c.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.status === 'approved' ? 'تایید شده' : 'در انتظار'}
                      </span>
                      <div className="flex items-center gap-2">
                        {c.status !== 'approved' && (
                          <button
                            onClick={() => handleApproveComment(c.id)}
                            className="p-1 bg-emerald-600 text-white rounded text-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="p-1 bg-red-600 text-white rounded text-xs"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { SiteSettings, Category, User } from '../types';
import {
  Search,
  Bookmark,
  Sun,
  Moon,
  User as UserIcon,
  Newspaper,
  Calendar,
  Settings,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

interface HeaderProps {
  settings: SiteSettings;
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (categorySlug: string) => void;
  onOpenSearch: () => void;
  onOpenBookmarks: () => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onLogout?: () => void;
  currentUser: User | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  bookmarksCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  categories,
  activeCategory,
  onSelectCategory,
  onOpenSearch,
  onOpenBookmarks,
  onOpenAuth,
  onOpenAdmin,
  onLogout,
  currentUser,
  darkMode,
  onToggleDarkMode,
  bookmarksCount,
}) => {
  const currentDatePersian = new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'full',
  }).format(new Date());

  const logoStyle = {
    fontFamily: "'Vazirmatn', -apple-system, BlinkMacSystemFont, sans-serif",
  };

  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors sticky top-0 z-30 shadow-xs">
      {/* Top Utility Bar (for magazine & newspaper headers or when weather/date active) */}
      {settings.showWeatherAndDate && (
        <div className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-xs py-1.5 px-4 border-b border-slate-200/80 dark:border-slate-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4 text-[11px] sm:text-xs">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> {currentDatePersian}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden md:inline">
                {settings.siteSubtitle}
              </span>
              {currentUser?.role === 'admin' && (
                <button
                  onClick={onOpenAdmin}
                  className="inline-flex items-center gap-1 text-[11px] text-white font-bold px-2 py-0.5 rounded hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: settings.primaryColor || '#2563eb' }}
                >
                  <ShieldCheck className="w-3 h-3" /> پنل مدیریت
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div
          onClick={() => onSelectCategory('all')}
          className="cursor-pointer flex items-center gap-3 group"
        >
          {settings.siteLogoUrl ? (
            <img
              src={settings.siteLogoUrl}
              alt={settings.siteName}
              className="h-10 sm:h-12 w-auto object-contain rounded"
            />
          ) : (
            <div
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md transition-transform group-hover:scale-105"
              style={{ backgroundColor: settings.primaryColor || '#2563eb' }}
            >
              <Newspaper className="w-6 h-6" />
            </div>
          )}

          <div>
            <h1
              className="text-xl sm:text-2xl font-vazir-black font-black tracking-tight text-slate-900 dark:text-white"
              style={logoStyle}
            >
              {settings.siteName}
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
              {settings.siteSubtitle}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Search Button */}
          <button
            onClick={onOpenSearch}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
            title="جستجو در اخبار"
          >
            <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="hidden md:inline">جستجو</span>
          </button>

          {/* Bookmarks */}
          <button
            onClick={onOpenBookmarks}
            className="relative p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
            title="اخبار نشان‌شده"
          >
            <Bookmark className="w-4 h-4 text-amber-500" />
            <span className="hidden md:inline">نشان‌شده‌ها</span>
            {bookmarksCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                {bookmarksCount}
              </span>
            )}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="تغییر حالت شب/روز"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Auth / Admin Profile */}
          {currentUser ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={currentUser.role === 'admin' || currentUser.role === 'author' ? onOpenAdmin : onOpenAuth}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="مشاهده پروفایل / پنل"
              >
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <UserIcon className="w-4 h-4" />
                )}
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-bold block leading-none">{currentUser.name}</span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">
                    {currentUser.role === 'admin' ? 'مدیر کل' : currentUser.role === 'author' ? 'نویسنده' : 'کاربر'}
                  </span>
                </div>
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors"
                  title="خروج از حساب کاربری"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-2 rounded-xl text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: settings.primaryColor || '#2563eb' }}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>ورود / عضویت</span>
            </button>
          )}

          {/* Quick Customization Button for Guest/Admin */}
          <button
            onClick={onOpenAdmin}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors hidden lg:flex items-center gap-1 text-xs font-bold"
            title="تنظیمات استایل و تم"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Navigation Bar */}
      <nav className="border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 sm:gap-2 py-2">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === 'all'
                ? 'text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
            style={{
              backgroundColor: activeCategory === 'all' ? settings.primaryColor || '#2563eb' : undefined,
            }}
          >
            همه اخبار
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === cat.slug
                  ? 'text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
              style={{
                backgroundColor: activeCategory === cat.slug ? settings.primaryColor || '#2563eb' : undefined,
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color || '#3b82f6' }} />
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
};

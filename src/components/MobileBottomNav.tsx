import React from 'react';
import { Home, Grid, Bookmark, Search, User as UserIcon, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface MobileBottomNavProps {
  activeTab: 'home' | 'categories' | 'bookmarks' | 'search' | 'profile';
  onChangeTab: (tab: 'home' | 'categories' | 'bookmarks' | 'search' | 'profile') => void;
  bookmarksCount: number;
  currentUser: User | null;
  onOpenAdmin: () => void;
  onOpenAuth: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onChangeTab,
  bookmarksCount,
  currentUser,
  onOpenAdmin,
  onOpenAuth,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 z-40 px-2 py-2 shadow-2xl">
      <div className="flex items-center justify-around">
        {/* Home */}
        <button
          onClick={() => onChangeTab('home')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'home'
              ? 'text-blue-600 dark:text-blue-400 font-extrabold scale-105'
              : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">خانه</span>
        </button>

        {/* Categories */}
        <button
          onClick={() => onChangeTab('categories')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'categories'
              ? 'text-blue-600 dark:text-blue-400 font-extrabold scale-105'
              : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px]">دسته‌ها</span>
        </button>

        {/* Search */}
        <button
          onClick={() => onChangeTab('search')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'search'
              ? 'text-blue-600 dark:text-blue-400 font-extrabold scale-105'
              : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px]">جستجو</span>
        </button>

        {/* Bookmarks */}
        <button
          onClick={() => onChangeTab('bookmarks')}
          className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'bookmarks'
              ? 'text-amber-500 font-extrabold scale-105'
              : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <Bookmark className="w-5 h-5" />
          <span className="text-[10px]">نشان‌شده</span>
          {bookmarksCount > 0 && (
            <span className="absolute top-0 right-2 bg-amber-500 text-slate-950 text-[9px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {bookmarksCount}
            </span>
          )}
        </button>

        {/* Profile / Admin */}
        <button
          onClick={() => {
            if (currentUser?.role === 'admin' || currentUser?.role === 'author') {
              onOpenAdmin();
            } else {
              onOpenAuth();
            }
          }}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'profile'
              ? 'text-blue-600 dark:text-blue-400 font-extrabold scale-105'
              : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          {currentUser?.role === 'admin' ? (
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          ) : (
            <UserIcon className="w-5 h-5" />
          )}
          <span className="text-[10px]">
            {currentUser ? (currentUser.role === 'admin' ? 'مدیریت' : 'پروفایل') : 'ورود'}
          </span>
        </button>
      </div>
    </div>
  );
};

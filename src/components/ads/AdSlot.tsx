import React from 'react';
import { Ad } from '../../types';
import { recordAdClick } from '../../lib/api';
import { ExternalLink, Tag } from 'lucide-react';

interface AdSlotProps {
  ads: Ad[];
  position: 'top_leaderboard' | 'sidebar' | 'in_article' | 'feed_grid' | 'bottom_sticky';
  onCloseSticky?: () => void;
}

export const AdSlot: React.FC<AdSlotProps> = ({ ads, position, onCloseSticky }) => {
  const matchingAds = ads.filter((a) => a.position === position && a.isActive);
  if (matchingAds.length === 0) return null;

  // Select first active ad or random
  const ad = matchingAds[0];

  const handleClick = () => {
    if (ad.id) {
      recordAdClick(ad.id);
    }
    if (ad.targetUrl) {
      window.open(ad.targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (position === 'top_leaderboard') {
    return (
      <div className="w-full my-4 px-2 sm:px-4">
        <div
          onClick={handleClick}
          className="group relative w-full h-20 sm:h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 cursor-pointer shadow-sm hover:shadow-md transition-all flex items-center justify-between px-4"
        >
          {ad.imageUrl ? (
            <img
              src={ad.imageUrl}
              alt={ad.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/40 to-transparent flex items-center justify-between p-4 text-white">
            <div>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider bg-amber-500/90 text-slate-950 font-bold px-2 py-0.5 rounded">
                <Tag className="w-3 h-3" /> تبلیغ ویژه
              </span>
              <h4 className="font-bold text-sm sm:text-base mt-1 line-clamp-1">{ad.title}</h4>
            </div>
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium text-white group-hover:bg-white group-hover:text-slate-900 transition-colors">
              <span>مشاهده</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (position === 'sidebar') {
    return (
      <div className="w-full my-4">
        <div className="text-[11px] font-medium text-slate-400 mb-1 flex items-center justify-between">
          <span>تبلیغات حامی</span>
          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">آگهی</span>
        </div>
        <div
          onClick={handleClick}
          className="group relative w-full h-64 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 cursor-pointer shadow-sm hover:shadow-md transition-all flex flex-col justify-end p-4"
        >
          {ad.imageUrl && (
            <img
              src={ad.imageUrl}
              alt={ad.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent" />
          <div className="relative z-10 text-white">
            <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-bold">
              پیشنهاد ویژه
            </span>
            <h4 className="font-bold text-sm mt-1.5 leading-snug line-clamp-2">{ad.title}</h4>
            <button className="mt-3 w-full py-1.5 bg-white text-slate-900 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-1">
              <span>دیدن اطلاعات بیشتر</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (position === 'in_article') {
    return (
      <div className="my-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-amber-500" /> تبلیغ مرتبط با مطلب
          </span>
          <span className="text-[10px]">اسپانسر خبر</span>
        </div>
        <div
          onClick={handleClick}
          className="group cursor-pointer flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-colors"
        >
          {ad.imageUrl && (
            <img
              src={ad.imageUrl}
              alt={ad.title}
              className="w-full sm:w-32 h-24 object-cover rounded-md group-hover:opacity-90"
            />
          )}
          <div className="flex-1">
            <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">{ad.title}</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              جهت ورود به وب‌سایت اصلی و استفاده از تخفیف ویژه روی لینک کلیک نمایید.
            </p>
            <span className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold mt-2 group-hover:underline">
              ورود به وب‌سایت <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (position === 'feed_grid') {
    return (
      <div
        onClick={handleClick}
        className="group cursor-pointer rounded-xl overflow-hidden border-2 border-dashed border-amber-300 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-4 flex flex-col justify-between hover:bg-amber-100/50 transition-all"
      >
        <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 font-bold mb-2">
          <span className="flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" /> آگهی تبلیغاتی
          </span>
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
        {ad.imageUrl && (
          <img src={ad.imageUrl} alt={ad.title} className="w-full h-36 object-cover rounded-lg my-2" />
        )}
        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 line-clamp-2">{ad.title}</h4>
      </div>
    );
  }

  if (position === 'bottom_sticky') {
    return (
      <div className="fixed bottom-16 sm:bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 bg-slate-900 text-white rounded-xl p-3 shadow-2xl border border-slate-700 flex items-center justify-between gap-3 animate-bounce-short">
        <div onClick={handleClick} className="flex items-center gap-3 cursor-pointer flex-1 overflow-hidden">
          {ad.imageUrl && <img src={ad.imageUrl} alt={ad.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />}
          <div className="min-w-0 flex-1">
            <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded">پیشنهاد روز</span>
            <p className="text-xs font-bold line-clamp-1 mt-0.5">{ad.title}</p>
          </div>
        </div>
        {onCloseSticky && (
          <button
            onClick={onCloseSticky}
            className="text-slate-400 hover:text-white p-1 text-xs rounded bg-slate-800 hover:bg-slate-700 flex-shrink-0"
            title="بستن"
          >
            ✕
          </button>
        )}
      </div>
    );
  }

  return null;
};

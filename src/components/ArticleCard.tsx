import React from 'react';
import { Article } from '../types';
import { Clock, Eye, Flame, Heart, Sparkles, Pin } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  variant?: 'grid' | 'list' | 'compact';
  onSelectArticle: (article: Article) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (e: React.MouseEvent, article: Article) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  variant = 'grid',
  onSelectArticle,
  isBookmarked,
  onToggleBookmark,
}) => {
  if (variant === 'compact') {
    return (
      <div
        onClick={() => onSelectArticle(article)}
        className="group cursor-pointer py-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded-lg transition-colors flex items-start gap-3"
      >
        <span className="w-2 h-2 rounded-full bg-theme-primary mt-2 shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1">
            <span className="text-theme-primary font-bold">{article.category}</span>
            <span>•</span>
            <span>{article.readingTime} دقیقه</span>
          </div>
          <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 group-hover:text-theme-primary line-clamp-2 leading-snug">
            {article.title}
          </h4>
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div
        onClick={() => onSelectArticle(article)}
        className="group cursor-pointer bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all p-3 flex flex-col sm:flex-row items-center gap-4"
      >
        <div className="relative w-full sm:w-48 h-36 shrink-0 rounded-lg overflow-hidden">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-md">
            {article.category}
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-1">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-400">
              {article.isBreaking && (
                <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.2 rounded flex items-center gap-0.5">
                  <Flame className="w-3 h-3" /> فوری
                </span>
              )}
              {article.isPinned && (
                <span className="bg-theme-primary text-white text-[10px] font-black px-2 py-0.2 rounded flex items-center gap-0.5">
                  <Pin className="w-3 h-3" /> سنجاق
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {article.readingTime} دقیقه مطالعه
              </span>
            </div>

            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-theme-primary transition-colors line-clamp-2 leading-snug">
              {article.title}
            </h3>

            <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>نویسنده: {article.authorName}</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {article.views.toLocaleString('fa-IR')}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Grid default variant
  return (
    <div
      onClick={() => onSelectArticle(article)}
      className="group cursor-pointer bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <span className="bg-theme-primary text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-md shadow-md">
            {article.category}
          </span>
          {article.isBreaking && (
            <span className="bg-red-600 text-white font-extrabold text-[11px] px-2 py-0.5 rounded-md flex items-center gap-0.5 shadow-md">
              <Flame className="w-3 h-3" /> فوری
            </span>
          )}
          {article.isEditorialPick && (
            <span className="bg-amber-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-md flex items-center gap-0.5">
              <Sparkles className="w-3 h-3" /> ویژه
            </span>
          )}
        </div>

        {onToggleBookmark && (
          <button
            onClick={(e) => onToggleBookmark(e, article)}
            className={`absolute top-3 left-3 p-2 rounded-full backdrop-blur-md transition-colors z-10 ${
              isBookmarked
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-900/60 text-white hover:bg-white hover:text-slate-900'
            }`}
            title="نشان کردن"
          >
            ★
          </button>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-theme-primary transition-colors line-clamp-2 leading-snug">
            {article.title}
          </h3>

          <p className="text-slate-500 dark:text-slate-400 text-xs mt-2.5 line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {article.readingTime} دقیقه
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {article.views.toLocaleString('fa-IR')}
            </span>
          </div>

          <div className="flex items-center gap-1 text-red-500 font-bold">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>{article.likes || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

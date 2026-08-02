import React, { useState, useEffect } from 'react';
import { Article } from '../types';
import { Flame, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

interface BreakingTickerProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

export const BreakingTicker: React.FC<BreakingTickerProps> = ({ articles, onSelectArticle }) => {
  const breakingNews = articles.filter((a) => a.isBreaking || a.isPinned);
  const newsList = breakingNews.length > 0 ? breakingNews : articles.slice(0, 5);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || newsList.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % newsList.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, newsList.length]);

  if (newsList.length === 0) return null;

  const currentArticle = newsList[currentIndex];

  return (
    <div className="w-full bg-slate-900 text-white border-y border-red-800/40 py-2 px-3 sm:px-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
        {/* Label Badge */}
        <div className="flex items-center gap-1.5 bg-red-600 text-white font-black px-2.5 py-1 rounded-md shrink-0 animate-pulse">
          <Flame className="w-4 h-4 fill-current" />
          <span className="whitespace-nowrap">اخبار فوری:</span>
        </div>

        {/* Sliding Title */}
        <div
          onClick={() => onSelectArticle(currentArticle)}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="flex-1 overflow-hidden cursor-pointer group flex items-center gap-2"
        >
          <span className="font-bold text-slate-100 group-hover:text-red-400 transition-colors line-clamp-1">
            {currentArticle.title}
          </span>
          <span className="hidden md:inline-block text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded shrink-0">
            {currentArticle.category}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 shrink-0 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-700"
            title={isPaused ? 'ادامه' : 'توقف'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + newsList.length) % newsList.length)}
            className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-700"
            title="قبلی"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % newsList.length)}
            className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-700"
            title="بعدی"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

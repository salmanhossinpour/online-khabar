import React, { useState, useEffect } from 'react';
import { Article } from '../../types';
import { ChevronRight, ChevronLeft, Clock, Eye, Sparkles, Flame } from 'lucide-react';

interface HeroSliderProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ articles, onSelectArticle }) => {
  const featured = articles.filter((a) => a.isFeatured || a.isPinned);
  const slides = featured.length > 0 ? featured : articles.slice(0, 5);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    if (!isAutoPlay || slides.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlay, slides.length]);

  if (slides.length === 0) return null;

  const current = slides[activeIndex];

  return (
    <div
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
      className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 bg-slate-900 group my-4"
    >
      {/* Main Slide Image */}
      <div className="relative h-[360px] sm:h-[480px] w-full overflow-hidden">
        <img
          src={current.imageUrl}
          alt={current.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent hidden md:block" />

        {/* Badges & Category */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <span className="bg-theme-primary text-white font-bold text-xs px-3 py-1 rounded-full shadow-lg">
            {current.category}
          </span>
          {current.isBreaking && (
            <span className="bg-red-600 text-white font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg animate-pulse">
              <Flame className="w-3.5 h-3.5 fill-current" /> خبر فوری
            </span>
          )}
          {current.isEditorialPick && (
            <span className="bg-amber-500 text-slate-950 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
              <Sparkles className="w-3.5 h-3.5" /> پیشنهاد تحریریه
            </span>
          )}
        </div>

        {/* Slide Info Content */}
        <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 z-10 text-white max-w-4xl">
          <div className="flex items-center gap-4 text-xs text-slate-300 mb-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {current.readingTime} دقیقه مطالعه
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {current.views.toLocaleString('fa-IR')} بازدید
            </span>
            <span className="hidden sm:inline-block font-medium">نویسنده: {current.authorName}</span>
          </div>

          <h2
            onClick={() => onSelectArticle(current)}
            className="text-xl sm:text-3xl font-black leading-tight sm:leading-snug text-white hover:text-amber-300 transition-colors cursor-pointer line-clamp-2"
          >
            {current.title}
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm mt-2.5 line-clamp-2 leading-relaxed hidden sm:block">
            {current.excerpt}
          </p>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => onSelectArticle(current)}
              className="px-5 py-2 bg-theme-primary text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all transform active:scale-95 hover:opacity-90"
            >
              ادامه و مطالعه خبر
            </button>
          </div>
        </div>

        {/* Next / Prev Buttons */}
        <button
          onClick={() => setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/60 backdrop-blur-md text-white hover:bg-white hover:text-slate-900 transition-all z-20 shadow-md"
          title="خبر قبلی"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <button
          onClick={() => setActiveIndex((prev) => (prev + 1) % slides.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/60 backdrop-blur-md text-white hover:bg-white hover:text-slate-900 transition-all z-20 shadow-md"
          title="خبر بعدی"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Slide Thumbnails Indicator Bar */}
      <div className="bg-slate-950/90 border-t border-slate-800 p-2 sm:p-3 hidden sm:flex items-center gap-2 overflow-x-auto">
        {slides.map((slide, idx) => (
          <button
            key={slide.id}
            onClick={() => setActiveIndex(idx)}
            className={`flex-1 min-w-[140px] text-right p-2 rounded-xl transition-all border text-xs ${
              idx === activeIndex
                ? 'bg-theme-light border-theme-primary text-white font-bold shadow-md'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span className="line-clamp-1">{slide.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

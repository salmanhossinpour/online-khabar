import React, { useRef } from 'react';
import { Article } from '../../types';
import { ChevronRight, ChevronLeft, Clock, Flame } from 'lucide-react';

interface CarouselSliderProps {
  title: string;
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

export const CarouselSlider: React.FC<CarouselSliderProps> = ({ title, articles, onSelectArticle }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (articles.length === 0) return null;

  return (
    <div className="my-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-6 bg-blue-600 rounded-full" />
          <h3 className="font-black text-lg sm:text-xl text-slate-800 dark:text-slate-100">{title}</h3>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-blue-600 hover:text-white transition-colors"
            title="قبلی"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-blue-600 hover:text-white transition-colors"
            title="بعدی"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-none scroll-smooth snap-x snap-mandatory"
      >
        {articles.map((art) => (
          <div
            key={art.id}
            onClick={() => onSelectArticle(art)}
            className="min-w-[260px] sm:min-w-[300px] max-w-[300px] bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group snap-start flex flex-col"
          >
            <div className="relative h-44 overflow-hidden">
              <img
                src={art.imageUrl}
                alt={art.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded">
                {art.category}
              </div>
              {art.isBreaking && (
                <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-0.5">
                  <Flame className="w-3 h-3" /> فوری
                </div>
              )}
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                  {art.title}
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">
                  {art.excerpt}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {art.readingTime} دقیقه
                </span>
                <span>{art.authorName}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

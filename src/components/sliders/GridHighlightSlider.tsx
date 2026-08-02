import React from 'react';
import { Article } from '../../types';
import { Sparkles, Clock, Flame } from 'lucide-react';

interface GridHighlightSliderProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

export const GridHighlightSlider: React.FC<GridHighlightSliderProps> = ({ articles, onSelectArticle }) => {
  const items = articles.slice(0, 4);
  if (items.length === 0) return null;

  const main = items[0];
  const sideItems = items.slice(1, 4);

  return (
    <div className="my-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <h3 className="font-black text-lg sm:text-xl text-slate-800 dark:text-slate-100">برگزیده اخبار داغ هفته</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Big Card */}
        <div
          onClick={() => onSelectArticle(main)}
          className="lg:col-span-2 relative h-[320px] sm:h-[400px] rounded-2xl overflow-hidden group cursor-pointer border border-slate-200 dark:border-slate-800 shadow-md"
        >
          <img
            src={main.imageUrl}
            alt={main.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="bg-blue-600 text-white font-bold text-xs px-3 py-1 rounded-full">
              {main.category}
            </span>
            {main.isBreaking && (
              <span className="bg-red-600 text-white font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-current" /> فوری
              </span>
            )}
          </div>

          <div className="absolute bottom-0 inset-x-0 p-6 text-white">
            <h2 className="font-extrabold text-lg sm:text-2xl leading-snug group-hover:text-blue-300 transition-colors line-clamp-2">
              {main.title}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 line-clamp-2 leading-relaxed">
              {main.excerpt}
            </p>
            <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {main.readingTime} دقیقه مطالعه
              </span>
              <span>{main.authorName}</span>
            </div>
          </div>
        </div>

        {/* 3 Secondary Cards */}
        <div className="flex flex-col gap-4">
          {sideItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectArticle(item)}
              className="relative h-[120px] rounded-xl overflow-hidden group cursor-pointer border border-slate-200 dark:border-slate-800 shadow-sm flex items-center bg-slate-900"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent" />

              <div className="absolute bottom-0 inset-x-0 p-3 text-white">
                <span className="text-[10px] text-blue-400 font-bold block mb-0.5">{item.category}</span>
                <h4 className="font-bold text-xs sm:text-sm group-hover:text-blue-300 line-clamp-2 leading-tight">
                  {item.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

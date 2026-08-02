import React, { useState, useEffect } from 'react';
import { Article } from '../../types';
import { Flame, ChevronUp, ChevronDown, Clock } from 'lucide-react';

interface VerticalNewsSliderProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

export const VerticalNewsSlider: React.FC<VerticalNewsSliderProps> = ({ articles, onSelectArticle }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (articles.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % articles.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [articles.length]);

  if (articles.length === 0) return null;

  const current = articles[index];

  return (
    <div className="bg-slate-900 text-white rounded-xl p-4 my-4 shadow-md border border-slate-800">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-red-500 animate-pulse" />
          <span className="font-extrabold text-xs sm:text-sm text-red-400">داغ‌ترین تیترها</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={() => setIndex((prev) => (prev - 1 + articles.length) % articles.length)}
            className="p-1 hover:text-white rounded hover:bg-slate-800"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIndex((prev) => (prev + 1) % articles.length)}
            className="p-1 hover:text-white rounded hover:bg-slate-800"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        onClick={() => onSelectArticle(current)}
        className="cursor-pointer group transition-all duration-300"
      >
        <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
          <span className="text-blue-400 font-bold">{current.category}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {current.readingTime} دقیقه
          </span>
        </div>
        <h4 className="font-bold text-sm sm:text-base text-slate-100 group-hover:text-blue-300 line-clamp-2 leading-relaxed">
          {current.title}
        </h4>
      </div>
    </div>
  );
};

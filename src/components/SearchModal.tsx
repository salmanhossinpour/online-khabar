import React, { useState } from 'react';
import { Article } from '../types';
import { X, Search } from 'lucide-react';
import { ArticleCard } from './ArticleCard';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, articles, onSelectArticle }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = articles.filter(
    (art) =>
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.tags?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-center p-4 pt-16 animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col max-h-[85vh]">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-6 h-6 text-blue-600" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="عبارت، کلمه کلیدی یا تیتر خبر مورد نظر را جستجو کنید..."
            className="flex-1 bg-transparent text-base sm:text-lg font-bold text-slate-900 dark:text-white focus:outline-none placeholder-slate-400"
          />
        </div>

        <div className="overflow-y-auto flex-1 space-y-3">
          {searchTerm.trim() === '' ? (
            <p className="text-center text-xs text-slate-400 py-10">یک عبارت برای شروع جستجو تایپ کنید...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-10">هیچ خبری مرتبط با عبارت «{searchTerm}» پیدا نشد.</p>
          ) : (
            filtered.map((art) => (
              <ArticleCard
                key={art.id}
                article={art}
                variant="list"
                onSelectArticle={(a) => {
                  onSelectArticle(a);
                  onClose();
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Article } from '../types';
import { X, Bookmark } from 'lucide-react';
import { ArticleCard } from './ArticleCard';

interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarkedArticles: Article[];
  onSelectArticle: (article: Article) => void;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  isOpen,
  onClose,
  bookmarkedArticles,
  onSelectArticle,
}) => {
  if (!isOpen) return null;

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
          <Bookmark className="w-6 h-6 text-amber-500" />
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            اخبار نشان‌شده شما ({bookmarkedArticles.length})
          </h3>
        </div>

        <div className="overflow-y-auto flex-1 space-y-3">
          {bookmarkedArticles.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-12">
              شما هنوز هیچ خبری را نشان نکرده‌اید. روی ستاره روی هر کارت کلیک کنید تا ذخیره شود.
            </p>
          ) : (
            bookmarkedArticles.map((art) => (
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

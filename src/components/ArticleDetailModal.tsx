import React, { useState, useEffect } from 'react';
import { Article, Comment, Ad, User } from '../types';
import {
  X,
  Heart,
  Eye,
  Clock,
  Share2,
  Bookmark,
  Send,
  User as UserIcon,
  MessageSquare,
  Sparkles,
  Check,
} from 'lucide-react';
import { fetchComments, addComment, likeArticle, recordArticleView } from '../lib/api';
import { AdSlot } from './ads/AdSlot';

interface ArticleDetailModalProps {
  article: Article | null;
  onClose: () => void;
  onSelectRelated: (article: Article) => void;
  allArticles: Article[];
  ads: Ad[];
  currentUser: User | null;
  isBookmarked: boolean;
  onToggleBookmark: (article: Article) => void;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({
  article,
  onClose,
  onSelectRelated,
  allArticles,
  ads,
  currentUser,
  isBookmarked,
  onToggleBookmark,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState(currentUser?.name || '');
  const [commentEmail, setCommentEmail] = useState(currentUser?.email || '');
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (!article) return;

    setLikes(article.likes || 0);
    setHasLiked(false);
    recordArticleView(article.id);

    // Fetch comments
    fetchComments({ articleId: article.id, status: 'approved' })
      .then(setComments)
      .catch((e) => console.error('Comments fetch error:', e));

    if (currentUser) {
      setCommentAuthor(currentUser.name);
      setCommentEmail(currentUser.email);
    }
  }, [article, currentUser]);

  if (!article) return null;

  const relatedArticles = allArticles
    .filter((a) => a.id !== article.id && a.category === article.category)
    .slice(0, 3);

  const handleLike = async () => {
    if (hasLiked) return;
    try {
      const newLikes = await likeArticle(article.id);
      setLikes(newLikes);
      setHasLiked(true);
    } catch (e) {
      console.error('Like error:', e);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !commentAuthor.trim()) return;

    setIsSubmittingComment(true);
    try {
      const newCom = await addComment({
        articleId: article.id,
        articleTitle: article.title,
        userName: commentAuthor,
        userEmail: commentEmail || 'user@khabar.ir',
        content: commentText,
        userAvatar: currentUser?.avatar,
      });

      setComments([newCom, ...comments]);
      setCommentText('');
    } catch (e) {
      console.error('Add comment error:', e);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-center overflow-y-auto p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden text-slate-900 dark:text-slate-100 flex flex-col max-h-[92vh]">
        {/* Sticky Header Actions */}
        <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white font-bold text-xs px-3 py-1 rounded-full">
              {article.category}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1 hidden sm:flex">
              <Clock className="w-3.5 h-3.5" /> {article.readingTime} دقیقه مطالعه
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Bookmark Button */}
            <button
              onClick={() => onToggleBookmark(article)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                isBookmarked
                  ? 'bg-amber-500 text-slate-950 border-amber-500'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
              title="نشان کردن خبر"
            >
              <Bookmark className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-600 hover:text-white transition-colors text-slate-600 dark:text-slate-300"
              title="بستن"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {/* Article Title Header */}
          <div>
            <h1 className="text-xl sm:text-3xl font-black leading-tight text-slate-900 dark:text-white">
              {article.title}
            </h1>
            {article.subtitle && (
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2 font-medium leading-relaxed">
                {article.subtitle}
              </p>
            )}

            {/* Meta Row */}
            <div className="mt-4 pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-3">
              <div className="flex items-center gap-3">
                {article.authorAvatar && (
                  <img
                    src={article.authorAvatar}
                    alt={article.authorName}
                    className="w-8 h-8 rounded-full object-cover border border-slate-300"
                  />
                )}
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{article.authorName}</span>
                  <span className="text-[10px]">نویسنده تحریریه</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4 text-slate-400" /> {article.views.toLocaleString('fa-IR')} بازدید
                </span>
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1 font-bold px-3 py-1 rounded-full transition-all ${
                    hasLiked
                      ? 'bg-red-600 text-white shadow'
                      : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                  <span>{likes}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Cover Image */}
          {article.imageUrl && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
              <img src={article.imageUrl} alt={article.title} className="w-full max-h-[420px] object-cover" />
              {article.imageCaption && (
                <p className="p-2.5 bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 dark:text-slate-400 text-center font-medium italic">
                  عکس: {article.imageCaption}
                </p>
              )}
            </div>
          )}

          {/* Article HTML Content */}
          <div
            className="prose dark:prose-invert max-w-none text-sm sm:text-base leading-loose text-slate-800 dark:text-slate-200 space-y-4"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* In-Article Ad Banner Placement */}
          <AdSlot ads={ads} position="in_article" />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 block mb-2">برچسب‌های کلیدی:</span>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white transition-colors text-slate-700 dark:text-slate-300 text-xs px-3 py-1 rounded-lg font-medium cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social Share Bar */}
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-slate-800/60 border border-blue-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-blue-600" /> اشتراک‌گذاری خبر با دوستان:
            </span>
            <div className="flex items-center gap-2">
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-sky-500 text-white font-bold text-xs hover:bg-sky-600 transition-colors"
              >
                تلگرام
              </a>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + window.location.href)}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
              >
                واتس‌اپ
              </a>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                <span>{copied ? 'کپی شد!' : 'کپی لینک'}</span>
              </button>
            </div>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> اخبار مرتبط با این بخش
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {relatedArticles.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectRelated(rel)}
                    className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-colors cursor-pointer group"
                  >
                    <img src={rel.imageUrl} alt={rel.title} className="w-full h-24 object-cover rounded-lg mb-2" />
                    <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-blue-600 line-clamp-2 leading-snug">
                      {rel.title}
                    </h5>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" /> نظرات کاربران ({comments.length})
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleSubmitComment} className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="نام و نام خانوادگی شما *"
                  required
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
                <input
                  type="email"
                  placeholder="ایمیل شما (نمایش داده نمی‌شود)"
                  value={commentEmail}
                  onChange={(e) => setCommentEmail(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <textarea
                rows={3}
                placeholder="دیدگاه خود درباره این خبر را بنویسید..."
                required
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 leading-relaxed"
              />

              <button
                type="submit"
                disabled={isSubmittingComment}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmittingComment ? 'در حال ارسال...' : 'ارسال نظر'}</span>
              </button>
            </form>

            {/* Comments List */}
            {comments.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-4">هنوز نظری ثبت نشده است. اولین نظر را شما ارسال کنید!</p>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                          {c.userName.charAt(0)}
                        </div>
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{c.userName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.createdAt).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pr-8">{c.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Category, User, Article } from '../../types';
import { Send, MessageCircle, PhoneCall, Sparkles, Upload, Check, RefreshCw, Image as ImageIcon, Trash2, ArrowUpRight, Copy, Radio, Plus, Download } from 'lucide-react';
import { generateAIAssistant, fetchMessengerChannel } from '../../lib/api';

interface MessengerImporterProps {
  categories: Category[];
  currentUser: User | null;
  onSaveArticle: (article: Partial<Article>) => Promise<void>;
}

interface MessengerPost {
  id: string;
  source: 'telegram' | 'whatsapp' | 'bale';
  channelName: string;
  senderName: string;
  text: string;
  imageUrl?: string;
  date: string;
  published: boolean;
}

const INITIAL_MESSENGER_POSTS: MessengerPost[] = [];

export const MessengerImporter: React.FC<MessengerImporterProps> = ({
  categories,
  currentUser,
  onSaveArticle,
}) => {
  const [activeMessengerTab, setActiveMessengerTab] = useState<'all' | 'telegram' | 'bale' | 'whatsapp' | 'paste'>('all');
  const [posts, setPosts] = useState<MessengerPost[]>(INITIAL_MESSENGER_POSTS);
  const [isSyncing, setIsSyncing] = useState(false);

  // Channel IDs (default to user test channel https://t.me/naeeena)
  const [telegramChannel, setTelegramChannel] = useState('https://t.me/naeeena');
  const [baleChannel, setBaleChannel] = useState('@bale_news');
  const [whatsappGroup, setWhatsappGroup] = useState('https://whatsapp.com/channel/news');

  // Manual Paste State
  const [pastedSource, setPastedSource] = useState<'telegram' | 'bale' | 'whatsapp'>('telegram');
  const [pastedText, setPastedText] = useState('');
  const [pastedImage, setPastedImage] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.name || 'عمومی');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('حجم عکس نباید بیشتر از ۱۰ مگابایت باشد.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPastedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePost = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleClearAllPosts = () => {
    if (confirm('آیا از پاک‌سازی تمام پست‌های دریافت شده مطمئن هستید؟')) {
      setPosts([]);
    }
  };

  const handleSyncFeed = async (overrideSource?: string, overrideChannel?: string) => {
    setIsSyncing(true);
    try {
      const sourceToFetch = overrideSource || (activeMessengerTab === 'paste' ? 'telegram' : activeMessengerTab);
      let channelToFetch = overrideChannel || telegramChannel;
      if (sourceToFetch === 'bale') channelToFetch = baleChannel;
      if (sourceToFetch === 'whatsapp') channelToFetch = whatsappGroup;

      const livePosts = await fetchMessengerChannel(sourceToFetch, channelToFetch);

      if (livePosts && livePosts.length > 0) {
        setPosts((prev) => {
          const existingTexts = new Set(prev.map((p) => p.text.slice(0, 35)));
          const newUniquePosts = livePosts.filter((p) => !existingTexts.has(p.text.slice(0, 35)));
          return [...newUniquePosts, ...prev];
        });
      } else {
        alert('پست جدیدی از این کانال دریافت نشد. لطفاً مطمئن شوید کانال عمومی است.');
      }
    } catch (err: any) {
      alert('خطا در دریافت اطلاعات کانال: ' + (err.message || 'خطای شبکه'));
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    // Initial fetch from Telegram default channel on load
    handleSyncFeed('telegram', telegramChannel);
  }, []);

  const handleAddPastedPost = () => {
    if (!pastedText.trim()) {
      alert('لطفاً متن پیام کپی شده را وارد کنید.');
      return;
    }

    const newPost: MessengerPost = {
      id: `msg-${Date.now()}`,
      source: pastedSource,
      channelName:
        pastedSource === 'telegram'
          ? 'کپی شده از تلگرام'
          : pastedSource === 'bale'
          ? 'کپی شده از پیام‌رسان بله'
          : 'کپی شده از واتس‌اپ',
      senderName: currentUser?.name || 'مدیر تحریریه',
      text: pastedText,
      imageUrl: pastedImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80',
      date: 'همین الان',
      published: false,
    };

    setPosts((prev) => [newPost, ...prev]);
    setPastedText('');
    setPastedImage('');
    alert('پیام با موفقیت به لیست اخبار پایش شده اضافه شد!');
  };

  const handlePublishPostToSite = async (post: MessengerPost) => {
    setPublishingId(post.id);
    try {
      let articleTitle = post.text.slice(0, 60) + '...';
      let articleExcerpt = post.text.slice(0, 150) + '...';
      let articleContent = `<p>${post.text}</p><p><em>منبع خبر: دریافت شده از کانال ${post.channelName}</em></p>`;
      let articleTags = ['خبر_فوری', 'پایش_شبکه‌های_اجتماعی', post.source];

      // Try AI formatting if prompt is available
      try {
        const aiResponse = await generateAIAssistant(post.text, 'full_article');
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.title) articleTitle = parsed.title;
          if (parsed.excerpt) articleExcerpt = parsed.excerpt;
          if (parsed.content) articleContent = parsed.content;
          if (parsed.tags) articleTags = parsed.tags;
        }
      } catch (e) {
        console.log('AI formatting fallback used for messenger import.');
      }

      await onSaveArticle({
        title: articleTitle,
        excerpt: articleExcerpt,
        content: articleContent,
        category: selectedCategory,
        imageUrl: post.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80',
        authorName: `${currentUser?.name || 'تحریریه'} (${post.channelName})`,
        authorRole: 'خبرنگار شبکه‌های اجتماعی',
        tags: articleTags,
        isBreaking: false,
        isFeatured: false,
        readingTime: 2,
      });

      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, published: true } : p))
      );
    } catch (err: any) {
      alert('خطا در انتشار خبر: ' + (err.message || 'خطای شبکه'));
    } finally {
      setPublishingId(null);
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (activeMessengerTab === 'all' || activeMessengerTab === 'paste') return true;
    return p.source === activeMessengerTab;
  });

  return (
    <div className="space-y-6 animate-fadeIn text-slate-900 dark:text-slate-100">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white p-6 rounded-3xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="bg-white/20 text-white text-[11px] font-extrabold px-3 py-1 rounded-full inline-flex items-center gap-1.5 mb-2">
            <Radio className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> مرکز ربات‌های دریافت خبر از پیام‌رسان‌ها
          </span>
          <h3 className="text-xl font-black">پایش و دریافت خودکار اخبار از تلگرام، بله و واتس‌اپ</h3>
          <p className="text-xs text-sky-100 mt-1 leading-relaxed">
            امکان دریافت مستقیم پست‌ها و عکس‌ها از کانال‌های خبری تلگرام، پیام‌رسان ایرانی بله و گروه‌های واتس‌اپ و تبدیل یک‌کلیکه به خبر رسمی سایت
          </p>
        </div>

        <button
          onClick={handleSyncFeed}
          disabled={isSyncing}
          className="bg-white text-blue-700 hover:bg-sky-50 font-black text-xs px-5 py-3 rounded-2xl shadow-md transition-all shrink-0 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'در حال پایش کانال‌ها...' : 'بروزرسانی زنده کانال‌ها'}</span>
        </button>
      </div>

      {/* Messenger Source Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
        {[
          { id: 'all', label: 'همه کانال‌ها', icon: Radio, count: posts.length },
          { id: 'telegram', label: 'تلگرام (Telegram)', icon: Send, badgeBg: 'bg-sky-500' },
          { id: 'bale', label: 'بله (Bale Messenger)', icon: MessageCircle, badgeBg: 'bg-emerald-600' },
          { id: 'whatsapp', label: 'واتس‌اپ (WhatsApp)', icon: PhoneCall, badgeBg: 'bg-green-600' },
          { id: 'paste', label: '➕ ورود دستی پیام', icon: Copy, badgeBg: 'bg-amber-500' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeMessengerTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveMessengerTab(tab.id as any)}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md ring-1 ring-slate-200 dark:ring-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Channel ID Configuration Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h4 className="font-extrabold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <span>تنظیم کانال‌ها و ربات‌های پایش خبرگزاری:</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Telegram Settings */}
          <div className="p-3 bg-sky-50/60 dark:bg-sky-950/30 rounded-xl border border-sky-200 dark:border-sky-800/60 space-y-2">
            <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300 font-extrabold text-xs">
              <Send className="w-4 h-4" />
              <span>کانال تلگرام (Telegram Handle / Bot):</span>
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={telegramChannel}
                onChange={(e) => setTelegramChannel(e.target.value)}
                placeholder="@irna_1313 یا آیدی کانال"
                className="w-full bg-white dark:bg-slate-900 border border-sky-300 dark:border-sky-700 rounded-lg px-3 py-1.5 text-xs font-mono text-left dir-ltr"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => handleSyncFeed('telegram', telegramChannel)}
                disabled={isSyncing}
                className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1 shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>دریافت زنده</span>
              </button>
            </div>
          </div>

          {/* Bale Settings */}
          <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60 space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs">
              <MessageCircle className="w-4 h-4" />
              <span>کانال یا ربات بله (Bale Messenger):</span>
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={baleChannel}
                onChange={(e) => setBaleChannel(e.target.value)}
                placeholder="@bale_news"
                className="w-full bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-lg px-3 py-1.5 text-xs font-mono text-left dir-ltr"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => handleSyncFeed('bale', baleChannel)}
                disabled={isSyncing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1 shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>دریافت زنده</span>
              </button>
            </div>
          </div>

          {/* WhatsApp Settings */}
          <div className="p-3 bg-green-50/60 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-800/60 space-y-2">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-extrabold text-xs">
              <PhoneCall className="w-4 h-4" />
              <span>گروه یا کانال واتس‌اپ (WhatsApp Link):</span>
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={whatsappGroup}
                onChange={(e) => setWhatsappGroup(e.target.value)}
                placeholder="https://chat.whatsapp.com/..."
                className="w-full bg-white dark:bg-slate-900 border border-green-300 dark:border-green-700 rounded-lg px-3 py-1.5 text-xs font-mono text-left dir-ltr"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => handleSyncFeed('whatsapp', whatsappGroup)}
                disabled={isSyncing}
                className="bg-green-600 hover:bg-green-700 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1 shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>دریافت زنده</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Paste Section (اگر تب ورود دستی انتخاب شد یا دکمه کپی) */}
      {(activeMessengerTab === 'paste' || activeMessengerTab === 'all') && (
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl space-y-4 shadow-xl border border-indigo-800/50">
          <div className="flex items-center justify-between border-b border-indigo-800/60 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              <h4 className="font-extrabold text-sm text-white">
                ورود سریع خبر کپی شده از پیام‌رسان + عکس از کامپیوتر
              </h4>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold">
              تولید اتوماتیک مقاله با AI
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Messenger Source Selection */}
            <div className="md:col-span-12 flex items-center gap-4 flex-wrap">
              <span className="text-xs font-bold text-slate-300">منبع پیام:</span>
              {[
                { id: 'telegram', label: 'تلگرام', color: 'bg-sky-600' },
                { id: 'bale', label: 'پیام‌رسان بله', color: 'bg-emerald-600' },
                { id: 'whatsapp', label: 'واتس‌اپ', color: 'bg-green-600' },
              ].map((s) => (
                <label key={s.id} className="flex items-center gap-1.5 cursor-pointer text-xs font-bold">
                  <input
                    type="radio"
                    name="pastedSource"
                    checked={pastedSource === s.id}
                    onChange={() => setPastedSource(s.id as any)}
                    className="accent-amber-400"
                  />
                  <span>{s.label}</span>
                </label>
              ))}

              <div className="mr-auto flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300">دسته‌بندی در سایت:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Text Input */}
            <div className="md:col-span-8 space-y-2">
              <label className="block text-xs font-bold text-slate-300">متن پست کپی شده از تلگرام/بله/واتس‌اپ:</label>
              <textarea
                rows={4}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="متن کامل خبر، اطلاعیه یا پست کانال را اینجا Past کنید..."
                className="w-full bg-slate-900/90 border border-indigo-700/60 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 leading-relaxed"
              />
            </div>

            {/* Image Upload Input */}
            <div className="md:col-span-4 space-y-2">
              <label className="block text-xs font-bold text-slate-300">عکس همراه پست (آپلود از سیستم):</label>
              <label className="border-2 border-dashed border-indigo-500/50 hover:border-amber-400 bg-slate-900/60 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center h-[105px]">
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                <Upload className="w-5 h-5 text-amber-400" />
                <span className="text-[11px] font-bold text-slate-200">
                  {pastedImage ? '✓ عکس انتخاب شد (برای تغییر کلیک کنید)' : 'انتخاب تصویر از کامپیوتر'}
                </span>
              </label>

              {pastedImage && (
                <div className="relative h-12 rounded-xl overflow-hidden border border-amber-400/50">
                  <img src={pastedImage} alt="پیش‌نمایش" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddPastedPost}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن پیام به لیست پایش و آماده‌سازی برای انتشار</span>
          </button>
        </div>
      )}

      {/* Extracted Posts Feed */}
      <div className="space-y-4">
        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center justify-between">
          <span>لیست پست‌های پایش شده ({filteredPosts.length})</span>
          {filteredPosts.length > 0 && (
            <button
              onClick={handleClearAllPosts}
              className="text-xs text-red-500 hover:text-red-600 font-bold flex items-center gap-1 bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-900"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>پاک‌سازی لیست</span>
            </button>
          )}
        </h4>

        {filteredPosts.length === 0 ? (
          <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
            <Radio className="w-8 h-8 text-sky-500 mx-auto animate-pulse" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
              هیچ پستی هنوز برای این پیام‌رسان دریافت نشده است.
            </p>
            <p className="text-[11px] text-slate-400">
              آیدی کانال عمومی دلخواه را در کادرهای تنظیمات بالا وارد کرده و روی دکمه «دریافت زنده» کلیک کنید.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPosts.map((post) => {
              const isTelegram = post.source === 'telegram';
              const isBale = post.source === 'bale';
              const isWhatsapp = post.source === 'whatsapp';

              return (
                <div
                  key={post.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
                    post.published
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div>
                    {/* Post Header */}
                    <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span
                          className={`p-1.5 rounded-lg text-white font-bold text-[10px] flex items-center gap-1 ${
                            isTelegram
                              ? 'bg-sky-500'
                              : isBale
                              ? 'bg-emerald-600'
                              : 'bg-green-600'
                          }`}
                        >
                          {isTelegram && <Send className="w-3 h-3" />}
                          {isBale && <MessageCircle className="w-3 h-3" />}
                          {isWhatsapp && <PhoneCall className="w-3 h-3" />}
                          <span>{isTelegram ? 'تلگرام' : isBale ? 'بله' : 'واتس‌اپ'}</span>
                        </span>
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">
                          {post.channelName}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">{post.date}</span>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          title="حذف این پست"
                          className="text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Post Body & Image */}
                    <div className="flex gap-3">
                      {post.imageUrl && (
                        <img
                          src={post.imageUrl}
                          alt="تصویر پست"
                          className="w-24 h-20 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                      )}
                      <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed font-medium">
                        {post.text}
                      </p>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400">
                      {post.published ? '✓ منتشر شده در سایت' : 'آماده انتشار'}
                    </span>

                    <button
                      onClick={() => handlePublishPostToSite(post)}
                      disabled={post.published || publishingId === post.id}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm ${
                        post.published
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {publishingId === post.id ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>در حال نگارش و انتشار...</span>
                        </>
                      ) : post.published ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>در سایت منتشر شد</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>⚡ تبدیل به خبر و انتشار در سایت</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

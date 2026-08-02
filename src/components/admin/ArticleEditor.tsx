import React, { useState } from 'react';
import { Article, Category, User } from '../../types';
import { generateAIAssistant } from '../../lib/api';
import { Sparkles, Save, Flame, Pin, Check, Upload, Image as ImageIcon, X, Key } from 'lucide-react';

interface ArticleEditorProps {
  articleToEdit?: Article | null;
  categories: Category[];
  currentUser: User | null;
  onSaveArticle: (article: Partial<Article>) => Promise<void>;
  onCancel: () => void;
}

export const ArticleEditor: React.FC<ArticleEditorProps> = ({
  articleToEdit,
  categories,
  currentUser,
  onSaveArticle,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Partial<Article>>({
    id: articleToEdit?.id,
    title: articleToEdit?.title || '',
    subtitle: articleToEdit?.subtitle || '',
    slug: articleToEdit?.slug || '',
    excerpt: articleToEdit?.excerpt || '',
    content:
      articleToEdit?.content ||
      '<p>متن خبر خود را در این بخش بنویسید. می‌توانید از پاراگراف‌ها، تیترها و لیست‌ها استفاده کنید...</p>',
    category: articleToEdit?.category || categories[0]?.slug || 'tech',
    tags: articleToEdit?.tags || ['خبر', 'گزارش'],
    imageUrl:
      articleToEdit?.imageUrl ||
      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200',
    imageCaption: articleToEdit?.imageCaption || '',
    readingTime: articleToEdit?.readingTime || 3,
    isBreaking: articleToEdit?.isBreaking || false,
    isFeatured: articleToEdit?.isFeatured || false,
    isPinned: articleToEdit?.isPinned || false,
    isEditorialPick: articleToEdit?.isEditorialPick || false,
    status: articleToEdit?.status || 'published',
    authorId: articleToEdit?.authorId || currentUser?.id || 'user-admin-1',
    authorName: articleToEdit?.authorName || currentUser?.name || 'سردبیر تحریریه',
    authorAvatar: articleToEdit?.authorAvatar || currentUser?.avatar,
  });

  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);
  const [openRouterKey, setOpenRouterKey] = useState<string>(
    localStorage.getItem('openrouter_key') || ''
  );
  const [selectedModel, setSelectedModel] = useState<string>(
    localStorage.getItem('openrouter_model') || 'nvidia/nemotron-3-ultra-550b-a55b:free'
  );
  const [showKeyInput, setShowKeyInput] = useState(false);

  const handleSaveOpenRouterModel = (model: string) => {
    setSelectedModel(model);
    localStorage.setItem('openrouter_model', model);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('حجم تصویر انتخاب شده نباید بیشتر از ۱۰ مگابایت باشد.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          imageUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (idx: number) => {
    const updated = (formData.tags || []).filter((_, i) => i !== idx);
    setFormData({ ...formData, tags: updated });
  };

  const handleSaveOpenRouterKey = (key: string) => {
    setOpenRouterKey(key);
    localStorage.setItem('openrouter_key', key);
  };

  const handleAIAssist = async (action: 'title' | 'summary' | 'tags') => {
    if (!formData.title && !formData.content) {
      alert('لطفاً ابتدا عنوان یا بخشی از متن خبر را وارد کنید.');
      return;
    }

    setAiLoading(true);
    setAiSuggestions(null);
    try {
      const prompt = `${formData.title}\n\n${formData.excerpt}\n\n${formData.content}`;
      const text = await generateAIAssistant(prompt, action, openRouterKey, selectedModel);
      setAiSuggestions(text);

      if (action === 'summary' && text) {
        setFormData((prev) => ({ ...prev, excerpt: text.trim() }));
      }
    } catch (e: any) {
      alert(e.message || 'خطا در ارتباط با هوش مصنوعی OpenRouter/Gemini.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateFullArticle = async () => {
    const topicPrompt = formData.title.trim() || formData.content.trim();
    if (!topicPrompt) {
      alert('لطفاً ابتدا موضوع یا عنوان خبر را در کادر "تیتر اصلی خبر" بنویسید.');
      return;
    }

    setAiLoading(true);
    setAiSuggestions(null);

    try {
      const resultText = await generateAIAssistant(
        topicPrompt,
        'full_article',
        openRouterKey,
        selectedModel
      );

      let parsed: { title?: string; excerpt?: string; content?: string; tags?: string[] } = {};
      try {
        const jsonMatch = resultText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          parsed = JSON.parse(resultText);
        }
      } catch (err) {
        console.warn('Could not parse full article as JSON:', err);
        parsed = {
          title: formData.title || topicPrompt,
          excerpt: topicPrompt,
          content: `<p>${resultText}</p>`,
          tags: ['خبر_فوری', 'گزارش_تحلیلی'],
        };
      }

      const calculatedWords = (parsed.content || '').replace(/<[^>]*>?/gm, '').split(/\s+/).length;
      const calcReadingTime = Math.max(2, Math.ceil(calculatedWords / 120));

      setFormData((prev) => ({
        ...prev,
        title: parsed.title || prev.title || topicPrompt,
        excerpt: parsed.excerpt || prev.excerpt,
        content: parsed.content || prev.content,
        tags: parsed.tags && parsed.tags.length > 0 ? parsed.tags : prev.tags,
        readingTime: calcReadingTime,
      }));

      setAiSuggestions('✨ مطلب‌نویس هوشمند با موفقیت کل متن خبر، خلاصه، برچسب‌ها و زمان مطالعه را تولید و جای‌گذاری نمود!');
    } catch (e: any) {
      alert(e.message || 'خطا در نگارش خبر توسط هوش مصنوعی.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert('لطفاً عنوان و متن اصلی خبر را تکمیل نمایید.');
      return;
    }

    setIsSaving(true);
    try {
      await onSaveArticle(formData);
      onCancel();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn text-slate-900 dark:text-slate-100">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {articleToEdit ? 'ویرایش خبر و مقاله' : 'نگارش خبر جدید (استودیو نویسندگی)'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            محتوا، تیتر، تصویر شاخص و وضعیت انتشار خبر را تنظیم کنید
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'در حال ذخیره...' : 'انتشار خبر'}</span>
          </button>
        </div>
      </div>

      {/* AI Writer Helper Bar (OpenRouter & Gemini AI) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/50 via-indigo-900/40 to-blue-900/50 border border-purple-500/40 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <div>
              <span className="font-extrabold text-xs text-purple-200 block">دستیار تحریریه هوش مصنوعی (OpenRouter AI / Gemini)</span>
              <span className="text-[10px] text-purple-300">تولید پیشنهادات تیتر، خلاصه اتوماتیک خبر و هشتگ‌ها</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="px-2.5 py-1.5 rounded-lg bg-purple-950/80 border border-purple-500/40 hover:bg-purple-900 text-purple-200 text-[11px] font-bold flex items-center gap-1"
              title="تنظیم کلید OpenRouter"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>{openRouterKey ? 'کلید OpenRouter فعال' : 'تنظیم کلید OpenRouter'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleAIAssist('title')}
              disabled={aiLoading}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] transition-colors disabled:opacity-50"
            >
              پیشنهاد تیتر
            </button>
            <button
              type="button"
              onClick={() => handleAIAssist('summary')}
              disabled={aiLoading}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition-colors disabled:opacity-50"
            >
              خلاصه خودکار
            </button>
            <button
              type="button"
              onClick={() => handleAIAssist('tags')}
              disabled={aiLoading}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-colors disabled:opacity-50"
            >
              پیشنهاد برچسب
            </button>
            <button
              type="button"
              onClick={handleGenerateFullArticle}
              disabled={aiLoading}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-extrabold text-[11px] shadow-md flex items-center gap-1 transition-all transform active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{aiLoading ? 'در حال تولید خبر...' : '⚡ مطلب‌نویس هوشمند (تولید کامل خبر)'}</span>
            </button>
          </div>
        </div>

        {/* Optional OpenRouter Key & Model Settings */}
        {showKeyInput && (
          <div className="p-3 bg-purple-950/80 rounded-xl border border-purple-500/30 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-fadeIn">
            <div>
              <label className="block text-[11px] font-bold text-purple-200 mb-1">کلید اختصاصی OpenRouter (اختیاری):</label>
              <input
                type="password"
                placeholder="sk-or-v1-..."
                value={openRouterKey}
                onChange={(e) => handleSaveOpenRouterKey(e.target.value)}
                className="w-full bg-slate-900 border border-purple-500/40 rounded-lg px-3 py-1.5 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-[11px] font-bold text-purple-200">
                شناسه مدل هوش مصنوعی OpenRouter (Model ID):
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="مثال: nvidia/nemotron-3-ultra-550b-a55b:free"
                  value={selectedModel}
                  onChange={(e) => handleSaveOpenRouterModel(e.target.value)}
                  className="flex-1 bg-slate-900 border border-purple-500/40 rounded-lg px-3 py-1.5 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-amber-400 font-mono dir-ltr text-left"
                  dir="ltr"
                />
                <select
                  onChange={(e) => e.target.value && handleSaveOpenRouterModel(e.target.value)}
                  value=""
                  className="bg-purple-900/80 border border-purple-500/40 rounded-lg px-2 py-1.5 text-[11px] text-purple-100 focus:outline-none"
                >
                  <option value="" disabled>پیش‌فرض‌ها / مدل‌های سریع...</option>
                  <option value="nvidia/nemotron-3-ultra-550b-a55b:free">Nvidia Nemotron (رایگان)</option>
                  <option value="meta-llama/llama-3.3-70b-instruct:free">Llama 3.3 70B (رایگان)</option>
                  <option value="deepseek/deepseek-r1:free">DeepSeek R1 (رایگان)</option>
                  <option value="google/gemini-2.0-flash-001">Google Gemini 2.0 Flash</option>
                  <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                  <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
                </select>
              </div>
              <span className="text-[10px] text-purple-300 block">
                می‌توانید آی‌دی هر مدلی را از سایت OpenRouter کپی و در کادر بالا وارد کنید.
              </span>
            </div>
          </div>
        )}
      </div>

      {aiSuggestions && (
        <div className="p-3 bg-purple-950/80 border border-purple-500/50 rounded-xl text-xs text-purple-200 shadow-lg">
          <span className="font-bold text-amber-400 block mb-1">نتایج هوش مصنوعی OpenRouter:</span>
          <p className="whitespace-pre-wrap leading-relaxed">{aiSuggestions}</p>
        </div>
      )}

      {/* Title & Subtitle */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-extrabold mb-1">تیتر اصلی خبر یا موضوع (ضروری) *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({
                ...formData,
                title: e.target.value,
                slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
              })
            }
            placeholder="مثلاً: افتتاح نیروگاه خورشیدی بزرگ یا انتشار دستاوردهای تازه..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          />

          {/* Quick Smart Writer Button */}
          <div className="mt-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 border border-amber-500/30">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-xs font-bold text-slate-700 dark:text-amber-200">
                مطلب‌نویس هوشمند: موضوع را بالا بنویسید و کلیک کنید تا هوش مصنوعی کل خبر، خلاصه و برچسب‌ها را نگارش کند!
              </span>
            </div>
            <button
              type="button"
              onClick={handleGenerateFullArticle}
              disabled={aiLoading}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition-all transform active:scale-95 disabled:opacity-50 shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>{aiLoading ? 'در حال تولید خبر توسط هوش مصنوعی...' : 'تولید خودکار کل خبر با هوش مصنوعی'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1">سوتیتر / زیرعنوان خبر:</label>
            <input
              type="text"
              value={formData.subtitle || ''}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="توضیح کوتاه تکمیلی تیتر..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">دسته‌بندی خبر:</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-xs font-bold mb-1">چکیده و خلاصه خبر (در کارت‌ها نمایش داده می‌شود):</label>
          <textarea
            rows={2}
            value={formData.excerpt || ''}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            placeholder="خلاصه ۲ خطی از خبر..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs leading-relaxed"
          />
        </div>

        {/* Main Content HTML */}
        <div>
          <label className="block text-xs font-bold mb-1">متن کامل خبر (کد HTML یا متن ساده):</label>
          <textarea
            rows={8}
            required
            value={formData.content || ''}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="<p>متن اصلی خبر را اینجا وارد نمایید...</p>"
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-xs font-mono leading-relaxed"
          />
        </div>

        {/* Image Upload From User's Computer System */}
        <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
          <label className="block text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-600" />
            <span>تصویر اصلی / شاخص خبر (آپلود مستقیم فایل از دستگاه شما):</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div className="sm:col-span-2">
              <label className="border-2 border-dashed border-blue-400/60 dark:border-blue-500/40 hover:border-blue-600 bg-white dark:bg-slate-900 p-4 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="hidden"
                />
                <Upload className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  برای انتخاب و آپلود تصویر از کامپیوتر یا گوشی کلیک کنید
                </span>
                <span className="text-[10px] text-slate-400">فرمت‌های مجاز: JPG, PNG, WEBP (حداکثر ۱۰ مگابایت)</span>
              </label>
            </div>

            {/* Image Preview */}
            <div>
              {formData.imageUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                  <img
                    src={formData.imageUrl}
                    alt="پیش‌نمایش تصویر"
                    className="w-full h-32 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-colors"
                    title="حذف تصویر"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                    پیش‌نمایش تصویر
                  </span>
                </div>
              ) : (
                <div className="w-full h-32 rounded-xl bg-slate-200 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 gap-1">
                  <ImageIcon className="w-6 h-6" />
                  <span className="text-[10px]">تصویری انتخاب نشده</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">زیرنویس / منبع عکس (اختیاری):</label>
              <input
                type="text"
                value={formData.imageCaption || ''}
                onChange={(e) => setFormData({ ...formData, imageCaption: e.target.value })}
                placeholder="مثلاً: عکس از خبرگزاری ایرنا..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">زمان تخمینی مطالعه (دقیقه):</label>
              <input
                type="number"
                min={1}
                max={60}
                value={formData.readingTime || 3}
                onChange={(e) => setFormData({ ...formData, readingTime: Number(e.target.value) })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold"
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-bold mb-1">برچسب‌ها و هشتگ‌ها:</label>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="تایپ کنید و اینتر بزنید..."
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold"
            >
              افزودن
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.tags?.map((t, idx) => (
              <span
                key={idx}
                className="bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 font-bold"
              >
                #{t}
                <button type="button" onClick={() => handleRemoveTag(idx)} className="text-red-500 hover:text-red-700 mr-1">
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Feature Flags / Toggles */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isBreaking}
              onChange={(e) => setFormData({ ...formData, isBreaking: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-xs font-bold text-red-600 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> خبر فوری
            </span>
          </label>

          <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-xs font-bold text-blue-600">اسلایدر اصلی (ویژه)</span>
          </label>

          <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPinned}
              onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
              <Pin className="w-3.5 h-3.5" /> سنجاق بالای سایت
            </span>
          </label>

          <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isEditorialPick}
              onChange={(e) => setFormData({ ...formData, isEditorialPick: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-xs font-bold text-amber-600">پیشنهاد تحریریه</span>
          </label>
        </div>
      </div>
    </form>
  );
};

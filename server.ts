import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import Datastore from '@seald-io/nedb';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

import {
  initialSiteSettings,
  initialUsers,
  initialCategories,
  initialArticles,
  initialAds,
  initialComments,
} from './src/data/initialData';
import { Article, Category, Ad, SiteSettings, User, Comment } from './src/types';

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), '.data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// NeDB Collections
const settingsDb = new Datastore<SiteSettings>({ filename: path.join(DATA_DIR, 'settings.db'), autoload: true });
const usersDb = new Datastore<User>({ filename: path.join(DATA_DIR, 'users.db'), autoload: true });
const categoriesDb = new Datastore<Category>({ filename: path.join(DATA_DIR, 'categories.db'), autoload: true });
const articlesDb = new Datastore<Article>({ filename: path.join(DATA_DIR, 'articles.db'), autoload: true });
const adsDb = new Datastore<Ad>({ filename: path.join(DATA_DIR, 'ads.db'), autoload: true });
const commentsDb = new Datastore<Comment>({ filename: path.join(DATA_DIR, 'comments.db'), autoload: true });

// Seed NeDB Databases if empty
async function seedDatabaseIfEmpty() {
  try {
    const settingsCount = await settingsDb.countAsync({});
    if (settingsCount === 0) {
      await settingsDb.insertAsync(initialSiteSettings);
      console.log('Seeded NeDB settings');
    }

    const usersCount = await usersDb.countAsync({});
    if (usersCount === 0) {
      await usersDb.insertAsync(initialUsers);
      console.log('Seeded NeDB users');
    }

    const categoriesCount = await categoriesDb.countAsync({});
    if (categoriesCount === 0) {
      await categoriesDb.insertAsync(initialCategories);
      console.log('Seeded NeDB categories');
    }

    const articlesCount = await articlesDb.countAsync({});
    if (articlesCount === 0) {
      await articlesDb.insertAsync(initialArticles);
      console.log('Seeded NeDB articles');
    }

    const adsCount = await adsDb.countAsync({});
    if (adsCount === 0) {
      await adsDb.insertAsync(initialAds);
      console.log('Seeded NeDB ads');
    }

    const commentsCount = await commentsDb.countAsync({});
    if (commentsCount === 0) {
      await commentsDb.insertAsync(initialComments);
      console.log('Seeded NeDB comments');
    }
  } catch (err) {
    console.error('Error seeding NeDB database:', err);
  }
}

async function startServer() {
  await seedDatabaseIfEmpty();

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // API ROUTES

  // 1. Settings / Personalization
  app.get('/api/settings', async (_req, res) => {
    try {
      const settings = await settingsDb.findOneAsync({});
      if (!settings) {
        return res.json(initialSiteSettings);
      }
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch site settings' });
    }
  });

  app.put('/api/settings', async (req, res) => {
    try {
      const newSettings: SiteSettings = req.body;
      const existing = await settingsDb.findOneAsync({});
      if (existing) {
        await settingsDb.updateAsync({ _id: existing._id }, { $set: newSettings });
      } else {
        await settingsDb.insertAsync(newSettings);
      }
      const updated = await settingsDb.findOneAsync({});
      res.json(updated || newSettings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update site settings' });
    }
  });

  // 2. Articles CRUD & Search
  app.get('/api/articles', async (req, res) => {
    try {
      const { category, search, tag, isBreaking, isFeatured, isPinned, isEditorialPick, status, limit } = req.query;
      const query: any = {};

      if (category && category !== 'all') {
        query.category = category;
      }
      if (status) {
        query.status = status;
      } else {
        // default to published for public view unless specified
        if (!req.query.allStatus) {
          query.status = 'published';
        }
      }

      if (isBreaking === 'true') query.isBreaking = true;
      if (isFeatured === 'true') query.isFeatured = true;
      if (isPinned === 'true') query.isPinned = true;
      if (isEditorialPick === 'true') query.isEditorialPick = true;

      let articles = (await articlesDb.findAsync(query)) as Article[];

      // Search term filter (title, excerpt, content, tags)
      if (search && typeof search === 'string' && search.trim() !== '') {
        const term = search.trim().toLowerCase();
        articles = articles.filter(
          (art) =>
            art.title.toLowerCase().includes(term) ||
            art.excerpt.toLowerCase().includes(term) ||
            art.tags?.some((t) => t.toLowerCase().includes(term))
        );
      }

      if (tag && typeof tag === 'string') {
        articles = articles.filter((art) => art.tags?.includes(tag));
      }

      // Sort by newest first
      articles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      if (limit && !isNaN(Number(limit))) {
        articles = articles.slice(0, Number(limit));
      }

      res.json(articles);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch articles' });
    }
  });

  app.get('/api/articles/:id', async (req, res) => {
    try {
      const id = req.params.id;
      let article = await articlesDb.findOneAsync({ id });
      if (!article) {
        article = await articlesDb.findOneAsync({ slug: id });
      }
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }
      res.json(article);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch article' });
    }
  });

  app.post('/api/articles', async (req, res) => {
    try {
      const newArticle: Article = {
        ...req.body,
        id: req.body.id || `art-${Date.now()}`,
        views: req.body.views || 0,
        likes: req.body.likes || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const inserted = await articlesDb.insertAsync(newArticle);
      res.status(201).json(inserted);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create article' });
    }
  });

  app.put('/api/articles/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const updates = req.body;
      updates.updatedAt = new Date().toISOString();

      await articlesDb.updateAsync({ id }, { $set: updates });
      const updated = await articlesDb.findOneAsync({ id });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update article' });
    }
  });

  app.delete('/api/articles/:id', async (req, res) => {
    try {
      const id = req.params.id;
      await articlesDb.removeAsync({ id }, {});
      res.json({ success: true, message: 'Article deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete article' });
    }
  });

  app.post('/api/articles/:id/view', async (req, res) => {
    try {
      const id = req.params.id;
      await articlesDb.updateAsync({ id }, { $inc: { views: 1 } });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to record view' });
    }
  });

  app.post('/api/articles/:id/like', async (req, res) => {
    try {
      const id = req.params.id;
      await articlesDb.updateAsync({ id }, { $inc: { likes: 1 } });
      const updated = await articlesDb.findOneAsync({ id });
      res.json({ likes: updated?.likes || 0 });
    } catch (error) {
      res.status(500).json({ error: 'Failed to like article' });
    }
  });

  // 3. Categories CRUD
  app.get('/api/categories', async (_req, res) => {
    try {
      const categories = await categoriesDb.findAsync({});
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });

  app.post('/api/categories', async (req, res) => {
    try {
      const newCategory: Category = {
        ...req.body,
        id: req.body.id || `cat-${Date.now()}`,
      };
      const inserted = await categoriesDb.insertAsync(newCategory);
      res.status(201).json(inserted);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create category' });
    }
  });

  app.put('/api/categories/:id', async (req, res) => {
    try {
      const id = req.params.id;
      await categoriesDb.updateAsync({ id }, { $set: req.body });
      const updated = await categoriesDb.findOneAsync({ id });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update category' });
    }
  });

  app.delete('/api/categories/:id', async (req, res) => {
    try {
      const id = req.params.id;
      await categoriesDb.removeAsync({ id }, {});
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete category' });
    }
  });

  // 4. Ads CRUD & Tracking
  app.get('/api/ads', async (req, res) => {
    try {
      const { position, activeOnly } = req.query;
      const query: any = {};
      if (position) query.position = position;
      if (activeOnly === 'true') query.isActive = true;

      const ads = await adsDb.findAsync(query);
      res.json(ads);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch ads' });
    }
  });

  app.post('/api/ads', async (req, res) => {
    try {
      const newAd: Ad = {
        ...req.body,
        id: req.body.id || `ad-${Date.now()}`,
        clicks: 0,
        impressions: 0,
        createdAt: new Date().toISOString(),
      };
      const inserted = await adsDb.insertAsync(newAd);
      res.status(201).json(inserted);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create ad' });
    }
  });

  app.put('/api/ads/:id', async (req, res) => {
    try {
      const id = req.params.id;
      await adsDb.updateAsync({ id }, { $set: req.body });
      const updated = await adsDb.findOneAsync({ id });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update ad' });
    }
  });

  app.delete('/api/ads/:id', async (req, res) => {
    try {
      const id = req.params.id;
      await adsDb.removeAsync({ id }, {});
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete ad' });
    }
  });

  app.post('/api/ads/:id/click', async (req, res) => {
    try {
      const id = req.params.id;
      await adsDb.updateAsync({ id }, { $inc: { clicks: 1 } });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to record click' });
    }
  });

  // 5. Comments CRUD
  app.get('/api/comments', async (req, res) => {
    try {
      const { articleId, status } = req.query;
      const query: any = {};
      if (articleId) query.articleId = articleId;
      if (status) query.status = status;

      const comments = await commentsDb.findAsync(query);
      comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch comments' });
    }
  });

  app.post('/api/comments', async (req, res) => {
    try {
      const newComment: Comment = {
        ...req.body,
        id: `com-${Date.now()}`,
        status: 'approved', // Auto approve for instant interaction
        createdAt: new Date().toISOString(),
      };
      const inserted = await commentsDb.insertAsync(newComment);
      res.status(201).json(inserted);
    } catch (error) {
      res.status(500).json({ error: 'Failed to add comment' });
    }
  });

  app.put('/api/comments/:id', async (req, res) => {
    try {
      const id = req.params.id;
      await commentsDb.updateAsync({ id }, { $set: req.body });
      const updated = await commentsDb.findOneAsync({ id });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update comment' });
    }
  });

  app.delete('/api/comments/:id', async (req, res) => {
    try {
      const id = req.params.id;
      await commentsDb.removeAsync({ id }, {});
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete comment' });
    }
  });

  // 6. Users & Auth
  app.get('/api/users', async (_req, res) => {
    try {
      const users = await usersDb.findAsync({});
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { usernameOrEmail, role } = req.body;
      const user = await usersDb.findOneAsync({
        $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      });

      if (user) {
        return res.json({ success: true, user });
      }

      // Quick fallback demo user creation if logging in as requested role
      const demoUser: User = {
        id: `user-${Date.now()}`,
        username: usernameOrEmail || 'user',
        name: usernameOrEmail === 'admin' ? 'سردبیر اصلی' : usernameOrEmail === 'author' ? 'نویسنده تحریریه' : 'کاربر مهمان',
        email: `${usernameOrEmail}@khabar.ir`,
        role: role || (usernameOrEmail.includes('admin') ? 'admin' : usernameOrEmail.includes('author') ? 'author' : 'user'),
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        createdAt: new Date().toISOString(),
      };
      const inserted = await usersDb.insertAsync(demoUser);
      res.json({ success: true, user: inserted });
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // 7. AI Assistant Endpoint for Authoring (supporting OpenRouter & Gemini AI)
  app.post('/api/ai/generate', async (req, res) => {
    try {
      const { prompt, action, apiKey: customKey, model: requestedModel } = req.body;
      const openRouterKey = customKey || process.env.OPENROUTER_API_KEY;
      const geminiKey = process.env.GEMINI_API_KEY;

      let systemPrompt = 'تو یک دستیار حرفه‌ای تحریریه روزنامه و خبرنگاری فارسی هستی.';
      if (action === 'title') {
        systemPrompt += ' ۳ عنوان جذاب، کوتاه، تیتر یک و حرفه‌ای خبر بر اساس موضوع داده شده پیشنهاد بده. عناوین را شماره‌گذاری کن.';
      } else if (action === 'summary') {
        systemPrompt += ' یک چکیده و خلاصه روانی و جذاب ۲ تا ۳ خطی از متن خبر بنویس.';
      } else if (action === 'tags') {
        systemPrompt += ' ۵ الی ۸ برچسب و هشتگ کلیدی فارسی کوتاه به صورت جدا شده با کاما (یا با #) پیشنهاد بده.';
      } else if (action === 'full_article') {
        systemPrompt += ' تو یک خبرنگار و سردبیر ارشد خبر فارسی هستی. بر اساس موضوع یا عنوان ورودی، یک مقاله و خبر کامل زنده، حرفه‌ای و استاندارد خبری بنویس.\nپاسخ خود را حتماً و فقط در قالب فرمت JSON معتبر بدون هیچ متن یا توضیحات اضافه ارسال کن:\n{\n  "title": "عنوان کامل و جذاب خبر",\n  "excerpt": "خلاصه خبر در ۲ تا ۳ جمله",\n  "content": "<p>متن کامل خبر با پاراگراف‌بندی، لید خبری و زیرتیترهای <h2>...</p>",\n  "tags": ["برچسب۱", "برچسب۲", "برچسب۳", "برچسب۴"]\n}';
      }

      // Try OpenRouter if key is available
      if (openRouterKey) {
        try {
          const modelToUse = requestedModel || 'google/gemini-2.0-flash-001';
          const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${openRouterKey}`,
              'HTTP-Referer': 'https://khabar-portal.ir',
              'X-Title': 'Persian News Portal',
            },
            body: JSON.stringify({
              model: modelToUse,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt },
              ],
              temperature: 0.7,
            }),
          });

          if (openRouterRes.ok) {
            const data = await openRouterRes.json();
            const aiText = data?.choices?.[0]?.message?.content;
            if (aiText) {
              return res.json({ text: aiText });
            }
          } else {
            console.warn('OpenRouter response error:', await openRouterRes.text());
          }
        } catch (orErr) {
          console.error('OpenRouter call failed:', orErr);
        }
      }

      // Try Gemini API if key is available
      if (geminiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey: geminiKey });
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `${systemPrompt}\n\nموضوع یا متن:\n${prompt}`,
          });
          if (response.text) {
            return res.json({ text: response.text });
          }
        } catch (gErr) {
          console.error('Gemini API call failed:', gErr);
        }
      }

      // Smart Persian Fallback Generator (works without any external API key)
      const cleanPrompt = prompt.replace(/<[^>]*>?/gm, '').trim();
      const firstLine = cleanPrompt.split('\n')[0] || cleanPrompt;

      if (action === 'title') {
        const generatedText = `۱. ${firstLine.slice(0, 60)}...؛ ابعاد جدید و بررسی آخرین تحولات\n۲. دستاوردهای جدید در حوزه ${firstLine.slice(0, 40)}\n۳. نگاهی به جزئیات خبر: ${firstLine.slice(0, 50)}`;
        return res.json({ text: generatedText });
      } else if (action === 'summary') {
        const summaryText = cleanPrompt.length > 120
          ? `${cleanPrompt.slice(0, 180)}... و بررسی رویدادهای مرتبط با این موضوع در خبرنامه اختصاصی.`
          : `خلاصه اختصاصی تحریریه: ${cleanPrompt}`;
        return res.json({ text: summaryText });
      } else if (action === 'tags') {
        const words = cleanPrompt.split(/\s+/).filter((w: string) => w.length > 3);
        const uniqueWords = Array.from(new Set(words)).slice(0, 6);
        const tagsText = uniqueWords.length > 0
          ? uniqueWords.map((w: string) => `#${w.replace(/[^\u0600-\u06FF]/g, '')}`).filter((t: string) => t.length > 2).join(' ، ')
          : '#خبر_فوری ، #گزارش_تحلیلی ، #اخبار_روز ، #تحریریه';
        return res.json({ text: tagsText });
      } else if (action === 'full_article') {
        const generatedArticle = {
          title: `گزارش جامع: ${firstLine}`,
          excerpt: `بررسی آخرین تحولات و جزئیات خبری مرتبط با ${firstLine} همراه با واکنش‌های مسئولان و تحلیل کارشناسان.`,
          content: `<p>به گزارش تحریریه خبری، موضوع <strong>${firstLine}</strong> طی ساعات گذشته در صدر توجهات قرار گرفته است.</p><h2>ابعاد و جزئیات رویداد</h2><p>بر اساس آخرین گزارش‌های دریافتی، کارشناسان و دست‌اندرکاران این حوزه با بررسی ابعاد گوناگون موضوع، بر اتخاذ راهکارهای سنجیده تاکید کردند.</p><h2>چشم‌انداز و پیامدها</h2><p>پیش‌بینی می‌شود طی روزهای آینده اطلاعات تکمیلی بیشتری از این رویداد منتشر شده و ابعاد جدیدی از آن تبیین گردد.</p>`,
          tags: ['خبر_مهم', 'گزارش_ویژه', 'اخبار_روز', 'تحریریه']
        };
        return res.json({ text: JSON.stringify(generatedArticle) });
      }

      res.json({ text: 'پیشنهاد تحریریه ثبت شد.' });
    } catch (error: any) {
      console.error('AI Endpoint Error:', error);
      res.status(500).json({ error: error.message || 'خطا در پردازش هوش مصنوعی' });
    }
  });

  // 8. Real-time Messenger Channel News Extractor (Telegram, Bale, WhatsApp)
  app.post('/api/messenger/fetch-channel', async (req, res) => {
    try {
      const { source, channel } = req.body;
      if (!channel || typeof channel !== 'string') {
        return res.status(400).json({ error: 'نام کانال یا آدرس وارد نشده است.' });
      }

      let cleanChannel = channel.trim();
      cleanChannel = cleanChannel
        .replace(/^(https?:\/\/)?(t\.me\/s\/|t\.me\/|ble\.ir\/s\/|ble\.ir\/|whatsapp\.com\/channel\/)?/, '')
        .replace(/^@/, '')
        .replace(/\/.*$/, '')
        .trim();

      if (!cleanChannel) {
        return res.status(400).json({ error: 'شناسه کانال نامعتبر است.' });
      }

      const posts: any[] = [];

      // Helper function to decode HTML entities
      const decodeHTMLEntities = (text: string) => {
        return text
          .replace(/&#33;/g, '!')
          .replace(/&#34;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)));
      };

      // A) Fetch real Telegram Web Preview strictly for the given channel
      if (source === 'telegram' || !source || source === 'all') {
        try {
          const telegramUrl = `https://t.me/s/${cleanChannel}`;
          const response = await fetch(telegramUrl, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              'Accept-Language': 'fa,en-US;q=0.9,en;q=0.8',
            },
          });

          if (!response.ok) {
            return res.status(404).json({
              error: `کانال تلگرامی با آیدی @${cleanChannel} یافت نشد (کد خطا: ${response.status}). لطفاً آیدی عمومی کانال را بررسی کنید.`,
            });
          }

          const html = await response.text();

          // Extract Channel Title
          const titleMatch =
            html.match(/<div class="tgme_channel_info_header_title[^"]*">[\s\S]*?<span>([\s\S]*?)<\/span>/i) ||
            html.match(/<meta property="og:title" content="([^"]*)"/i) ||
            html.match(/<title>([\s\S]*?)<\/title>/i);
          const channelTitle = titleMatch
            ? titleMatch[1].replace(/<[^>]+>/g, '').trim()
            : `کانال تلگرام (@${cleanChannel})`;

          // Split by message blocks
          const blocks = html.split(/<div class="tgme_widget_message_wrap/i);

          for (const b of blocks.slice(1).reverse()) {
            const postMatch = b.match(/data-post="([^"]+)"/i);
            const postPath = postMatch ? postMatch[1] : '';

            // Extract Text
            const textMatch = b.match(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
            let rawText = textMatch ? textMatch[1] : '';
            let cleanText = rawText
              .replace(/<br\s*\/?>/gi, '\n')
              .replace(/<[^>]+>/g, '')
              .trim();
            cleanText = decodeHTMLEntities(cleanText);

            if (!cleanText || cleanText.length < 2) continue;

            // Extract Image URL
            let imageUrl: string | undefined = undefined;
            const bgImgMatch = b.match(/background-image:url\('([^']+)'\)/i);
            if (bgImgMatch) {
              imageUrl = bgImgMatch[1];
            } else {
              const photoMatch = b.match(/(https:\/\/(?:cdn\d*\.telesco\.pe|telegram\.org\/file\/)[^'"\s>]+)/i);
              if (photoMatch) {
                imageUrl = photoMatch[1];
              }
            }

            if (imageUrl && imageUrl.startsWith('//')) {
              imageUrl = 'https:' + imageUrl;
            }

            // Extract Date
            const timeMatch = b.match(/<time[^>]*datetime="([^"]*)"[^>]*>([^<]*)<\/time>/i);
            const dateStr = timeMatch ? timeMatch[2].trim() || 'امروز' : 'امروز';

            posts.push({
              id: postPath ? `tg-${postPath.replace('/', '-')}` : `tg-${cleanChannel}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              source: 'telegram',
              channelName: channelTitle,
              senderName: `@${cleanChannel}`,
              text: cleanText,
              imageUrl: imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80',
              date: dateStr,
              published: false,
            });
          }

          if (posts.length === 0) {
            return res.json({
              posts: [],
              message: `کانال @${cleanChannel} دریافت شد، اما هیچ پست عمومی متنی جدیدی در وب‌پیج آن پیدا نشد.`,
            });
          }

          return res.json({ posts });
        } catch (tgErr: any) {
          console.error('Telegram fetch error:', tgErr);
          return res.status(500).json({ error: `خطا در دریافت از تلگرام: ${tgErr.message}` });
        }
      }

      // B) Fetch real Bale Channel strictly
      if (source === 'bale') {
        try {
          const baleUrl = `https://ble.ir/${cleanChannel}`;
          const response = await fetch(baleUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          });

          if (!response.ok) {
            return res.status(404).json({
              error: `کانال بله با آیدی @${cleanChannel} یافت نشد. لطفاً آیدی عمومی کانال در بله را بررسی فرمایید.`,
            });
          }

          const html = await response.text();
          const ogTitle = (html.match(/<meta property="og:title" content="([^"]*)"/i) || [])[1];
          const ogDesc = (html.match(/<meta property="og:description" content="([^"]*)"/i) || [])[1];
          const ogImage = (html.match(/<meta property="og:image" content="([^"]*)"/i) || [])[1];

          if (ogDesc || ogTitle) {
            posts.push({
              id: `bale-${cleanChannel}-${Date.now()}`,
              source: 'bale',
              channelName: ogTitle || `کانال بله (@${cleanChannel})`,
              senderName: `@${cleanChannel}`,
              text: ogDesc || ogTitle || 'آخرین اطلاعیه دریافت شده از پیام‌رسان بله',
              imageUrl: ogImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80',
              date: 'امروز زنده',
              published: false,
            });
          }

          return res.json({ posts });
        } catch (baleErr: any) {
          return res.status(500).json({ error: `خطا در دریافت از بله: ${baleErr.message}` });
        }
      }

      // C) Fetch WhatsApp Channel strictly
      if (source === 'whatsapp') {
        try {
          const waUrl = channel.startsWith('http') ? channel : `https://whatsapp.com/channel/${cleanChannel}`;
          const response = await fetch(waUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          });

          if (!response.ok) {
            return res.status(404).json({
              error: `کانال واتس‌اپ یافت نشد. لطفاً لینک کامل کانال عمومی واتس‌اپ را وارد کنید.`,
            });
          }

          const html = await response.text();
          const ogTitle = (html.match(/<meta property="og:title" content="([^"]*)"/i) || [])[1];
          const ogDesc = (html.match(/<meta property="og:description" content="([^"]*)"/i) || [])[1];
          const ogImage = (html.match(/<meta property="og:image" content="([^"]*)"/i) || [])[1];

          if (ogDesc || ogTitle) {
            posts.push({
              id: `wa-${cleanChannel}-${Date.now()}`,
              source: 'whatsapp',
              channelName: ogTitle || 'کانال عمومی واتس‌اپ',
              senderName: 'WhatsApp Channel',
              text: ogDesc || ogTitle,
              imageUrl: ogImage || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
              date: 'امروز زنده',
              published: false,
            });
          }

          return res.json({ posts });
        } catch (waErr: any) {
          return res.status(500).json({ error: `خطا در دریافت از واتس‌اپ: ${waErr.message}` });
        }
      }

      res.json({ posts });
    } catch (error: any) {
      console.error('Fetch messenger error:', error);
      res.status(500).json({ error: error.message || 'خطا در دریافت اطلاعات زنده کانال' });
    }
  });

  // VITE MIDDLEWARE SETUP
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Persian News Portal server running on http://localhost:${PORT}`);
  });
}

startServer();

import React, { useState, useEffect, useTransition } from 'react';
import { SiteSettings, Article, Category, Ad, Comment, User } from './types';
import { initialSiteSettings, initialCategories, initialArticles, initialAds } from './data/initialData';
import {
  fetchSettings,
  saveSettings as apiSaveSettings,
  fetchArticles,
  fetchCategories,
  fetchAds,
  fetchComments,
  saveArticle as apiSaveArticle,
  deleteArticle as apiDeleteArticle,
  saveAd as apiSaveAd,
  deleteAd as apiDeleteAd,
} from './lib/api';

// Components
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { BreakingTicker } from './components/BreakingTicker';
import { HeroSlider } from './components/sliders/HeroSlider';
import { CarouselSlider } from './components/sliders/CarouselSlider';
import { VerticalNewsSlider } from './components/sliders/VerticalNewsSlider';
import { GridHighlightSlider } from './components/sliders/GridHighlightSlider';
import { AdSlot } from './components/ads/AdSlot';
import { ArticleCard } from './components/ArticleCard';
import { ArticleDetailModal } from './components/ArticleDetailModal';
import { AdminModal } from './components/admin/AdminModal';
import { AdminPage } from './components/admin/AdminPage';
import { AuthModal } from './components/AuthModal';
import { SearchModal } from './components/SearchModal';
import { BookmarksModal } from './components/BookmarksModal';

import { Sparkles, TrendingUp, Grid as GridIcon, List as ListIcon, Flame } from 'lucide-react';

export default function App() {
  const [, startTransition] = useTransition();

  // Core Data States
  const [settings, setSettings] = useState<SiteSettings>(initialSiteSettings);
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [ads, setAds] = useState<Ad[]>(initialAds);
  const [comments, setComments] = useState<Comment[]>([]);

  // Navigation Screen State
  const [currentScreen, setCurrentScreen] = useState<'news' | 'admin'>('news');

  // User & Preference States
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('khabar_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('khabar_dark') === 'true';
  });

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('khabar_bookmarks');
    return saved ? JSON.parse(saved) : ['art-1', 'art-3'];
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  const [showBottomStickyAd, setShowBottomStickyAd] = useState(true);

  // Modals
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'home' | 'categories' | 'bookmarks' | 'search' | 'profile'>('home');

  // Fetch initial NeDB backend data
  const loadBackendData = async () => {
    try {
      const [s, arts, cats, aBanners, coms] = await Promise.all([
        fetchSettings().catch(() => initialSiteSettings),
        fetchArticles({ allStatus: true }).catch(() => initialArticles),
        fetchCategories().catch(() => initialCategories),
        fetchAds().catch(() => initialAds),
        fetchComments().catch(() => []),
      ]);

      startTransition(() => {
        if (s) setSettings(s);
        if (arts?.length) setArticles(arts);
        if (cats?.length) setCategories(cats);
        if (aBanners) setAds(aBanners);
        if (coms) setComments(coms);
      });
    } catch (e) {
      console.error('Data loading error:', e);
    }
  };

  useEffect(() => {
    loadBackendData();
  }, []);

  // Sync Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
      document.body.classList.add('dark');
      localStorage.setItem('khabar_dark', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
      document.body.classList.remove('dark');
      localStorage.setItem('khabar_dark', 'false');
    }
  }, [darkMode]);

  // Sync Site Primary & Accent Colors across root CSS variables
  useEffect(() => {
    if (settings.primaryColor) {
      const primaryHex = settings.primaryColor.startsWith('#') ? settings.primaryColor : '#2563eb';
      document.documentElement.style.setProperty('--primary-color', primaryHex);

      const r = parseInt(primaryHex.slice(1, 3), 16) || 37;
      const g = parseInt(primaryHex.slice(3, 5), 16) || 99;
      const b = parseInt(primaryHex.slice(5, 7), 16) || 235;

      document.documentElement.style.setProperty('--primary-light', `rgba(${r}, ${g}, ${b}, 0.12)`);
      document.documentElement.style.setProperty('--primary-border', `rgba(${r}, ${g}, ${b}, 0.3)`);

      const hoverR = Math.max(0, r - 30);
      const hoverG = Math.max(0, g - 30);
      const hoverB = Math.max(0, b - 30);
      document.documentElement.style.setProperty('--primary-hover', `rgb(${hoverR}, ${hoverG}, ${hoverB})`);
    }

    if (settings.accentColor) {
      document.documentElement.style.setProperty('--accent-color', settings.accentColor);
    }
  }, [settings.primaryColor, settings.accentColor]);

  // Dynamic SEO Meta Tags & Title
  useEffect(() => {
    const metaTitle = selectedArticle?.title
      ? `${selectedArticle.title} | ${settings.siteName}`
      : settings.seo?.metaTitle || `${settings.siteName} | ${settings.siteSubtitle}`;

    document.title = metaTitle;

    const setMetaTag = (selector: string, attribute: string, attrVal: string, content: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attribute, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const desc = selectedArticle?.summary || settings.seo?.metaDescription || settings.siteSubtitle || '';
    setMetaTag('meta[name="description"]', 'name', 'description', desc);

    if (settings.seo?.keywords) {
      setMetaTag('meta[name="keywords"]', 'name', 'keywords', settings.seo.keywords);
    }

    setMetaTag('meta[property="og:title"]', 'property', 'og:title', selectedArticle?.title || settings.seo?.ogTitle || metaTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', desc);
    const ogImg = selectedArticle?.imageUrl || settings.seo?.ogImage || settings.siteLogoUrl;
    if (ogImg) {
      setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImg);
    }

    if (settings.seo?.enableStructuredData !== false) {
      let script = document.getElementById('schema-jsonld');
      if (!script) {
        script = document.createElement('script');
        script.id = 'schema-jsonld';
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': selectedArticle ? 'NewsArticle' : 'NewsMediaOrganization',
        headline: selectedArticle ? selectedArticle.title : metaTitle,
        description: desc,
        name: settings.siteName,
        url: window.location.href,
        image: ogImg,
      });
    }
  }, [settings, selectedArticle]);

  // Sync Bookmarks in localStorage
  useEffect(() => {
    localStorage.setItem('khabar_bookmarks', JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  // Sync User in localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('khabar_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('khabar_user');
    }
  }, [currentUser]);

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('khabar_user');
    setCurrentScreen('news');
  };

  // Toggle Bookmark
  const handleToggleBookmark = (e?: React.MouseEvent, article?: Article) => {
    if (e) e.stopPropagation();
    if (!article) return;

    if (bookmarkedIds.includes(article.id)) {
      setBookmarkedIds(bookmarkedIds.filter((id) => id !== article.id));
    } else {
      setBookmarkedIds([...bookmarkedIds, article.id]);
    }
  };

  // Admin Actions
  const handleSaveSettings = async (newSettings: SiteSettings) => {
    const updated = await apiSaveSettings(newSettings);
    setSettings(updated);
  };

  const handleSaveArticle = async (article: Partial<Article>) => {
    await apiSaveArticle(article);
    await loadBackendData();
  };

  const handleDeleteArticle = async (id: string) => {
    await apiDeleteArticle(id);
    await loadBackendData();
  };

  const handleSaveAd = async (ad: Partial<Ad>) => {
    await apiSaveAd(ad);
    await loadBackendData();
  };

  const handleDeleteAd = async (id: string) => {
    await apiDeleteAd(id);
    await loadBackendData();
  };

  // Filtered Articles for Main Feed
  const filteredArticles = articles.filter((a) => {
    if (activeCategory !== 'all' && a.category !== activeCategory) return false;
    return a.status === 'published';
  });

  const bookmarkedArticles = articles.filter((a) => bookmarkedIds.includes(a.id));
  const popularArticles = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  const editorialPicks = articles.filter((a) => a.isEditorialPick);

  if (currentScreen === 'admin') {
    return (
      <AdminPage
        settings={settings}
        onSaveSettings={handleSaveSettings}
        articles={articles}
        categories={categories}
        ads={ads}
        comments={comments}
        currentUser={currentUser}
        onSaveArticle={handleSaveArticle}
        onDeleteArticle={handleDeleteArticle}
        onSaveAd={handleSaveAd}
        onDeleteAd={handleDeleteAd}
        onRefreshData={loadBackendData}
        onBackToNews={() => setCurrentScreen('news')}
        onLogout={handleLogout}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans selection:bg-blue-600 selection:text-white"
      style={{
        fontFamily: "'Vazirmatn', 'Vazir', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontWeight:
          settings.fontFamily === 'vazir-bold'
            ? 700
            : settings.fontFamily === 'vazir-light'
            ? 300
            : undefined,
      }}
    >
      {/* 1. Top Leaderboard Advertising Placement */}
      <AdSlot ads={ads} position="top_leaderboard" />

      {/* 2. Header */}
      <Header
        settings={settings}
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setMobileTab('home');
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdmin={() => setCurrentScreen('admin')}
        onLogout={handleLogout}
        currentUser={currentUser}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        bookmarksCount={bookmarkedIds.length}
      />

      {/* 3. Breaking Ticker (If Enabled) */}
      {settings.showBreakingTicker && (
        <BreakingTicker articles={articles} onSelectArticle={(art) => setSelectedArticle(art)} />
      )}

      {/* 4. Main Body Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Sliders Suite (Shown on 'all' category or home view) */}
        {activeCategory === 'all' && (
          <div className="space-y-8">
            {/* Slider 1: Hero Main Featured News Slider */}
            <HeroSlider articles={articles} onSelectArticle={(art) => setSelectedArticle(art)} />

            {/* Slider 2: Carousel Multi-Card Horizontal News Slider */}
            <CarouselSlider
              title="آخرین ویدیوها و گزارش‌های تصویری"
              articles={articles.slice(0, 7)}
              onSelectArticle={(art) => setSelectedArticle(art)}
            />

            {/* Slider 3: 4-Grid Mosaic Highlight Slider */}
            <GridHighlightSlider articles={articles} onSelectArticle={(art) => setSelectedArticle(art)} />
          </div>
        )}

        {/* Category Header Banner */}
        {activeCategory !== 'all' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-blue-600 block">دسته‌بندی اخبار</span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {categories.find((c) => c.slug === activeCategory)?.name || activeCategory}
              </h2>
            </div>
            <button
              onClick={() => setActiveCategory('all')}
              className="text-xs font-bold text-slate-500 hover:text-blue-600 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl"
            >
              مشاهده همه دسته‌ها
            </button>
          </div>
        )}

        {/* Main Feed Grid & Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed Column (2 Cols on lg) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-500" />
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">جدیدترین خبرهای روز</h3>
                <span className="text-xs text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold">
                  {filteredArticles.length} خبر
                </span>
              </div>

              {/* View Layout Switcher (Grid / List) */}
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setViewLayout('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewLayout === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="نمایش شبکه‌ای"
                >
                  <GridIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewLayout('list')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewLayout === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="نمایش لیستی"
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Native Feed Banner Ad Placement */}
            <AdSlot ads={ads} position="feed_grid" />

            {/* Articles List */}
            {filteredArticles.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border text-slate-400">
                هیچ خبری در این دسته‌بندی یافت نشد.
              </div>
            ) : viewLayout === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredArticles.map((art) => (
                  <ArticleCard
                    key={art.id}
                    article={art}
                    variant="grid"
                    onSelectArticle={(a) => setSelectedArticle(a)}
                    isBookmarked={bookmarkedIds.includes(art.id)}
                    onToggleBookmark={handleToggleBookmark}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredArticles.map((art) => (
                  <ArticleCard
                    key={art.id}
                    article={art}
                    variant="list"
                    onSelectArticle={(a) => setSelectedArticle(a)}
                    isBookmarked={bookmarkedIds.includes(art.id)}
                    onToggleBookmark={handleToggleBookmark}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Slider 4: Vertical News Headlines Slider */}
            <VerticalNewsSlider articles={articles} onSelectArticle={(a) => setSelectedArticle(a)} />

            {/* Sidebar Ad Placement */}
            <AdSlot ads={ads} position="sidebar" />

            {/* Editorial Picks Widget */}
            {editorialPicks.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">پیشنهاد تحریریه خبر</h4>
                </div>
                {editorialPicks.slice(0, 4).map((pick) => (
                  <ArticleCard
                    key={pick.id}
                    article={pick}
                    variant="compact"
                    onSelectArticle={(a) => setSelectedArticle(a)}
                  />
                ))}
              </div>
            )}

            {/* Popular Articles Widget */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">پربازدیدترین اخبار هفته</h4>
              </div>
              {popularArticles.map((pop, idx) => (
                <div
                  key={pop.id}
                  onClick={() => setSelectedArticle(pop)}
                  className="group cursor-pointer flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-slate-800 text-blue-600 font-black text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-blue-600 line-clamp-1">
                      {pop.title}
                    </h5>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {pop.views.toLocaleString('fa-IR')} بازدید
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* 5. Sticky Bottom Ad (If Enabled and Not Closed) */}
      {showBottomStickyAd && (
        <AdSlot ads={ads} position="bottom_sticky" onCloseSticky={() => setShowBottomStickyAd(false)} />
      )}

      {/* 6. Footer */}
      <Footer
        settings={settings}
        categories={categories}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* 7. Mobile Bottom Navigation Bar (For Smart Phones) */}
      {settings.showMobileBottomNav && (
        <MobileBottomNav
          activeTab={mobileTab}
          onChangeTab={(tab) => {
            setMobileTab(tab);
            if (tab === 'search') setIsSearchOpen(true);
            if (tab === 'bookmarks') setIsBookmarksOpen(true);
            if (tab === 'home') setActiveCategory('all');
          }}
          bookmarksCount={bookmarkedIds.length}
          currentUser={currentUser}
          onOpenAdmin={() => setCurrentScreen('admin')}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      )}

      {/* Modals & Dialogs */}
      <ArticleDetailModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onSelectRelated={(art) => setSelectedArticle(art)}
        allArticles={articles}
        ads={ads}
        currentUser={currentUser}
        isBookmarked={selectedArticle ? bookmarkedIds.includes(selectedArticle.id) : false}
        onToggleBookmark={(art) => handleToggleBookmark(undefined, art)}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        articles={articles}
        categories={categories}
        ads={ads}
        comments={comments}
        currentUser={currentUser}
        onSaveArticle={handleSaveArticle}
        onDeleteArticle={handleDeleteArticle}
        onSaveAd={handleSaveAd}
        onDeleteAd={handleDeleteAd}
        onRefreshData={loadBackendData}
        onLogout={handleLogout}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onLoginSuccess={(u) => {
          setCurrentUser(u);
          setIsAuthOpen(false);
        }}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        articles={articles}
        onSelectArticle={(art) => setSelectedArticle(art)}
      />

      <BookmarksModal
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarkedArticles={bookmarkedArticles}
        onSelectArticle={(art) => setSelectedArticle(art)}
      />
    </div>
  );
}

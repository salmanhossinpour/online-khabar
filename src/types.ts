export type Role = 'admin' | 'author' | 'user';

export interface User {
  _id?: string;
  id: string;
  username: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  createdAt: string;
}

export interface Category {
  _id?: string;
  id: string;
  name: string;
  slug: string;
  color: string;
  icon?: string;
  description?: string;
}

export interface Article {
  _id?: string;
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  imageUrl: string;
  imageCaption?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  views: number;
  likes: number;
  readingTime: number; // in minutes
  isBreaking: boolean; // خبر فوری
  isFeatured: boolean; // ویژه (hero slider)
  isPinned: boolean; // سنجاق شده
  isEditorialPick: boolean; // پیشنهاد تحریریه
  status: 'published' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Ad {
  _id?: string;
  id: string;
  title: string;
  position: 'top_leaderboard' | 'sidebar' | 'in_article' | 'feed_grid' | 'bottom_sticky';
  imageUrl: string;
  targetUrl: string;
  htmlCode?: string;
  isActive: boolean;
  clicks: number;
  impressions: number;
  createdAt: string;
}

export interface Comment {
  _id?: string;
  id: string;
  articleId: string;
  articleTitle: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  content: string;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
}

export type HeaderStyle = 'minimal' | 'magazine' | 'newspaper' | 'compact';
export type FooterStyle = 'multicolumn' | 'minimal' | 'magazine';
export type FontFamily = 'vazir' | 'vazir-bold' | 'vazir-light' | 'shabnam' | 'iransans' | 'system';
export type CornerRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

export interface SeoSettings {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterHandle?: string;
  robotsTxt?: string;
  enableSitemap?: boolean;
  enableStructuredData?: boolean;
  googleSearchConsoleVerification?: string;
  indexingStatus?: 'indexed' | 'pending' | 'needs_fix';
}

export interface SiteSettings {
  _id?: string;
  siteName: string;
  siteSubtitle: string;
  siteLogoUrl: string;
  logoType: 'text' | 'image' | 'both';
  faviconUrl: string;
  primaryColor: string; // e.g. #2563eb or #dc2626
  secondaryColor: string;
  fontFamily: FontFamily;
  headerStyle: HeaderStyle;
  footerStyle: FooterStyle;
  cornerRadius: CornerRadius;
  showWeatherAndDate: boolean;
  showBreakingTicker: boolean;
  showMobileBottomNav: boolean;
  activeThemePreset: 'modern' | 'newspaper' | 'tech' | 'breaking' | 'lifestyle';
  footerText: string;
  copyrightText: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  contactPageUrl?: string;
  socialLinks: {
    telegram?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    bale?: string;
    whatsapp?: string;
    rss?: string;
  };
  seo?: SeoSettings;
}

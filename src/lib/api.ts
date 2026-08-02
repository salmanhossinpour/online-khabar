import { Article, Category, Ad, SiteSettings, User, Comment } from '../types';

const API_BASE = '/api';

export async function fetchSettings(): Promise<SiteSettings> {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Failed to load site settings');
  return res.json();
}

export async function saveSettings(settings: SiteSettings): Promise<SiteSettings> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error('Failed to save settings');
  return res.json();
}

export async function fetchArticles(params?: {
  category?: string;
  search?: string;
  tag?: string;
  isBreaking?: boolean;
  isFeatured?: boolean;
  isPinned?: boolean;
  isEditorialPick?: boolean;
  allStatus?: boolean;
  limit?: number;
}): Promise<Article[]> {
  const query = new URLSearchParams();
  if (params?.category) query.append('category', params.category);
  if (params?.search) query.append('search', params.search);
  if (params?.tag) query.append('tag', params.tag);
  if (params?.isBreaking) query.append('isBreaking', 'true');
  if (params?.isFeatured) query.append('isFeatured', 'true');
  if (params?.isPinned) query.append('isPinned', 'true');
  if (params?.isEditorialPick) query.append('isEditorialPick', 'true');
  if (params?.allStatus) query.append('allStatus', 'true');
  if (params?.limit) query.append('limit', params.limit.toString());

  const res = await fetch(`${API_BASE}/articles?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch articles');
  return res.json();
}

export async function fetchArticleById(id: string): Promise<Article> {
  const res = await fetch(`${API_BASE}/articles/${id}`);
  if (!res.ok) throw new Error('Article not found');
  return res.json();
}

export async function saveArticle(article: Partial<Article>): Promise<Article> {
  const isEdit = !!article.id;
  const url = isEdit ? `${API_BASE}/articles/${article.id}` : `${API_BASE}/articles`;
  const method = isEdit ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(article),
  });
  if (!res.ok) throw new Error('Failed to save article');
  return res.json();
}

export async function deleteArticle(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/articles/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function recordArticleView(id: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/articles/${id}/view`, { method: 'POST' });
  } catch (e) {
    // ignore
  }
}

export async function likeArticle(id: string): Promise<number> {
  const res = await fetch(`${API_BASE}/articles/${id}/like`, { method: 'POST' });
  const data = await res.json();
  return data.likes || 0;
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function saveCategory(category: Partial<Category>): Promise<Category> {
  const isEdit = !!category.id;
  const url = isEdit ? `${API_BASE}/categories/${category.id}` : `${API_BASE}/categories`;
  const method = isEdit ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(category),
  });
  if (!res.ok) throw new Error('Failed to save category');
  return res.json();
}

export async function deleteCategory(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/categories/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function fetchAds(params?: { position?: string; activeOnly?: boolean }): Promise<Ad[]> {
  const query = new URLSearchParams();
  if (params?.position) query.append('position', params.position);
  if (params?.activeOnly) query.append('activeOnly', 'true');

  const res = await fetch(`${API_BASE}/ads?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch ads');
  return res.json();
}

export async function saveAd(ad: Partial<Ad>): Promise<Ad> {
  const isEdit = !!ad.id;
  const url = isEdit ? `${API_BASE}/ads/${ad.id}` : `${API_BASE}/ads`;
  const method = isEdit ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ad),
  });
  if (!res.ok) throw new Error('Failed to save ad');
  return res.json();
}

export async function deleteAd(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/ads/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function recordAdClick(id: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/ads/${id}/click`, { method: 'POST' });
  } catch (e) {
    // ignore
  }
}

export async function fetchComments(params?: { articleId?: string; status?: string }): Promise<Comment[]> {
  const query = new URLSearchParams();
  if (params?.articleId) query.append('articleId', params.articleId);
  if (params?.status) query.append('status', params.status);

  const res = await fetch(`${API_BASE}/comments?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch comments');
  return res.json();
}

export async function addComment(comment: {
  articleId: string;
  articleTitle: string;
  userName: string;
  userEmail: string;
  content: string;
  userAvatar?: string;
}): Promise<Comment> {
  const res = await fetch(`${API_BASE}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(comment),
  });
  if (!res.ok) throw new Error('Failed to post comment');
  return res.json();
}

export async function updateComment(id: string, updates: Partial<Comment>): Promise<Comment> {
  const res = await fetch(`${API_BASE}/comments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update comment');
  return res.json();
}

export async function deleteComment(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/comments/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function loginUser(usernameOrEmail: string, role?: string): Promise<{ success: boolean; user: User }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernameOrEmail, role }),
  });
  if (!res.ok) throw new Error('Login request failed');
  return res.json();
}

export async function fetchMessengerChannel(source: string, channel: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/messenger/fetch-channel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source, channel }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'خطا در دریافت اطلاعات زنده کانال');
  return data.posts || [];
}

export async function generateAIAssistant(
  prompt: string,
  action: 'title' | 'summary' | 'tags' | 'full_article',
  openRouterKey?: string,
  model?: string
): Promise<string> {
  const res = await fetch(`${API_BASE}/ai/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, action, apiKey: openRouterKey, model }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'AI generation failed');
  return data.text;
}

import { create } from 'zustand';
import api from '@/lib/api/axios';
import { API_ROUTES } from '@/constants/api';

export interface Article {
  _id: string;
  id?: string;
  titleFr?: string;
  titleEn?: string;
  titleAr?: string;
  contentFr?: string;
  contentEn?: string;
  contentAr?: string;
  category?: string;
  readTimeMin?: number;
  imageUrl?: string;
  videoUrl?: string;
  isNew?: boolean;
  published?: boolean;
  isPremium?: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface ArticleStore {
  articles: Article[];
  isLoading: boolean;
  page: number;
  lastPage: number;
  total: number;
  category: string;
  published: string;
  search: string;

  setPage: (page: number) => void;
  setCategory: (cat: string) => void;
  setPublished: (pub: string) => void;
  setSearch: (search: string) => void;
  fetchArticles: (page?: number) => Promise<void>;
  createArticle: (article: Partial<Article>) => Promise<Article>;
  updateArticle: (id: string, article: Partial<Article>) => Promise<Article>;
  togglePublish: (id: string) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
}

export const useArticleStore = create<ArticleStore>((set, get) => ({
  articles: [],
  isLoading: false,
  page: 1,
  lastPage: 1,
  total: 0,
  category: 'Tous',
  published: 'all',
  search: '',

  setPage: (page) => {
    set({ page });
    get().fetchArticles(page);
  },

  setCategory: (category) => {
    set({ category, page: 1 });
    get().fetchArticles(1);
  },

  setPublished: (published) => {
    set({ published, page: 1 });
    get().fetchArticles(1);
  },

  setSearch: (search) => {
    set({ search, page: 1 });
    get().fetchArticles(1);
  },

  fetchArticles: async (page = 1) => {
    set({ isLoading: true });
    try {
      const { category, published, search } = get();
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', '10');
      if (category && category !== 'Tous') params.append('category', category);
      if (published) params.append('published', published);
      if (search && search.trim()) params.append('search', search.trim());

      const res = await api.get(`${API_ROUTES.ARTICLES}?${params.toString()}`);
      const data = res.data;
      if (data && Array.isArray(data.data)) {
        set({
          articles: data.data,
          total: data.total || 0,
          page: data.page || page,
          lastPage: data.lastPage || 1,
          isLoading: false,
        });
      } else if (Array.isArray(data)) {
        set({
          articles: data,
          total: data.length,
          page: 1,
          lastPage: 1,
          isLoading: false,
        });
      } else {
        set({ articles: [], total: 0, isLoading: false });
      }
    } catch (err) {
      console.error('Failed to fetch articles:', err);
      set({ articles: [], isLoading: false });
    }
  },

  createArticle: async (article) => {
    const res = await api.post(API_ROUTES.ARTICLES, article);
    await get().fetchArticles(get().page);
    return res.data;
  },

  updateArticle: async (id, article) => {
    const res = await api.patch(API_ROUTES.articleById(id), article);
    await get().fetchArticles(get().page);
    return res.data;
  },

  togglePublish: async (id) => {
    await api.patch(API_ROUTES.togglePublishArticle(id));
    await get().fetchArticles(get().page);
  },

  deleteArticle: async (id) => {
    await api.delete(API_ROUTES.articleById(id));
    await get().fetchArticles(get().page);
  },
}));

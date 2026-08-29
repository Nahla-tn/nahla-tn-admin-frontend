'use client';

import React, { useEffect, useState } from 'react';
import { Article, useArticleStore } from '@/lib/store/articleStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ArticleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleToEdit?: Article | null;
}

const CATEGORIES = ['Saisonnier', 'Hygiène', 'Maladies', 'Débutant'];

export function ArticleFormModal({ isOpen, onClose, articleToEdit }: ArticleFormModalProps) {
  const { createArticle, updateArticle } = useArticleStore();
  const [activeTab, setActiveTab] = useState<'fr' | 'ar' | 'en' | 'settings'>('fr');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    titleFr: '',
    titleEn: '',
    titleAr: '',
    contentFr: '',
    contentEn: '',
    contentAr: '',
    category: 'Saisonnier',
    readTimeMin: 3,
    imageUrl: '',
    videoUrl: '',
    tags: '',
    published: true,
    isPremium: false,
    isNew: true,
  });

  useEffect(() => {
    if (articleToEdit) {
      setFormData({
        titleFr: articleToEdit.titleFr || '',
        titleEn: articleToEdit.titleEn || '',
        titleAr: articleToEdit.titleAr || '',
        contentFr: articleToEdit.contentFr || '',
        contentEn: articleToEdit.contentEn || '',
        contentAr: articleToEdit.contentAr || '',
        category: articleToEdit.category || 'Saisonnier',
        readTimeMin: articleToEdit.readTimeMin || 3,
        imageUrl: articleToEdit.imageUrl || '',
        videoUrl: articleToEdit.videoUrl || '',
        tags: Array.isArray(articleToEdit.tags) ? articleToEdit.tags.join(', ') : '',
        published: articleToEdit.published ?? true,
        isPremium: articleToEdit.isPremium ?? false,
        isNew: articleToEdit.isNew ?? true,
      });
    } else {
      setFormData({
        titleFr: '',
        titleEn: '',
        titleAr: '',
        contentFr: '',
        contentEn: '',
        contentAr: '',
        category: 'Saisonnier',
        readTimeMin: 3,
        imageUrl: '',
        videoUrl: '',
        tags: '',
        published: true,
        isPremium: false,
        isNew: true,
      });
    }
    setActiveTab('fr');
  }, [articleToEdit, isOpen]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: Partial<Article> = {
        titleFr: formData.titleFr.trim() || undefined,
        titleEn: formData.titleEn.trim() || undefined,
        titleAr: formData.titleAr.trim() || undefined,
        contentFr: formData.contentFr.trim() || undefined,
        contentEn: formData.contentEn.trim() || undefined,
        contentAr: formData.contentAr.trim() || undefined,
        category: formData.category,
        readTimeMin: Number(formData.readTimeMin) || 1,
        imageUrl: formData.imageUrl.trim() || undefined,
        videoUrl: formData.videoUrl.trim() || undefined,
        published: Boolean(formData.published),
        isPremium: Boolean(formData.isPremium),
        isNew: Boolean(formData.isNew),
        tags: formData.tags
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
      };

      if (articleToEdit?._id) {
        await updateArticle(articleToEdit._id, payload);
      } else {
        await createArticle(payload);
      }
      onClose();
    } catch (err) {
      console.error('Error saving article:', err);
      alert('Erreur lors de l\'enregistrement de l\'article.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {articleToEdit ? 'Modifier l\'Article' : 'Créer un Nouvel Article'}
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-2 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('fr')}
            className={`pb-2 px-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'fr'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            🇫🇷 Français
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ar')}
            className={`pb-2 px-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'ar'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            🇹🇳 العربية
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('en')}
            className={`pb-2 px-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'en'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            🇬🇧 English
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`pb-2 px-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            ⚙️ Paramètres & Média
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* FR Tab */}
          {activeTab === 'fr' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Titre (Français) *
                </label>
                <Input
                  required
                  placeholder="Ex: Réussir sa transhumance : Les 4 règles d'or"
                  value={formData.titleFr}
                  onChange={(e) => handleChange('titleFr', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Contenu détaillé (Français) *
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="Rédigez le texte complet de l'article ici..."
                  className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-zinc-100"
                  value={formData.contentFr}
                  onChange={(e) => handleChange('contentFr', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* AR Tab */}
          {activeTab === 'ar' && (
            <div className="space-y-4" dir="rtl">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 text-right">
                  العنوان (بالعربية)
                </label>
                <Input
                  placeholder="مثال: نجاح الترحال: 4 قواعد ذهبية"
                  className="text-right"
                  value={formData.titleAr}
                  onChange={(e) => handleChange('titleAr', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 text-right">
                  المحتوى الكامل (بالعربية)
                </label>
                <textarea
                  rows={8}
                  placeholder="اكتب المحتوى الكامل للمقال هنا..."
                  className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-zinc-100 text-right"
                  value={formData.contentAr}
                  onChange={(e) => handleChange('contentAr', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* EN Tab */}
          {activeTab === 'en' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Title (English)
                </label>
                <Input
                  placeholder="Ex: Mastering Transhumance: The 4 Golden Rules"
                  value={formData.titleEn}
                  onChange={(e) => handleChange('titleEn', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Full Content (English)
                </label>
                <textarea
                  rows={8}
                  placeholder="Write the full content of the article here..."
                  className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-zinc-100"
                  value={formData.contentEn}
                  onChange={(e) => handleChange('contentEn', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Catégorie
                  </label>
                  <select
                    className="w-full h-10 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-sm text-zinc-900 dark:text-zinc-100"
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Temps de lecture (minutes)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={60}
                    value={formData.readTimeMin}
                    onChange={(e) => handleChange('readTimeMin', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  URL de l'image de couverture
                </label>
                <Input
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={(e) => handleChange('imageUrl', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  URL de la vidéo (optionnelle)
                </label>
                <Input
                  placeholder="https://youtube.com/watch?v=..."
                  value={formData.videoUrl}
                  onChange={(e) => handleChange('videoUrl', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Tags (séparés par des virgules)
                </label>
                <Input
                  placeholder="transhumance, romarin, printemps, ruches"
                  value={formData.tags}
                  onChange={(e) => handleChange('tags', e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-6 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    className="rounded border-zinc-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                    checked={formData.published}
                    onChange={(e) => handleChange('published', e.target.checked)}
                  />
                  <span>Publier immédiatement (visible sur mobile)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    className="rounded border-zinc-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                    checked={formData.isPremium}
                    onChange={(e) => handleChange('isPremium', e.target.checked)}
                  />
                  <span>Contenu Premium 👑</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    className="rounded border-zinc-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                    checked={formData.isNew}
                    onChange={(e) => handleChange('isNew', e.target.checked)}
                  />
                  <span>Badge &quot;Nouveau&quot; ⚡</span>
                </label>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-amber-600 hover:bg-amber-700 text-white">
              {isSubmitting ? 'Enregistrement...' : articleToEdit ? 'Mettre à jour' : 'Créer l\'article'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

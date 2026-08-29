'use client';

import React, { useEffect, useState } from 'react';
import { useArticleStore, Article } from '@/lib/store/articleStore';
import { ArticleFormModal } from '@/components/features/ArticleFormModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  BookOpen,
  Plus,
  Search,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Clock,
  Sparkles,
  Crown,
} from 'lucide-react';

const CATEGORIES = ['Tous', 'Saisonnier', 'Hygiène', 'Maladies', 'Débutant'];
const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'true', label: 'Publiés uniquement' },
  { value: 'false', label: 'Brouillons uniquement' },
];

export default function ArticlesPage() {
  const {
    articles,
    isLoading,
    page,
    lastPage,
    total,
    category,
    published,
    search,
    setPage,
    setCategory,
    setPublished,
    setSearch,
    fetchArticles,
    togglePublish,
    deleteArticle,
  } = useArticleStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [articleToEdit, setArticleToEdit] = useState<Article | null>(null);
  const [searchInput, setSearchInput] = useState(search);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);

  useEffect(() => {
    fetchArticles(1);
  }, [fetchArticles]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleOpenCreate = () => {
    setArticleToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (article: Article) => {
    setArticleToEdit(article);
    setIsModalOpen(true);
  };

  const handleTogglePublish = async (article: Article) => {
    const action = article.published ? 'dépublier' : 'publier';
    if (confirm(`Voulez-vous vraiment ${action} cet article ?`)) {
      await togglePublish(article._id);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!articleToDelete) return;
    await deleteArticle(articleToDelete._id);
    setArticleToDelete(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-amber-500" />
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Conseils & Base de Connaissances
            </h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Gérez les articles techniques, guides de transhumance et recommandations apicoles affichés sur l'application mobile.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvel Article</span>
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
              <Input
                placeholder="Rechercher par titre ou mot-clé..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 bg-zinc-50 dark:bg-zinc-950"
              />
            </div>
            <Button type="submit" variant="secondary" className="px-4">
              Rechercher
            </Button>
          </form>

          <div className="flex flex-wrap gap-2 items-center">
            {/* Category Filter */}
            <select
              className="h-10 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 text-sm text-zinc-900 dark:text-zinc-100"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  Catégorie : {cat}
                </option>
              ))}
            </select>

            {/* Published Filter */}
            <select
              className="h-10 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 text-sm text-zinc-900 dark:text-zinc-100"
              value={published}
              onChange={(e) => setPublished(e.target.value)}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50 dark:bg-zinc-950">
            <TableRow>
              <TableHead className="font-semibold">Article / Titre</TableHead>
              <TableHead className="font-semibold">Catégorie</TableHead>
              <TableHead className="font-semibold">Statut</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Temps de lecture</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-zinc-500">
                  Chargement des articles...
                </TableCell>
              </TableRow>
            ) : articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-zinc-500">
                  Aucun article trouvé pour les critères sélectionnés.
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article) => (
                <TableRow key={article._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                  <TableCell className="max-w-xs">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                      {article.titleFr || article.titleAr || article.titleEn || 'Sans titre'}
                    </div>
                    {article.titleAr && (
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 text-right mt-0.5" dir="rtl">
                        {article.titleAr}
                      </div>
                    )}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {article.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-block text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="font-medium">
                      {article.category || 'Général'}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {article.published ? (
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                        ● Publié
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        ○ Brouillon
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {article.isPremium ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                          <Crown className="w-3.5 h-3.5" /> Premium
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-500">Gratuit</span>
                      )}
                      {article.isNew && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] bg-sky-500/15 text-sky-700 dark:text-sky-400 px-1.5 py-0.5 rounded font-medium">
                          <Sparkles className="w-2.5 h-2.5" /> Nouveau
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{article.readTimeMin || 3} min</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-xs text-zinc-500">
                    {article.createdAt ? new Date(article.createdAt).toLocaleDateString() : '-'}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Publish / Unpublish Toggle */}
                      <Button
                        size="sm"
                        variant="ghost"
                        title={article.published ? 'Dépublier (masquer de mobile)' : 'Publier (rendre visible)'}
                        onClick={() => handleTogglePublish(article)}
                        className={article.published ? 'text-emerald-600 hover:text-emerald-700' : 'text-zinc-400 hover:text-zinc-600'}
                      >
                        {article.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>

                      {/* Edit */}
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Modifier l'article"
                        onClick={() => handleOpenEdit(article)}
                        className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-300"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>

                      {/* Delete */}
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Supprimer l'article"
                        onClick={() => setArticleToDelete(article)}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {total > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-zinc-200 dark:border-zinc-800 text-sm text-zinc-500">
            <div>
              Total : <span className="font-semibold text-zinc-900 dark:text-zinc-100">{total}</span> articles
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Précédent
              </Button>
              <span className="text-xs">
                Page {page} sur {lastPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= lastPage}
                onClick={() => setPage(page + 1)}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <ArticleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        articleToEdit={articleToEdit}
      />

      {/* Delete Confirmation Modal */}
      {articleToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 max-w-md w-full border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Confirmer la suppression
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Êtes-vous sûr de vouloir supprimer définitivement l'article :
              <br />
              <strong className="text-zinc-900 dark:text-zinc-200">
                "{articleToDelete.titleFr || articleToDelete.titleAr || articleToDelete.titleEn}"
              </strong> ?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setArticleToDelete(null)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

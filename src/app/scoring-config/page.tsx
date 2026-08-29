'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { API_ROUTES } from '@/constants/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sliders,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Info,
  Calendar,
} from 'lucide-react';

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export default function ScoringConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [recalcResult, setRecalcResult] = useState<any | null>(null);

  const [wNdvi, setWNdvi] = useState(0.40);
  const [wRainfall, setWRainfall] = useState(0.30);
  const [wNectar, setWNectar] = useState(0.30);
  const [dormancyMonths, setDormancyMonths] = useState<number[]>([11, 12, 1, 2]);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_ROUTES.SCORING_CONFIG);
      if (res.data) {
        setWNdvi(res.data.w_ndvi ?? 0.40);
        setWRainfall(res.data.w_rainfall ?? 0.30);
        setWNectar(res.data.w_nectar ?? 0.30);
        if (Array.isArray(res.data.dormancyMonths)) {
          setDormancyMonths(res.data.dormancyMonths);
        }
      }
    } catch (err) {
      console.error('Failed to fetch scoring config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const totalWeight = Math.round((wNdvi + wRainfall + wNectar) * 100) / 100;
  const isWeightBalanced = Math.abs(totalWeight - 1.0) < 0.001;

  const handleMonthToggle = (monthIndex: number) => {
    const monthNum = monthIndex + 1;
    if (dormancyMonths.includes(monthNum)) {
      setDormancyMonths(dormancyMonths.filter((m) => m !== monthNum));
    } else {
      setDormancyMonths([...dormancyMonths, monthNum].sort((a, b) => a - b));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    try {
      await api.patch(API_ROUTES.SCORING_CONFIG, {
        w_ndvi: Number(wNdvi),
        w_rainfall: Number(wRainfall),
        w_nectar: Number(wNectar),
        dormancyMonths,
      });
      setSuccessMessage('Configuration des coefficients enregistrée avec succès.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Failed to update scoring config:', err);
      alert('Erreur lors de l\'enregistrement des coefficients.');
    } finally {
      setSaving(false);
    }
  };

  const handleRecalculate = async () => {
    if (!confirm('Voulez-vous lancer le recalcul agronomique en temps réel de toutes les zones de Tunisie ? Cette opération réévalue les indices satellitaires et météorologiques.')) {
      return;
    }
    setRecalculating(true);
    setRecalcResult(null);
    try {
      const res = await api.post(API_ROUTES.RECALCULATE_ZONES);
      setRecalcResult(res.data);
    } catch (err) {
      console.error('Failed to recalculate scores:', err);
      alert('Erreur lors du recalcul des zones.');
    } finally {
      setRecalculating(false);
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-7 h-7 text-amber-500" />
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Moteur de Scoring Territorial
            </h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Pondération des algorithmes agro-météorologiques et satellites calculant le score d'opportunité des zones de transhumance.
          </p>
        </div>

        <Button
          onClick={handleRecalculate}
          disabled={recalculating}
          className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
          <span>{recalculating ? 'Recalcul en cours...' : 'Recalculer les zones'}</span>
        </Button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {recalcResult && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-800 dark:text-blue-300 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>{recalcResult.message} ({recalcResult.count} zones traitées)</span>
          </div>
          {recalcResult.zones && recalcResult.zones.length > 0 && (
            <div className="text-xs text-blue-700 dark:text-blue-400">
              Échantillon de scores calculés :{' '}
              {recalcResult.zones.slice(0, 3).map((z: any) => `${z.name} (${Math.round(z.finalScore)} pts)`).join(', ')}...
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-zinc-500">Chargement de la configuration...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Weights Configuration Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Coefficients des Facteurs Territoriaux
                </h2>
                <p className="text-xs text-zinc-500">
                  Pondérations relatives appliquées à la formule agronomique du score global.
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">
                  Somme totale
                </span>
                <span
                  className={`text-xl font-extrabold ${
                    isWeightBalanced ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {Math.round(totalWeight * 100)}%
                </span>
              </div>
            </div>

            {/* Validation Warning Alert */}
            {!isWeightBalanced && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 flex items-start gap-2 text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Avertissement :</strong> La somme des coefficients est de{' '}
                  <strong>{totalWeight}</strong> au lieu de <strong>1.00 (100%)</strong>. Le moteur normalisera automatiquement le diviseur par la somme réelle ({totalWeight}), mais il est recommandé d'équilibrer les 3 coefficients à 1.0 pour une transparence optimale.
                </span>
              </div>
            )}

            <div className="space-y-6">
              {/* NDVI Weight */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>Indice Végétal Sentinel-2 (NDVI)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.05"
                      min="0"
                      max="1"
                      value={wNdvi}
                      onChange={(e) => setWNdvi(parseFloat(e.target.value) || 0)}
                      className="w-20 h-8 text-right font-mono"
                    />
                    <span className="text-xs text-zinc-500 w-10">({Math.round(wNdvi * 100)}%)</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={wNdvi}
                  onChange={(e) => setWNdvi(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <p className="text-xs text-zinc-500">
                  Mesure la vigueur chlorophyllienne et la biomasse active via les bandes spectrales proches infrarouges de Sentinel-2.
                </p>
              </div>

              {/* Rainfall Weight */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-sky-500" />
                    <span>Précipitations & Hygrométrie (14 jours)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.05"
                      min="0"
                      max="1"
                      value={wRainfall}
                      onChange={(e) => setWRainfall(parseFloat(e.target.value) || 0)}
                      className="w-20 h-8 text-right font-mono"
                    />
                    <span className="text-xs text-zinc-500 w-10">({Math.round(wRainfall * 100)}%)</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={wRainfall}
                  onChange={(e) => setWRainfall(parseFloat(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
                <p className="text-xs text-zinc-500">
                  Évalue les précipitations cumulées et l'humidité racinaire indispensable à la production de nectar des plantes mellifères.
                </p>
              </div>

              {/* Nectar Weight */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span>Potentiel Botanique & Phénologie Nectarifère</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.05"
                      min="0"
                      max="1"
                      value={wNectar}
                      onChange={(e) => setWNectar(parseFloat(e.target.value) || 0)}
                      className="w-20 h-8 text-right font-mono"
                    />
                    <span className="text-xs text-zinc-500 w-10">({Math.round(wNectar * 100)}%)</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={wNectar}
                  onChange={(e) => setWNectar(parseFloat(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <p className="text-xs text-zinc-500">
                  Croise les espèces mellifères recensées (romarin, thym, eucalyptus, agrumes) avec leur stade de floraison calendaire.
                </p>
              </div>
            </div>
          </div>

          {/* Dormancy Months Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <Calendar className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Mois de Dormance Apicole (Tunisie)
              </h2>
            </div>
            <p className="text-xs text-zinc-500">
              Périodes d'hivernage où le calcul du score tient compte du repos végétatif et applique des seuils d'alerte adaptés.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-2">
              {MONTH_NAMES.map((name, idx) => {
                const monthNum = idx + 1;
                const isSelected = dormancyMonths.includes(monthNum);
                return (
                  <button
                    key={monthNum}
                    type="button"
                    onClick={() => handleMonthToggle(idx)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-center ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300'
                        : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={fetchConfig}
              disabled={saving}
            >
              Réinitialiser
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-amber-600 hover:bg-amber-700 text-white min-w-[140px]"
            >
              {saving ? 'Enregistrement...' : 'Sauvegarder'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

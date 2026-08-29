'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Radio, Send, CheckCircle2, AlertCircle, Users, Bell } from 'lucide-react';
import api from '@/lib/api/axios';
import { API_ROUTES } from '@/constants/api';

const TUNISIAN_REGIONS = [
  'ALL',
  'Ariana',
  'Béja',
  'Ben Arous',
  'Bizerte',
  'Gabès',
  'Gafsa',
  'Jendouba',
  'Kairouan',
  'Kasserine',
  'Kébili',
  'Le Kef',
  'Mahdia',
  'La Manouba',
  'Médenine',
  'Monastir',
  'Nabeul',
  'Sfax',
  'Sidi Bouzid',
  'Siliana',
  'Sousse',
  'Tataouine',
  'Tozeur',
  'Tunis',
  'Zaghouan',
];

export default function BroadcastPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRegion, setTargetRegion] = useState('ALL');
  const [targetRole, setTargetRole] = useState('ALL');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    title?: string;
    targetUsersCount?: number;
    tokensCount?: number;
    error?: string;
  } | null>(null);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    try {
      setSending(true);
      setResult(null);

      const payload = {
        title: title.trim(),
        message: message.trim(),
        targetRegion: targetRegion !== 'ALL' ? targetRegion : undefined,
        targetRole: targetRole !== 'ALL' ? targetRole : undefined,
      };

      const res = await api.post(API_ROUTES.BROADCAST, payload);
      setResult({
        success: true,
        title: res.data.title,
        targetUsersCount: res.data.targetUsersCount,
        tokensCount: res.data.tokensCount,
      });

      // Clear form on success
      setTitle('');
      setMessage('');
    } catch (err: any) {
      console.error('Broadcast failed:', err);
      setResult({
        success: false,
        error: err.response?.data?.message || 'Échec de l\'envoi de la diffusion.',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Radio className="h-6 w-6 text-orange-500" />
            Diffusion d'Annonces Push
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Envoyer des alertes et notifications instantanées sur les téléphones des apiculteurs et agriculteurs via Expo Push.
          </p>
        </div>
      </div>

      {result && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 ${
            result.success
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {result.success ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="text-sm space-y-1">
            <div className="font-semibold">
              {result.success
                ? 'Diffusion transmise avec succès !'
                : 'Erreur lors de la diffusion'}
            </div>
            {result.success ? (
              <p>
                La notification <strong>"{result.title}"</strong> a ciblé{' '}
                <strong>{result.targetUsersCount}</strong> utilisateur(s) éligible(s) et a été expédiée à{' '}
                <strong>{result.tokensCount}</strong> terminal(aux) actif(s).
              </p>
            ) : (
              <p>{result.error}</p>
            )}
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-500" />
            Composer le Message de Diffusion
          </CardTitle>
          <CardDescription>
            Tous les utilisateurs connectés ayant autorisé les notifications recevront cette alerte en temps réel.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSendBroadcast} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Rôle Cible
                </label>
                <Select value={targetRole} onValueChange={setTargetRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tous les utilisateurs (Apiculteurs + Agriculteurs)</SelectItem>
                    <SelectItem value="APICULTEUR">Apiculteurs uniquement</SelectItem>
                    <SelectItem value="AGRICULTEUR">Agriculteurs uniquement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Région Géographique Cible
                </label>
                <Select value={targetRegion} onValueChange={setTargetRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la région" />
                  </SelectTrigger>
                  <SelectContent>
                    {TUNISIAN_REGIONS.map((reg) => (
                      <SelectItem key={reg} value={reg}>
                        {reg === 'ALL' ? 'Toutes les régions (Nationale)' : reg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Titre de la Notification *
              </label>
              <Input
                placeholder="Ex: 🚨 Alerte Traitement Phytosanitaire Imminent à Béja"
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Corps du Message *
              </label>
              <Textarea
                placeholder="Ex: Des pulvérisations d'insecticides sont signalées dans le secteur Oued Zarga. Veillez à fermer les entrées de vos ruches ce soir."
                value={message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                disabled={sending || !title.trim() || !message.trim()}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {sending ? 'Expédition en cours...' : 'Envoyer la Diffusion'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

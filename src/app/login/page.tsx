'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { loginUser } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  MapPinned,
  Users,
  Layers,
  FileCheck2,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useI18n } from '@/lib/hooks/useI18n';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';

function FeatureItem({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="group flex items-start gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-3.5 backdrop-blur-md transition-all duration-200 hover:border-amber-400/20 hover:bg-white/[0.06]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/10 text-amber-400 ring-1 ring-amber-400/30 transition-transform duration-200 group-hover:scale-105">
        <Icon className="h-5 w-5" strokeWidth={1.9} />
      </div>
      <div>
        <p className="text-sm font-bold text-white tracking-tight">{title}</p>
        <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function HoneycombBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
      <svg className="absolute h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="hex-pattern"
            width="56"
            height="96"
            patternUnits="userSpaceOnUse"
            patternTransform="scale(1)"
          >
            <path
              d="M28 0L56 16v32L28 64 0 48V16zM28 48l28 16v32L28 112 0 96V64z"
              fill="none"
              stroke="rgba(245, 158, 11, 0.12)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex-pattern)" />
      </svg>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await loginUser(email, password);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('auth-state-change'));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentification échouée');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-[#070b14]">
      {/* Top right language switcher */}
      <div className="absolute right-6 top-6 z-50">
        <LanguageSwitcher />
      </div>

      {/* LEFT — Brand Showcase Hero Panel */}
      <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:justify-between p-12 xl:p-16 border-r border-white/10">
        {/* Background glow effects */}
        <div className="absolute -left-32 -top-32 h-[34rem] w-[34rem] rounded-full bg-gradient-to-br from-amber-500/25 via-orange-600/15 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[30rem] w-[30rem] rounded-full bg-gradient-to-tl from-emerald-500/15 via-amber-500/10 to-transparent blur-3xl" />
        <HoneycombBackground />

        {/* Top Header Identity */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 shadow-lg shadow-amber-500/30 ring-4 ring-amber-500/15">
            <Image
              src="/logo-nahla.png"
              alt="Nahla"
              width={26}
              height={26}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white">
                Nahla
              </span>
              <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-amber-300 ring-1 ring-amber-400/30">
                Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-400">Plateforme Apicole Intelligente</p>
          </div>
        </div>

        {/* Hero Pitch */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-bold text-amber-300 shadow-sm backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>{t('login.badge')}</span>
          </div>

          <h1 className="text-3xl font-black leading-tight text-white xl:text-4xl">
            {t('login.heroTitle')}
          </h1>

          <p className="text-sm leading-relaxed text-slate-300 xl:text-base">
            {t('login.heroSubtitle')}
          </p>

          <div className="grid gap-3 pt-2">
            <FeatureItem
              icon={MapPinned}
              title={t('login.featureSpatialTitle')}
              description={t('login.featureSpatialDesc')}
            />
            <FeatureItem
              icon={Users}
              title={t('login.featureUsersTitle')}
              description={t('login.featureUsersDesc')}
            />
            <FeatureItem
              icon={Layers}
              title={t('login.featureHeatmapTitle')}
              description={t('login.featureHeatmapDesc')}
            />
            <FeatureItem
              icon={FileCheck2}
              title={t('login.featureReportsTitle')}
              description={t('login.featureReportsDesc')}
            />
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 pt-6 border-t border-white/5">
          <span>© {new Date().getFullYear()} Nahla Technology.</span>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 size={13} />
            <span>Système opérationnel</span>
          </div>
        </div>
      </div>

      {/* RIGHT — Interactive Login Card Panel */}
      <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-[#070b14] p-6 sm:p-12 lg:w-1/2">
        {/* Subtle decorative glow */}
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-orange-600/15 blur-3xl" />

        <div className="relative z-10 w-full max-w-md animate-fade-in-up">
          {/* Mobile branding header */}
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-amber-500/30">
              <Image
                src="/logo-nahla.png"
                alt="Nahla"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <h1 className="text-2xl font-black text-white">Nahla</h1>
            <p className="text-xs text-slate-400 mt-1">
              {t('login.portalSubtitle')}
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10">
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-400" />
                <h2 className="text-xl font-bold tracking-tight text-white">
                  {t('login.welcome')}
                </h2>
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                {t('login.subtitle')}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Email ou Téléphone
                </Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="58053209 ou rajeh@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 rounded-xl border-white/10 bg-white/[0.06] text-white placeholder:text-slate-500 focus-visible:border-amber-400 focus-visible:ring-amber-400/20"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    {t('login.password')}
                  </Label>
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 rounded-xl border-white/10 bg-white/[0.06] pr-11 text-white placeholder:text-slate-500 focus-visible:border-amber-400 focus-visible:ring-amber-400/20"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword
                        ? t('login.hidePassword')
                        : t('login.showPassword')
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition-colors hover:text-amber-400 focus-visible:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-semibold text-rose-300"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 font-bold text-white shadow-lg shadow-amber-500/25 transition-all duration-200 hover:from-amber-600 hover:to-orange-700 hover:shadow-amber-500/40 active:scale-[0.99] disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('login.submitting')}
                  </span>
                ) : (
                  t('login.submit')
                )}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            {t('login.rightsReserved')} • Nahla Platform
          </p>
        </div>
      </div>
    </div>
  );
}
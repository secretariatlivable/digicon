import { useEffect, useState } from 'react';
import {
  Award,
  Leaf,
  TreePine,
  Factory,
  Sparkles,
  Users,
  Network,
  RefreshCw,
  Star,
} from 'lucide-react';
import { useAuth, useLanguage } from '@/lib/auth';
import { translate, type TranslationKey } from '@/lib/i18n';
import { supabase, type EcoStats, type Badge } from '@/lib/supabase';
import { GlassCard, Spinner } from '@/components/ui/GlassCard';
import { AppLayout } from '@/components/layout/AppLayout';

const badgeIcons: Record<string, typeof Award> = {
  Award,
  Leaf,
  TreePine,
  Factory,
  Users,
  Network,
  RefreshCw,
  Star,
  Sparkles,
};

export function EcoPage() {
  const { session } = useAuth();
  const [lang] = useLanguage();
  const [loading, setLoading] = useState(true);
  const [ecoStats, setEcoStats] = useState<EcoStats | null>(null);
  const [badges, setBadges] = useState<(Badge & { earned: boolean })[]>([]);

  const t = (k: TranslationKey) => translate(k, lang);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      if (!session?.user?.id) {
        if (!cancelled) setLoading(false);
        return;
      }

      const [ecoRes, badgesRes, userBadgesRes] = await Promise.all([
        supabase.from('eco_stats').select('*').eq('user_id', session.user.id).maybeSingle(),
        supabase.from('badges').select('*'),
        supabase.from('user_badges').select('badge_id').eq('user_id', session.user.id),
      ]);

      if (cancelled) return;

      setEcoStats(ecoRes.data as EcoStats | null);
      const earnedIds = new Set(
        (userBadgesRes.data || []).map((ub: { badge_id: string }) => ub.badge_id),
      );
      setBadges(
        ((badgesRes.data as Badge[]) || []).map((badge) => ({
          ...badge,
          earned: earnedIds.has(badge.id),
        })),
      );
      setLoading(false);
    };

    void loadData();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const earnedCount = badges.filter((badge) => badge.earned).length;
  const level =
    earnedCount >= 6 ? 'Advanced' : earnedCount >= 3 ? 'Intermediate' : 'Beginner';
  const nextLevel =
    level === 'Beginner'
      ? 'Intermediate'
      : level === 'Intermediate'
        ? 'Advanced'
        : 'Master';
  const progressToNext =
    level === 'Beginner'
      ? (earnedCount / 3) * 100
      : level === 'Intermediate'
        ? (earnedCount / 6) * 100
        : 100;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-32">
          <Spinner className="h-8 w-8" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-8 animate-fade-in-up">
        <h1 className="mb-1 text-3xl font-bold text-white">{t('eco.title')}</h1>
        <p className="text-white/50">Track your environmental impact and earn badges</p>
      </div>

      <GlassCard variant="chrome" className="relative mb-8 overflow-hidden p-8 animate-fade-in-up">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-digicon-eco/15 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-digicon-primary/10 blur-[80px]" />

        <div className="relative flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-4">
            <div className="glass-chrome flex h-20 w-20 items-center justify-center rounded-glass-xl">
              <Award className="h-10 w-10 text-digicon-warning" />
            </div>
            <div>
              <p className="text-sm text-white/50">{t('eco.level')}</p>
              <h2 className="text-3xl font-bold text-white">{level}</h2>
              <p className="mt-1 text-sm text-white/50">{earnedCount} badges earned</p>
            </div>
          </div>

          <div className="w-full max-w-md flex-1">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-white/60">{t('eco.progress')}</span>
              <span className="font-medium text-digicon-eco">{nextLevel}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-digicon-eco to-digicon-accent transition-all duration-700"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-white/40">
              {level === 'Beginner' && `Earn ${3 - earnedCount} more badge(s) to reach Intermediate`}
              {level === 'Intermediate' && `Earn ${6 - earnedCount} more badge(s) to reach Advanced`}
              {level === 'Advanced' && 'Maximum level reached!'}
            </p>
          </div>
        </div>
      </GlassCard>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: Leaf, label: t('dashboard.cardsShared'), value: ecoStats?.cards_shared || 0 },
          {
            icon: TreePine,
            label: t('dashboard.paperSaved'),
            value: `${(ecoStats?.paper_saved_sqm || 0).toFixed(1)}m²`,
          },
          {
            icon: TreePine,
            label: t('dashboard.treesSaved'),
            value: (ecoStats?.trees_saved || 0).toFixed(2),
          },
          {
            icon: Factory,
            label: t('dashboard.carbonReduced'),
            value: `${(ecoStats?.carbon_reduced_kg || 0).toFixed(2)}kg`,
          },
        ].map((stat) => (
          <GlassCard
            key={stat.label}
            variant="regular"
            hover
            className="p-5 text-center animate-fade-in-up"
          >
            <div className="glass-thin mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-glass-md">
              <stat.icon className="h-6 w-6 text-digicon-eco" />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="mt-1 text-xs text-white/50">{stat.label}</p>
          </GlassCard>
        ))}
      </div>

      <h2 className="mb-4 text-xl font-semibold text-white">{t('eco.badges')}</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {badges.map((badge) => {
          const Icon = badgeIcons[badge.icon] || Award;
          return (
            <GlassCard
              key={badge.id}
              variant={badge.earned ? 'chrome' : 'thin'}
              className={`p-6 text-center transition-all duration-500 animate-fade-in-up ${
                badge.earned ? 'hover:scale-105' : 'opacity-50'
              }`}
            >
              <div
                className={`${
                  badge.earned ? 'glass-chrome' : 'glass-thin'
                } mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-glass-xl`}
              >
                <Icon
                  className={`h-8 w-8 ${
                    badge.earned ? 'text-digicon-warning' : 'text-white/30'
                  }`}
                />
              </div>
              <h3
                className={`mb-1 font-semibold ${
                  badge.earned ? 'text-white' : 'text-white/40'
                }`}
              >
                {badge.name}
              </h3>
              <p className={`text-xs ${badge.earned ? 'text-white/50' : 'text-white/30'}`}>
                {badge.description}
              </p>
              {badge.earned && (
                <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-digicon-eco/20 px-2 py-1 text-xs font-medium text-digicon-eco">
                  <Sparkles className="h-3 w-3" /> Earned
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>

      <GlassCard variant="thick" className="relative mt-8 overflow-hidden p-8 animate-fade-in-up">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-digicon-eco/10 blur-[80px]" />
        <h3 className="relative mb-4 text-xl font-semibold text-white">Did You Know?</h3>
        <div className="relative grid gap-4 md:grid-cols-3">
          {[
            { fact: '500 business cards', detail: 'are printed per person on average each year' },
            { fact: '7 million trees', detail: 'are cut annually for business cards globally' },
            { fact: '1 digital card', detail: 'can replace 500+ paper cards over its lifetime' },
          ].map((item) => (
            <div key={item.fact} className="glass-thin rounded-glass-md p-4">
              <p className="mb-1 text-2xl font-bold text-digicon-eco">{item.fact}</p>
              <p className="text-sm text-white/50">{item.detail}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </AppLayout>
  );
}

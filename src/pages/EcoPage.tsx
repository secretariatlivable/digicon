import { useCallback, useEffect, useState } from 'react';
import { Award, Leaf, TreePine, Factory, Sparkles, Users, Network, RefreshCw, Star } from 'lucide-react';
import { useAuth, useLanguage } from '@/lib/auth';
import { translate, type TranslationKey } from '@/lib/i18n';
import { supabase, type EcoStats, type Badge } from '@/lib/supabase';
import { GlassCard, Spinner } from '@/components/ui/GlassCard';

const badgeIcons: Record<string, typeof Award> = {
  Award, Leaf, TreePine, Factory, Users, Network, RefreshCw, Star, Sparkles,
};

export function EcoPage() {
  const { session } = useAuth();
  const [lang] = useLanguage();
  const [loading, setLoading] = useState(true);
  const [ecoStats, setEcoStats] = useState<EcoStats | null>(null);
  const [badges, setBadges] = useState<(Badge & { earned: boolean })[]>([]);

  const t = (k: TranslationKey) => translate(k, lang);

  const loadData = useCallback(async () => {
    if (!session?.user?.id) return;
    const [ecoRes, badgesRes, userBadgesRes] = await Promise.all([
      supabase.from('eco_stats').select('*').eq('user_id', session.user.id).maybeSingle(),
      supabase.from('badges').select('*'),
      supabase.from('user_badges').select('badge_id').eq('user_id', session.user.id),
    ]);

    setEcoStats(ecoRes.data as EcoStats | null);
    const earnedIds = new Set((userBadgesRes.data || []).map((ub: { badge_id: string }) => ub.badge_id));
    setBadges(((badgesRes.data as Badge[]) || []).map(b => ({ ...b, earned: earnedIds.has(b.id) })));
    setLoading(false);
  }, [session?.user?.id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const earnedCount = badges.filter(b => b.earned).length;
  const level = earnedCount >= 6 ? 'Advanced' : earnedCount >= 3 ? 'Intermediate' : 'Beginner';
  const nextLevel = level === 'Beginner' ? 'Intermediate' : level === 'Intermediate' ? 'Advanced' : 'Master';
  const progressToNext = level === 'Beginner' ? (earnedCount / 3) * 100 : level === 'Intermediate' ? (earnedCount / 6) * 100 : 100;

  if (loading) {
    return <div className="flex items-center justify-center py-32"><Spinner className="w-8 h-8" /></div>;
  }

  return (
    <>
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-white mb-1">{t('eco.title')}</h1>
        <p className="text-white/50">Track your environmental impact and earn badges</p>
      </div>

      {/* Level + Progress */}
      <GlassCard variant="chrome" className="p-8 mb-8 relative overflow-hidden animate-fade-in-up">
        <div className="absolute top-0 right-0 w-64 h-64 bg-digicon-eco/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-digicon-primary/10 rounded-full blur-[80px]" />

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-glass-xl glass-chrome flex items-center justify-center">
              <Award className="w-10 h-10 text-digicon-warning" />
            </div>
            <div>
              <p className="text-sm text-white/50">{t('eco.level')}</p>
              <h2 className="text-3xl font-bold text-white">{level}</h2>
              <p className="text-sm text-white/50 mt-1">{earnedCount} badges earned</p>
            </div>
          </div>

          <div className="flex-1 max-w-md w-full">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-white/60">{t('eco.progress')}</span>
              <span className="text-digicon-eco font-medium">{nextLevel}</span>
            </div>
            <div className="h-3 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-digicon-eco to-digicon-accent rounded-full transition-all duration-700"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
            <p className="text-xs text-white/40 mt-2">
              {level === 'Beginner' && `Earn ${3 - earnedCount} more badge(s) to reach Intermediate`}
              {level === 'Intermediate' && `Earn ${6 - earnedCount} more badge(s) to reach Advanced`}
              {level === 'Advanced' && 'Maximum level reached!'}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Eco stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Leaf, label: t('dashboard.cardsShared'), value: ecoStats?.cards_shared || 0, color: 'text-digicon-eco' },
          { icon: TreePine, label: t('dashboard.paperSaved'), value: `${(ecoStats?.paper_saved_sqm || 0).toFixed(1)}m²`, color: 'text-digicon-eco' },
          { icon: TreePine, label: t('dashboard.treesSaved'), value: (ecoStats?.trees_saved || 0).toFixed(2), color: 'text-digicon-eco' },
          { icon: Factory, label: t('dashboard.carbonReduced'), value: `${(ecoStats?.carbon_reduced_kg || 0).toFixed(2)}kg`, color: 'text-digicon-eco' },
        ].map((stat) => (
          <GlassCard key={stat.label} variant="regular" hover className="p-5 text-center animate-fade-in-up">
            <div className="w-12 h-12 rounded-glass-md glass-thin flex items-center justify-center mx-auto mb-3">
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-white/50 mt-1">{stat.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Badges grid */}
      <h2 className="text-xl font-semibold text-white mb-4">{t('eco.badges')}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {badges.map((badge) => {
          const Icon = badgeIcons[badge.icon] || Award;
          return (
            <GlassCard
              key={badge.id}
              variant={badge.earned ? 'chrome' : 'thin'}
              className={`p-6 text-center transition-all duration-500 animate-fade-in-up ${badge.earned ? 'hover:scale-105' : 'opacity-50'}`}
            >
              <div className={`w-16 h-16 rounded-glass-xl ${badge.earned ? 'glass-chrome' : 'glass-thin'} flex items-center justify-center mx-auto mb-4 transition-transform ${badge.earned ? 'group-hover:rotate-6' : ''}`}>
                <Icon className={`w-8 h-8 ${badge.earned ? 'text-digicon-warning' : 'text-white/30'}`} />
              </div>
              <h3 className={`font-semibold mb-1 ${badge.earned ? 'text-white' : 'text-white/40'}`}>{badge.name}</h3>
              <p className={`text-xs ${badge.earned ? 'text-white/50' : 'text-white/30'}`}>{badge.description}</p>
              {badge.earned && (
                <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-digicon-eco/20 text-digicon-eco text-xs font-medium">
                  <Sparkles className="w-3 h-3" /> Earned
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>

      {/* Eco facts */}
      <GlassCard variant="thick" className="p-8 mt-8 relative overflow-hidden animate-fade-in-up">
        <div className="absolute top-0 right-0 w-48 h-48 bg-digicon-eco/10 rounded-full blur-[80px]" />
        <h3 className="text-xl font-semibold text-white mb-4 relative">Did You Know?</h3>
        <div className="grid md:grid-cols-3 gap-4 relative">
          {[
            { fact: '500 business cards', detail: 'are printed per person on average each year' },
            { fact: '7 million trees', detail: 'are cut annually for business cards globally' },
            { fact: '1 digital card', detail: 'can replace 500+ paper cards over its lifetime' },
          ].map((item) => (
            <div key={item.fact} className="glass-thin rounded-glass-md p-4">
              <p className="text-2xl font-bold text-digicon-eco mb-1">{item.fact}</p>
              <p className="text-sm text-white/50">{item.detail}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </>
  );
}

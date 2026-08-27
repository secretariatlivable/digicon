import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CreditCard, Users, TrendingUp, Leaf, Plus, Share2, ArrowRight,
  Sparkles, Award, TreePine, Factory, BarChart3
} from 'lucide-react';
import { useAuth, useLanguage } from '@/lib/auth';
import { translate, type TranslationKey } from '@/lib/i18n';
import { supabase, type BusinessCard, type Contact, type EcoStats, type Badge } from '@/lib/supabase';
import { GlassCard, GlassButton, Spinner, EmptyState } from '@/components/ui/GlassCard';
import { AppLayout } from '@/components/layout/AppLayout';

export function DashboardPage() {
  const { session, profile } = useAuth();
  const [lang] = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [ecoStats, setEcoStats] = useState<EcoStats | null>(null);
  const [badges, setBadges] = useState<(Badge & { earned: boolean })[]>([]);

  const t = (k: TranslationKey) => translate(k, lang);

  useEffect(() => {
    if (!session?.user?.id) return;
    loadData();
  }, [session?.user?.id]);

  const loadData = async () => {
    setLoading(true);
    const [cardsRes, contactsRes, ecoRes, badgesRes, userBadgesRes] = await Promise.all([
      supabase.from('business_cards').select('*').eq('user_id', session!.user.id).order('created_at', { ascending: false }),
      supabase.from('contacts').select('*').eq('user_id', session!.user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('eco_stats').select('*').eq('user_id', session!.user.id).maybeSingle(),
      supabase.from('badges').select('*'),
      supabase.from('user_badges').select('badge_id').eq('user_id', session!.user.id),
    ]);

    setCards((cardsRes.data as BusinessCard[]) || []);
    setContacts((contactsRes.data as Contact[]) || []);
    setEcoStats(ecoRes.data as EcoStats | null);

    const earnedIds = new Set((userBadgesRes.data || []).map((ub: { badge_id: string }) => ub.badge_id));
    setBadges(((badgesRes.data as Badge[]) || []).map(b => ({ ...b, earned: earnedIds.has(b.id) })));

    setLoading(false);
  };

  const stats = [
    { icon: Share2, label: t('dashboard.cardsShared'), value: ecoStats?.cards_shared || 0, color: 'text-digicon-primary' },
    { icon: Users, label: t('dashboard.contactsCaptured'), value: ecoStats?.contacts_saved || 0, color: 'text-digicon-secondary' },
    { icon: TrendingUp, label: t('dashboard.conversionRate'), value: `${contacts.length > 0 ? Math.round((contacts.filter(c => c.status === 'converted').length / contacts.length) * 100) : 0}%`, color: 'text-digicon-eco' },
    { icon: Leaf, label: t('dashboard.ecoImpact'), value: `${(ecoStats?.paper_saved_sqm || 0).toFixed(1)}m²`, color: 'text-digicon-eco' },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-32">
          <Spinner className="w-8 h-8" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Welcome header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-white mb-1">
          {t('dashboard.welcome')}, {profile?.full_name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-white/50">Here's what's happening with your networking.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <GlassCard key={i} variant="regular" hover className="p-5 animate-fade-in-up" >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-glass-md glass-thin flex items-center justify-center">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-white/50 mt-1">{stat.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Eco impact highlight */}
      <GlassCard variant="thick" className="p-6 mb-8 relative overflow-hidden animate-fade-in-up">
        <div className="absolute top-0 right-0 w-48 h-48 bg-digicon-eco/15 rounded-full blur-[80px]" />
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-glass-lg glass-chrome flex items-center justify-center">
              <TreePine className="w-7 h-7 text-digicon-eco" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Your Eco Impact</h3>
              <div className="flex gap-4 mt-1 text-sm">
                <span className="text-white/60">{t('dashboard.paperSaved')}: <strong className="text-digicon-eco">{(ecoStats?.paper_saved_sqm || 0).toFixed(1)}m²</strong></span>
                <span className="text-white/60">{t('dashboard.treesSaved')}: <strong className="text-digicon-eco">{(ecoStats?.trees_saved || 0).toFixed(2)}</strong></span>
                <span className="text-white/60">{t('dashboard.carbonReduced')}: <strong className="text-digicon-eco">{(ecoStats?.carbon_reduced_kg || 0).toFixed(2)}kg</strong></span>
              </div>
            </div>
          </div>
          <GlassButton variant="secondary" size="sm" onClick={() => navigate('/eco')}>
            View Details
            <ArrowRight className="inline ml-2 w-4 h-4" />
          </GlassButton>
        </div>
      </GlassCard>

      {/* Quick actions */}
      <h2 className="text-lg font-semibold text-white mb-4">{t('dashboard.quickActions')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <GlassCard variant="regular" hover className="p-6 cursor-pointer animate-fade-in-up" onClick={() => navigate('/cards')}>
          <div className="w-12 h-12 rounded-glass-md glass-thin flex items-center justify-center mb-4">
            <Plus className="w-6 h-6 text-digicon-primary" />
          </div>
          <h3 className="font-semibold text-white mb-1">{t('dashboard.createCard')}</h3>
          <p className="text-sm text-white/50">Design your digital business card</p>
        </GlassCard>

        <GlassCard variant="regular" hover className="p-6 cursor-pointer animate-fade-in-up" onClick={() => navigate('/contacts')}>
          <div className="w-12 h-12 rounded-glass-md glass-thin flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-digicon-secondary" />
          </div>
          <h3 className="font-semibold text-white mb-1">{t('dashboard.viewContacts')}</h3>
          <p className="text-sm text-white/50">Manage your captured leads</p>
        </GlassCard>

        <GlassCard variant="regular" hover className="p-6 cursor-pointer animate-fade-in-up" onClick={() => navigate('/analytics')}>
          <div className="w-12 h-12 rounded-glass-md glass-thin flex items-center justify-center mb-4">
            <BarChart3 className="w-6 h-6 text-digicon-info" />
          </div>
          <h3 className="font-semibold text-white mb-1">View Analytics</h3>
          <p className="text-sm text-white/50">Track your networking ROI</p>
        </GlassCard>
      </div>

      {/* Recent contacts + Badges */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent contacts */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">{t('dashboard.recentContacts')}</h2>
            <Link to="/contacts" className="text-sm text-digicon-primary hover:underline">
              View all
            </Link>
          </div>
          {contacts.length === 0 ? (
            <GlassCard variant="regular" className="p-6">
              <EmptyState
                icon={<Users className="w-8 h-8" />}
                title={t('dashboard.noContacts')}
                description="Share your digital card to start capturing leads."
                action={<GlassButton size="sm" onClick={() => navigate('/cards')}>{t('dashboard.createCard')}</GlassButton>}
              />
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact, i) => (
                <GlassCard key={contact.id} variant="thin" className="p-4 flex items-center gap-4 animate-fade-in-up" >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-digicon-primary to-digicon-secondary flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {contact.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white truncate">{contact.full_name}</p>
                    <p className="text-sm text-white/50 truncate">{contact.company || contact.email || contact.phone}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      contact.status === 'converted' ? 'bg-digicon-eco/20 text-digicon-eco' :
                      contact.status === 'follow_up' ? 'bg-digicon-warning/20 text-digicon-warning' :
                      'bg-white/10 text-white/60'
                    }`}>
                      {contact.status}
                    </span>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>

        {/* Badges */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Badges</h2>
          <GlassCard variant="regular" className="p-5">
            {badges.filter(b => b.earned).length === 0 ? (
              <div className="text-center py-6">
                <Award className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-sm text-white/50">{t('eco.noBadges')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {badges.filter(b => b.earned).map((badge, i) => (
                  <div key={badge.id} className="text-center group">
                    <div className="w-12 h-12 rounded-glass-md glass-chrome flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <Award className="w-6 h-6 text-digicon-warning" />
                    </div>
                    <p className="text-xs text-white/70 font-medium">{badge.name}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-xs text-white/40 text-center">{t('eco.keepGoing')}</p>
            </div>
          </GlassCard>
        </div>
      </div>
    </AppLayout>
  );
}


import { useEffect, useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  TrendingUp, Users, Leaf, TreePine, Factory, Target,
  Smartphone, QrCode, Link2, MessageSquare
} from 'lucide-react';
import { useAuth, useLanguage } from '@/lib/auth';
import { translate, type TranslationKey } from '@/lib/i18n';
import { supabase, type Contact, type EcoStats } from '@/lib/supabase';
import { GlassCard, Spinner } from '@/components/ui/GlassCard';
import { AppLayout } from '@/components/layout/AppLayout';

export function AnalyticsPage() {
  const { session } = useAuth();
  const [lang] = useLanguage();
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [ecoStats, setEcoStats] = useState<EcoStats | null>(null);

  const t = (k: TranslationKey) => translate(k, lang);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const result = await loadData();
      if (!cancelled && result) {
        setContacts(result.contacts);
        setEcoStats(result.ecoStats);
        setLoading(false);
      } else if (!cancelled) {
        setLoading(false);
      }
    };
    void run();
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  const loadData = async () => {
    if (!session?.user?.id) return null;

    const [contactsRes, ecoRes] = await Promise.all([
      supabase
        .from('contacts')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true }),
      supabase
        .from('eco_stats')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle(),
    ]);

    return {
      contacts: (contactsRes.data as Contact[]) || [],
      ecoStats: (ecoRes.data as EcoStats | null) ?? null,
    };
  };

  // Leads over time (last 7 days)
  const leadsOverTime = useMemo(() => {
    const days: { date: string; leads: number; converted: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayContacts = contacts.filter(c => c.created_at.startsWith(dateStr));
      days.push({
        date: d.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }),
        leads: dayContacts.length,
        converted: dayContacts.filter(c => c.status === 'converted').length,
      });
    }
    return days;
  }, [contacts]);

  // Conversion funnel
  const funnelData = useMemo(() => [
    { name: 'Total Leads', value: contacts.length, fill: '#007AFF' },
    { name: 'Follow Up', value: contacts.filter(c => c.status === 'follow_up').length, fill: '#FF9500' },
    { name: 'Converted', value: contacts.filter(c => c.status === 'converted').length, fill: '#34C759' },
  ], [contacts]);

  // Source breakdown
  const sourceData = useMemo(() => {
    const sources = contacts.reduce((acc, c) => {
      acc[c.source] = (acc[c.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(sources).map(([name, value]) => ({ name, value }));
  }, [contacts]);

  const sourceIcons: Record<string, typeof QrCode> = {
    qr: QrCode, link: Link2, sms: MessageSquare, manual: Users,
  };

  const stats = {
    total: contacts.length,
    converted: contacts.filter(c => c.status === 'converted').length,
    pending: contacts.filter(c => c.status === 'new' || c.status === 'follow_up').length,
    rate: contacts.length > 0 ? Math.round((contacts.filter(c => c.status === 'converted').length / contacts.length) * 100) : 0,
  };

  if (loading) {
    return <AppLayout><div className="flex items-center justify-center py-32"><Spinner className="w-8 h-8" /></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-white mb-1">{t('analytics.title')}</h1>
        <p className="text-white/50">Track your networking performance and eco impact</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Users, label: t('analytics.totalLeads'), value: stats.total, color: 'text-digicon-primary' },
          { icon: Target, label: t('analytics.converted'), value: stats.converted, color: 'text-digicon-eco' },
          { icon: TrendingUp, label: t('analytics.pending'), value: stats.pending, color: 'text-digicon-warning' },
          { icon: Target, label: t('analytics.converted'), value: `${stats.rate}%`, color: 'text-digicon-secondary' },
        ].map((stat, i) => (
          <GlassCard key={i} variant="regular" hover className="p-5 animate-fade-in-up">
            <div className="w-10 h-10 rounded-glass-md glass-thin flex items-center justify-center mb-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-white/50 mt-1">{stat.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Leads over time */}
        <GlassCard variant="regular" className="p-6 animate-fade-in-up">
          <h3 className="text-lg font-semibold text-white mb-4">{t('analytics.leadsOverTime')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={leadsOverTime}>
              <defs>
                <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#007AFF" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#007AFF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="convertedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34C759" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#34C759" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: 'rgba(20,20,20,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
              />
              <Area type="monotone" dataKey="leads" stroke="#007AFF" fill="url(#leadGradient)" strokeWidth={2} />
              <Area type="monotone" dataKey="converted" stroke="#34C759" fill="url(#convertedGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Conversion funnel */}
        <GlassCard variant="regular" className="p-6 animate-fade-in-up">
          <h3 className="text-lg font-semibold text-white mb-4">{t('analytics.conversionFunnel')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={funnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} width={80} />
              <Tooltip
                contentStyle={{ background: 'rgba(20,20,20,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {funnelData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Eco impact + Sources */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Eco Impact */}
        <GlassCard variant="thick" className="p-6 relative overflow-hidden animate-fade-in-up">
          <div className="absolute top-0 right-0 w-40 h-40 bg-digicon-eco/15 rounded-full blur-[80px]" />
          <h3 className="text-lg font-semibold text-white mb-4 relative">{t('analytics.ecoImpact')}</h3>
          <div className="grid grid-cols-3 gap-4 relative">
            {[
              { icon: Leaf, label: t('analytics.paperSaved'), value: `${(ecoStats?.paper_saved_sqm || 0).toFixed(1)}m²`, color: 'text-digicon-eco' },
              { icon: TreePine, label: t('analytics.treesSaved'), value: (ecoStats?.trees_saved || 0).toFixed(2), color: 'text-digicon-eco' },
              { icon: Factory, label: t('analytics.carbonReduced'), value: `${(ecoStats?.carbon_reduced_kg || 0).toFixed(2)}kg`, color: 'text-digicon-eco' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="w-10 h-10 rounded-glass-md glass-thin flex items-center justify-center mx-auto mb-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-lg font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/50">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 relative">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-white/60">Paper saved goal (100m²)</span>
              <span className="text-digicon-eco font-medium">{Math.min(((ecoStats?.paper_saved_sqm || 0) / 100) * 100, 100).toFixed(0)}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-digicon-eco to-digicon-accent rounded-full transition-all duration-500"
                style={{ width: `${Math.min(((ecoStats?.paper_saved_sqm || 0) / 100) * 100, 100)}%` }}
              />
            </div>
          </div>
        </GlassCard>

        {/* Lead sources */}
        <GlassCard variant="regular" className="p-6 animate-fade-in-up">
          <h3 className="text-lg font-semibold text-white mb-4">{t('analytics.topSources')}</h3>
          {sourceData.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              <Smartphone className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No data yet. Share your card to start collecting leads.</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                    {sourceData.map((_, i) => (
                      <Cell key={i} fill={['#007AFF', '#5856D6', '#34C759', '#FF9500'][i % 4]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'rgba(20,20,20,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center mt-4">
                {sourceData.map((src, i) => {
                  const Icon = sourceIcons[src.name] || Users;
                  return (
                    <div key={i} className="flex items-center gap-2 text-sm text-white/60">
                      <Icon className="w-4 h-4" />
                      <span className="capitalize">{src.name}</span>
                      <span className="font-medium text-white">{src.value}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </GlassCard>
      </div>
    </AppLayout>
  );
}
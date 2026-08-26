import { useEffect, useState } from 'react';
import { User, Globe, Bell, Palette, Users, CreditCard, Check, Save, Moon, Sun, Monitor } from 'lucide-react';
import { useAuth, useLanguage } from '@/lib/auth';
import { useTheme } from '@/components/theme-provider';
import { translate, type TranslationKey, regions } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { GlassCard, GlassButton, GlassInput, GlassLabel, GlassSelect, Spinner } from '@/components/ui/Glass';
import { AppLayout } from '@/components/layout/AppLayout';

type Tab = 'profile' | 'preferences' | 'team' | 'billing';

export function SettingsPage() {
  const { session, profile, refreshProfile } = useAuth();
  const [lang, setLang] = useLanguage();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profileData, setProfileData] = useState({
    full_name: '',
    company_name: '',
    email: '',
    region: 'metro-manila',
  });
  const [prefs, setPrefs] = useState({
    language: 'en' as 'en' | 'fil',
    notifications: { email: true, push: true, sms: false },
  });

  const t = (k: TranslationKey) => translate(k, lang);

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || '',
        company_name: profile.company_name || '',
        email: profile.email || '',
        region: profile.region || 'metro-manila',
      });
      setPrefs({
        language: (profile.language as 'en' | 'fil') || 'en',
        notifications: { email: true, push: true, sms: false },
      });
      setLoading(false);
    }
  }, [profile]);

  const saveProfile = async () => {
    setSaving(true);
    await supabase.from('profiles').update({
      full_name: profileData.full_name,
      company_name: profileData.company_name,
      region: profileData.region,
    }).eq('id', session!.user.id);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const savePrefs = async () => {
    setSaving(true);
    await supabase.from('profiles').update({ language: prefs.language }).eq('id', session!.user.id);
    setLang(prefs.language);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-32">
          <Spinner className="w-8 h-8" />
        </div>
      </AppLayout>
    );
  }

  const tabs = [
    { key: 'profile' as Tab, icon: User, label: t('settings.profile') },
    { key: 'preferences' as Tab, icon: Globe, label: t('settings.preferences') },
    { key: 'team' as Tab, icon: Users, label: t('settings.team') },
    { key: 'billing' as Tab, icon: CreditCard, label: t('settings.billing') },
  ];

  return (
    <AppLayout>
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-white mb-1">{t('settings.title')}</h1>
        <p className="text-white/50">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-glass-md text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key ? 'glass-regular text-white' : 'text-white/50 hover:text-white/70'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <GlassCard variant="regular" className="p-6 max-w-2xl animate-fade-in">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-glass-lg bg-gradient-to-br from-digicon-primary to-digicon-secondary flex items-center justify-center text-white font-bold text-2xl">
              {profileData.full_name.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{profileData.full_name || 'User'}</h2>
              <p className="text-sm text-white/50">{profileData.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <GlassLabel>{t('settings.fullName')}</GlassLabel>
              <GlassInput
                value={profileData.full_name}
                onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
              />
            </div>
            <div>
              <GlassLabel>{t('settings.company')}</GlassLabel>
              <GlassInput
                value={profileData.company_name}
                onChange={(e) => setProfileData({ ...profileData, company_name: e.target.value })}
              />
            </div>
            <div>
              <GlassLabel>{t('settings.email')}</GlassLabel>
              <GlassInput value={profileData.email} disabled className="opacity-50" />
            </div>
            <div>
              <GlassLabel>{t('settings.region')}</GlassLabel>
              <GlassSelect
                value={profileData.region}
                onChange={(e) => setProfileData({ ...profileData, region: e.target.value })}
              >
                {regions.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </GlassSelect>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <GlassButton onClick={saveProfile} disabled={saving}>
              {saving ? (
                <Spinner />
              ) : saved ? (
                <>
                  <Check className="inline mr-2 w-4 h-4" /> {t('settings.saved')}
                </>
              ) : (
                <>
                  <Save className="inline mr-2 w-4 h-4" /> {t('settings.save')}
                </>
              )}
            </GlassButton>
          </div>
        </GlassCard>
      )}

      {/* Preferences tab */}
      {activeTab === 'preferences' && (
        <GlassCard variant="regular" className="p-6 max-w-2xl animate-fade-in">
          <div className="space-y-6">
            {/* Language */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-5 h-5 text-digicon-primary" />
                <h3 className="font-semibold text-white">{t('settings.language')}</h3>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setPrefs({ ...prefs, language: 'en' })}
                  className={`flex-1 p-4 rounded-glass-md border transition-all ${
                    prefs.language === 'en'
                      ? 'glass-regular border-digicon-primary/50'
                      : 'glass-thin border-white/10'
                  }`}
                >
                  <span className="text-white font-medium">English</span>
                </button>
                <button
                  onClick={() => setPrefs({ ...prefs, language: 'fil' })}
                  className={`flex-1 p-4 rounded-glass-md border transition-all ${
                    prefs.language === 'fil'
                      ? 'glass-regular border-digicon-primary/50'
                      : 'glass-thin border-white/10'
                  }`}
                >
                  <span className="text-white font-medium">Filipino</span>
                </button>
              </div>
            </div>

            {/* Region */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-5 h-5 text-digicon-secondary" />
                <h3 className="font-semibold text-white">{t('settings.region')}</h3>
              </div>
              <GlassSelect
                value={profileData.region}
                onChange={(e) => setProfileData({ ...profileData, region: e.target.value })}
              >
                {regions.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </GlassSelect>
            </div>

            {/* Theme */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-5 h-5 text-digicon-secondary" />
                <h3 className="font-semibold text-white">{t('settings.theme')}</h3>
              </div>
              <div className="flex gap-3">
                {[
                  { key: 'light' as const, label: t('settings.light'), icon: Sun },
                  { key: 'dark' as const, label: t('settings.dark'), icon: Moon },
                  { key: 'system' as const, label: 'System', icon: Monitor },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setTheme(item.key)}
                    className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-glass-md border transition-all ${
                      theme === item.key
                        ? 'glass-regular border-digicon-primary/50'
                        : 'glass-thin border-white/10'
                    }`}
                  >
                    <item.icon className="w-5 h-5 text-white/80" />
                    <span className="text-white font-medium text-sm">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-5 h-5 text-digicon-warning" />
                <h3 className="font-semibold text-white">{t('settings.notifications')}</h3>
              </div>
              <div className="space-y-2">
                {[
                  { key: 'email' as const, label: 'Email notifications' },
                  { key: 'push' as const, label: 'Push notifications' },
                  { key: 'sms' as const, label: 'SMS notifications' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center gap-3 cursor-pointer p-3 rounded-glass-sm glass-thin hover:bg-white/5 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={prefs.notifications[item.key]}
                      onChange={(e) =>
                        setPrefs({
                          ...prefs,
                          notifications: { ...prefs.notifications, [item.key]: e.target.checked },
                        })
                      }
                      className="w-5 h-5 rounded accent-digicon-primary"
                    />
                    <span className="text-sm text-white/70">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <GlassButton onClick={savePrefs} disabled={saving}>
              {saving ? (
                <Spinner />
              ) : saved ? (
                <>
                  <Check className="inline mr-2 w-4 h-4" /> {t('settings.saved')}
                </>
              ) : (
                <>
                  <Save className="inline mr-2 w-4 h-4" /> {t('settings.save')}
                </>
              )}
            </GlassButton>
          </div>
        </GlassCard>
      )}

      {/* Team tab */}
      {activeTab === 'team' && (
        <GlassCard variant="regular" className="p-6 max-w-2xl animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-digicon-primary" />
              <h3 className="font-semibold text-white">{t('settings.teamMembers')}</h3>
            </div>
            <GlassButton size="sm" variant="secondary">
              {t('settings.invite')}
            </GlassButton>
          </div>
          <div className="glass-thin rounded-glass-md p-6 text-center">
            <Users className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-sm text-white/50">{t('settings.noTeam')}</p>
            <p className="text-xs text-white/30 mt-2">
              Team features available on Growth and Enterprise plans.
            </p>
          </div>
        </GlassCard>
      )}

      {/* Billing tab */}
      {activeTab === 'billing' && (
        <GlassCard variant="regular" className="p-6 max-w-2xl animate-fade-in">
          <div className="flex items-center gap-2 mb-6">
            <CreditCard className="w-5 h-5 text-digicon-primary" />
            <h3 className="font-semibold text-white">{t('settings.plan')}</h3>
          </div>
          <div className="glass-thin rounded-glass-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-white/50">{t('settings.currentPlan')}</p>
                <p className="text-2xl font-bold text-white">Starter</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-digicon-eco/20 text-digicon-eco text-xs font-medium">
                Active
              </span>
            </div>
            <p className="text-sm text-white/50 mb-4">
              ₱199/month - 3 cards, 100 contacts, basic analytics
            </p>
            <GlassButton variant="secondary" size="sm">
              {t('settings.upgrade')}
            </GlassButton>
          </div>
        </GlassCard>
      )}
    </AppLayout>
  );
}

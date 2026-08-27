import { useEffect, useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  CreditCard, Plus, Share2, Trash2, Edit3, X, Download,
  Link2, MessageSquare, Check, Mail, Wallet, Camera, Sparkles,
  Zap, Briefcase, Minus, Palette, Type
} from 'lucide-react';
import { useAuth, useLanguage } from '@/lib/auth';
import { translate, type TranslationKey } from '@/lib/i18n';
import { supabase, type BusinessCard } from '@/lib/supabase';
import { GlassCard, GlassButton, GlassInput, GlassLabel, GlassTextarea, GlassSelect, Spinner, EmptyState, Badge } from '@/components/ui/GlassCard';
import { AppLayout } from '@/components/layout/AppLayout';

type DesignTemplate = 'futuristic' | 'professional' | 'simple' | 'custom';

const cardColors = [
  '#007AFF', '#5856D6', '#34C759', '#FF9500', '#FF3B30',
  '#5AC8FA', '#AF52DE', '#10B981', '#F59E0B', '#6366F1',
];

const fontOptions = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'SF Pro Display', label: 'SF Pro Display' },
  { value: 'Helvetica Neue', label: 'Helvetica Neue' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Verdana', label: 'Verdana' },
];

const templateMeta: Record<DesignTemplate, { icon: typeof Zap; label: string; desc: string }> = {
  futuristic: { icon: Zap, label: 'Futuristic', desc: 'Neon gradients and glow effects' },
  professional: { icon: Briefcase, label: 'Professional', desc: 'Clean, corporate, trustworthy' },
  simple: { icon: Minus, label: 'Simple', desc: 'Minimal and understated' },
  custom: { icon: Palette, label: 'Custom', desc: 'Full control over colors' },
};

type FormData = {
  full_name: string;
  job_title: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  bio: string;
  card_color: string;
  accent_color: string;
  design_template: DesignTemplate;
  font_family: string;
  photo_url: string;
};

const defaultForm: FormData = {
  full_name: '', job_title: '', company: '', phone: '', email: '',
  website: '', address: '', bio: '', card_color: '#007AFF',
  accent_color: '#5856D6', design_template: 'professional',
  font_family: 'Inter', photo_url: '',
};

export function CardsPage() {
  const { session } = useAuth();
  const [lang] = useLanguage();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<BusinessCard | null>(null);
  const [shareCard, setShareCard] = useState<BusinessCard | null>(null);
  const [copied, setCopied] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = (k: TranslationKey) => translate(k, lang);
  const [formData, setFormData] = useState<FormData>(defaultForm);

  useEffect(() => { loadCards(); }, [session?.user?.id]);

  const loadCards = async () => {
    if (!session?.user?.id) return;
    const { data } = await supabase.from('business_cards').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
    setCards((data as BusinessCard[]) || []);
    setLoading(false);
  };

  const openCreate = () => {
    setEditingCard(null);
    setFormData(defaultForm);
    setShowForm(true);
  };

  const openEdit = (card: BusinessCard) => {
    setEditingCard(card);
    setFormData({
      full_name: card.full_name, job_title: card.job_title, company: card.company,
      phone: card.phone, email: card.email, website: card.website, address: card.address,
      bio: card.bio, card_color: card.card_color, accent_color: card.accent_color || '#5856D6',
      design_template: (card.design_template as DesignTemplate) || 'professional',
      font_family: card.font_family || 'Inter', photo_url: card.photo_url || '',
    });
    setShowForm(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user?.id) return;
    setUploadingPhoto(true);
    const ext = file.name.split('.').pop();
    const path = `${session.user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('card-photos').upload(path, file, { upsert: true });
    if (!error) {
      const { data: urlData } = supabase.storage.from('card-photos').getPublicUrl(path);
      setFormData(prev => ({ ...prev, photo_url: urlData.publicUrl }));
    }
    setUploadingPhoto(false);
  };

  const saveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCard) {
      await supabase.from('business_cards').update({ ...formData, updated_at: new Date().toISOString() }).eq('id', editingCard.id);
    } else {
      await supabase.from('business_cards').insert({ ...formData, user_id: session!.user.id });
    }
    setShowForm(false);
    loadCards();
  };

  const deleteCard = async (id: string) => {
    await supabase.from('business_cards').delete().eq('id', id);
    loadCards();
  };

  const toggleActive = async (card: BusinessCard) => {
    await supabase.from('business_cards').update({ is_active: !card.is_active }).eq('id', card.id);
    loadCards();
  };

  const shareUrl = shareCard ? `${window.location.origin}/c/${shareCard.id}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      ctx!.fillStyle = '#FFFFFF';
      ctx!.fillRect(0, 0, 400, 400);
      ctx!.drawImage(img, 0, 0, 400, 400);
      const link = document.createElement('a');
      link.download = `digicon-qr-${shareCard?.full_name || 'card'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const shareSMS = () => {
    window.open(`sms:?body=Check out my digital business card: ${shareUrl}`);
  };

  const shareEmail = () => {
    const subject = `${shareCard?.full_name || 'My'} Digital Business Card`;
    const body = `Hi,\n\nHere's my digital business card: ${shareUrl}\n\nBest regards,\n${shareCard?.full_name || ''}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const downloadVCard = () => {
    if (!shareCard) return;
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${shareCard.full_name}`,
      `TITLE:${shareCard.job_title}`,
      `ORG:${shareCard.company}`,
      `TEL:${shareCard.phone}`,
      `EMAIL:${shareCard.email}`,
      `URL:${shareCard.website}`,
      `ADR:;;${shareCard.address}`,
      `NOTE:${shareCard.bio}`,
      'END:VCARD',
    ].join('\n');
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const link = document.createElement('a');
    link.download = `${shareCard.full_name.replace(/\s+/g, '_')}.vcf`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const downloadAppleWallet = () => {
    if (!shareCard) return;
    const pass = {
      formatVersion: 1,
      passType: 'generic',
      organizationName: shareCard.company || 'DigiCon',
      description: `${shareCard.full_name} - Digital Business Card`,
      serialNumber: shareCard.id,
      backgroundColor: 'rgb(0,0,0)',
      foregroundColor: 'rgb(255,255,255)',
      labelColor: 'rgb(255,255,255)',
      primaryFields: [
        { key: 'name', label: 'Name', value: shareCard.full_name },
        { key: 'title', label: 'Title', value: shareCard.job_title },
      ],
      secondaryFields: [
        { key: 'company', label: 'Company', value: shareCard.company },
        { key: 'phone', label: 'Phone', value: shareCard.phone },
        { key: 'email', label: 'Email', value: shareCard.email },
      ],
      auxiliaryFields: [
        { key: 'website', label: 'Website', value: shareCard.website },
      ],
    };
    const blob = new Blob([JSON.stringify(pass, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = `${shareCard.full_name.replace(/\s+/g, '_')}.pkpass.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const downloadGoogleWallet = () => {
    if (!shareCard) return;
    const obj = {
      id: shareCard.id,
      classId: 'digicon-card',
      title: shareCard.full_name,
      subtitle: shareCard.job_title,
      textModulesData: [
        { header: 'Company', body: shareCard.company },
        { header: 'Phone', body: shareCard.phone },
        { header: 'Email', body: shareCard.email },
        { header: 'Website', body: shareCard.website },
      ],
      linksModuleData: {
        uris: [{ uri: shareUrl, description: 'View Digital Card' }],
      },
    };
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = `${shareCard.full_name.replace(/\s+/g, '_')}.google-wallet.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const markShared = async () => {
    if (!shareCard || !session?.user?.id) return;
    await supabase.from('business_cards').update({ share_count: shareCard.share_count + 1 }).eq('id', shareCard.id);
    const { data: eco } = await supabase.from('eco_stats').select('*').eq('user_id', session.user.id).maybeSingle();
    if (eco) {
      await supabase.from('eco_stats').update({
        cards_shared: (eco.cards_shared || 0) + 1,
        paper_saved_sqm: (eco.paper_saved_sqm || 0) + 0.05,
        trees_saved: (eco.trees_saved || 0) + 0.0029,
        carbon_reduced_kg: (eco.carbon_reduced_kg || 0) + 0.02,
        updated_at: new Date().toISOString(),
      }).eq('user_id', session.user.id);
    }
    setShareCard(null);
    loadCards();
  };

  const renderCardPreview = (card: FormData | BusinessCard, large = false) => {
    const template = ('design_template' in card ? card.design_template : 'professional') as DesignTemplate;
    const font = ('font_family' in card ? card.font_family : 'Inter') || 'Inter';
    const photo = ('photo_url' in card ? card.photo_url : '') || '';
    const accent = ('accent_color' in card ? card.accent_color : '') || card.card_color;
    const sizePad = large ? 'p-8' : 'p-5';
    const sizeH = large ? 'min-h-64' : 'h-40';

    if (template === 'futuristic') {
      return (
        <div
          className={`relative ${sizeH} flex flex-col justify-end ${sizePad} overflow-hidden`}
          style={{ background: `linear-gradient(135deg, ${card.card_color}, ${accent})` }}
        >
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.15) 0%, transparent 50%)' }} />
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${card.card_color}, ${accent}, ${card.card_color})` }} />
          {photo ? (
            <img src={photo} alt={card.full_name} className={`absolute top-4 right-4 ${large ? 'w-20 h-20' : 'w-12 h-12'} rounded-full object-cover ring-2 ring-white/40`} />
          ) : (
            <div className={`absolute top-4 right-4 ${large ? 'w-20 h-20' : 'w-12 h-12'} rounded-full bg-white/20 backdrop-blur flex items-center justify-center`}>
              <span className={`${large ? 'text-3xl' : 'text-xl'} font-bold text-white`}>{card.full_name.charAt(0).toUpperCase() || '?'}</span>
            </div>
          )}
          <div className="relative" style={{ fontFamily: font }}>
            <h3 className={`${large ? 'text-2xl' : 'text-lg'} font-bold text-white tracking-tight`}>{card.full_name || 'Your Name'}</h3>
            <p className={`${large ? 'text-base' : 'text-sm'} text-white/90`}>{card.job_title || 'Job Title'}</p>
            <p className={`${large ? 'text-sm' : 'text-xs'} text-white/70`}>{card.company || 'Company'}</p>
          </div>
        </div>
      );
    }

    if (template === 'simple') {
      return (
        <div className={`${sizeH} flex flex-col justify-center ${sizePad} bg-[#1C1C1E] border border-white/10`}>
          {photo ? (
            <img src={photo} alt={card.full_name} className={`${large ? 'w-20 h-20' : 'w-12 h-12'} rounded-full object-cover mb-3`} />
          ) : (
            <div className={`${large ? 'w-20 h-20' : 'w-12 h-12'} rounded-full bg-white/10 flex items-center justify-center mb-3`}>
              <span className={`${large ? 'text-3xl' : 'text-xl'} font-bold text-white/80`}>{card.full_name.charAt(0).toUpperCase() || '?'}</span>
            </div>
          )}
          <div style={{ fontFamily: font }}>
            <h3 className={`${large ? 'text-2xl' : 'text-lg'} font-semibold text-white`}>{card.full_name || 'Your Name'}</h3>
            <p className={`${large ? 'text-base' : 'text-sm'} text-white/50`}>{card.job_title || 'Job Title'}</p>
            {card.company && <p className={`${large ? 'text-sm' : 'text-xs'} text-white/40`}>{card.company}</p>}
          </div>
        </div>
      );
    }

    if (template === 'custom') {
      return (
        <div
          className={`relative ${sizeH} flex flex-col justify-end ${sizePad} overflow-hidden`}
          style={{ background: `linear-gradient(160deg, ${card.card_color}, ${accent})` }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-40" style={{ backgroundColor: accent }} />
          {photo ? (
            <img src={photo} alt={card.full_name} className={`absolute top-4 left-4 ${large ? 'w-20 h-20' : 'w-12 h-12'} rounded-full object-cover ring-2 ring-white/30`} />
          ) : (
            <div className={`absolute top-4 left-4 ${large ? 'w-20 h-20' : 'w-12 h-12'} rounded-full bg-white/20 backdrop-blur flex items-center justify-center`}>
              <span className={`${large ? 'text-3xl' : 'text-xl'} font-bold text-white`}>{card.full_name.charAt(0).toUpperCase() || '?'}</span>
            </div>
          )}
          <div className="relative text-right" style={{ fontFamily: font }}>
            <h3 className={`${large ? 'text-2xl' : 'text-lg'} font-bold text-white`}>{card.full_name || 'Your Name'}</h3>
            <p className={`${large ? 'text-base' : 'text-sm'} text-white/80`}>{card.job_title || 'Job Title'}</p>
            <p className={`${large ? 'text-sm' : 'text-xs'} text-white/60`}>{card.company || 'Company'}</p>
          </div>
        </div>
      );
    }

    // professional (default)
    return (
      <div
        className={`relative ${sizeH} flex flex-col justify-end ${sizePad}`}
        style={{ background: `linear-gradient(135deg, ${card.card_color}, ${card.card_color}dd)` }}
      >
        {photo ? (
          <img src={photo} alt={card.full_name} className={`absolute top-4 right-4 ${large ? 'w-20 h-20' : 'w-12 h-12'} rounded-full object-cover ring-2 ring-white/30`} />
        ) : (
          <div className={`absolute top-4 right-4 ${large ? 'w-20 h-20' : 'w-12 h-12'} rounded-full bg-white/20 backdrop-blur flex items-center justify-center`}>
            <span className={`${large ? 'text-3xl' : 'text-xl'} font-bold text-white`}>{card.full_name.charAt(0).toUpperCase() || '?'}</span>
          </div>
        )}
        <div style={{ fontFamily: font }}>
          <h3 className={`${large ? 'text-2xl' : 'text-lg'} font-bold text-white`}>{card.full_name || 'Your Name'}</h3>
          <p className={`${large ? 'text-base' : 'text-sm'} text-white/80`}>{card.job_title || 'Job Title'}</p>
          <p className={`${large ? 'text-sm' : 'text-xs'} text-white/60`}>{card.company || 'Company'}</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return <AppLayout><div className="flex items-center justify-center py-32"><Spinner className="w-8 h-8" /></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">{t('cards.title')}</h1>
          <p className="text-white/50">Create and share your digital business cards</p>
        </div>
        <GlassButton onClick={openCreate}>
          <Plus className="inline mr-2 w-5 h-5" />
          {t('cards.create')}
        </GlassButton>
      </div>

      {cards.length === 0 ? (
        <GlassCard variant="regular" className="p-6">
          <EmptyState
            icon={<CreditCard className="w-8 h-8" />}
            title={t('cards.noCards')}
            description="Design your first digital business card and start networking the smart way."
            action={<GlassButton onClick={openCreate}><Plus className="inline mr-2 w-5 h-5" />{t('cards.create')}</GlassButton>}
          />
        </GlassCard>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <GlassCard key={card.id} variant="regular" hover className="overflow-hidden animate-fade-in-up">
              {renderCardPreview(card)}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{card.share_count} shares</span>
                  </div>
                  <Badge color={card.is_active ? 'green' : 'gray'}>
                    {card.is_active ? t('cards.active') : t('cards.inactive')}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShareCard(card)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-glass-sm glass-thin text-white/70 hover:text-white text-sm transition-all">
                    <Share2 className="w-4 h-4" /> {t('cards.share')}
                  </button>
                  <button onClick={() => openEdit(card)} className="p-2 rounded-glass-sm glass-thin text-white/70 hover:text-white transition-all">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteCard(card.id)} className="p-2 rounded-glass-sm glass-thin text-digicon-error/70 hover:text-digicon-error transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => toggleActive(card)}
                  className="w-full mt-2 text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  {card.is_active ? 'Deactivate' : 'Activate'} card
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Create/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <GlassCard variant="chrome" className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{editingCard ? t('cards.edit') : t('cards.create')}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-glass-sm text-white/60 hover:text-white hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveCard} className="space-y-5">
              {/* Design template selection */}
              <div>
                <GlassLabel><Palette className="inline w-4 h-4 mr-1" /> Design Template</GlassLabel>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(Object.keys(templateMeta) as DesignTemplate[]).map((tpl) => {
                    const meta = templateMeta[tpl];
                    const Icon = meta.icon;
                    return (
                      <button
                        key={tpl}
                        type="button"
                        onClick={() => setFormData({ ...formData, design_template: tpl })}
                        className={`flex flex-col items-center gap-1 p-3 rounded-glass-md transition-all ${
                          formData.design_template === tpl ? 'glass-regular ring-2 ring-digicon-primary' : 'glass-thin hover:bg-white/10'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${formData.design_template === tpl ? 'text-digicon-primary' : 'text-white/60'}`} />
                        <span className="text-xs font-medium text-white/80">{meta.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-white/40 mt-2">{templateMeta[formData.design_template].desc}</p>
              </div>

              {/* Photo upload */}
              <div>
                <GlassLabel><Camera className="inline w-4 h-4 mr-1" /> Profile Photo</GlassLabel>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full glass-thin flex items-center justify-center overflow-hidden">
                    {formData.photo_url ? (
                      <img src={formData.photo_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-white/40">{formData.full_name.charAt(0).toUpperCase() || '?'}</span>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  <GlassButton type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto}>
                    {uploadingPhoto ? <Spinner className="w-4 h-4" /> : <><Camera className="w-4 h-4 mr-1" /> Upload</>}
                  </GlassButton>
                  {formData.photo_url && (
                    <button type="button" onClick={() => setFormData({ ...formData, photo_url: '' })} className="text-xs text-white/40 hover:text-white/70">
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Essential info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <GlassLabel>{t('cards.fullName')} *</GlassLabel>
                  <GlassInput value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
                </div>
                <div>
                  <GlassLabel>{t('cards.jobTitle')}</GlassLabel>
                  <GlassInput value={formData.job_title} onChange={(e) => setFormData({ ...formData, job_title: e.target.value })} />
                </div>
                <div>
                  <GlassLabel>{t('cards.company')}</GlassLabel>
                  <GlassInput value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                </div>
                <div>
                  <GlassLabel>{t('cards.phone')}</GlassLabel>
                  <GlassInput value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div>
                  <GlassLabel>{t('cards.email')}</GlassLabel>
                  <GlassInput type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div>
                  <GlassLabel>{t('cards.website')}</GlassLabel>
                  <GlassInput value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
                </div>
              </div>
              <div>
                <GlassLabel>{t('cards.address')}</GlassLabel>
                <GlassInput value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </div>
              <div>
                <GlassLabel>{t('cards.bio')}</GlassLabel>
                <GlassTextarea rows={2} value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} />
              </div>

              {/* Font selection */}
              <div>
                <GlassLabel><Type className="inline w-4 h-4 mr-1" /> Font Family</GlassLabel>
                <GlassSelect value={formData.font_family} onChange={(e) => setFormData({ ...formData, font_family: e.target.value })}>
                  {fontOptions.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </GlassSelect>
              </div>

              {/* Color selection */}
              <div>
                <GlassLabel>Primary Color</GlassLabel>
                <div className="flex flex-wrap gap-2">
                  {cardColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, card_color: color })}
                      className={`w-10 h-10 rounded-glass-md transition-all ${formData.card_color === color ? 'ring-2 ring-white scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Accent color (for custom/futuristic) */}
              {(formData.design_template === 'custom' || formData.design_template === 'futuristic') && (
                <div>
                  <GlassLabel>Accent Color</GlassLabel>
                  <div className="flex flex-wrap gap-2">
                    {cardColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, accent_color: color })}
                        className={`w-10 h-10 rounded-glass-md transition-all ${formData.accent_color === color ? 'ring-2 ring-white scale-110' : 'hover:scale-105'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Live preview */}
              <div>
                <GlassLabel>{t('cards.preview')}</GlassLabel>
                {renderCardPreview(formData, true)}
              </div>

              <div className="flex gap-3 pt-2">
                <GlassButton type="submit" className="flex-1">{t('cards.save')}</GlassButton>
                <GlassButton type="button" variant="ghost" onClick={() => setShowForm(false)}>{t('cards.cancel')}</GlassButton>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Share modal */}
      {shareCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShareCard(null)} />
          <GlassCard variant="chrome" className="relative w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{t('cards.share')}</h2>
              <button onClick={() => setShareCard(null)} className="p-2 rounded-glass-sm text-white/60 hover:text-white hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-white rounded-glass-lg mb-4">
                <QRCodeSVG id="qr-code-svg" value={shareUrl} size={180} level="H" />
              </div>
              <p className="text-sm text-white/50">{t('cards.qrCode')}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <GlassInput readOnly value={shareUrl} className="flex-1 text-sm" />
                <GlassButton variant="secondary" size="sm" onClick={copyLink}>
                  {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Link2 className="w-4 h-4" /> Copy</>}
                </GlassButton>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button onClick={downloadQR} className="flex flex-col items-center gap-2 p-3 rounded-glass-md glass-thin text-white/70 hover:text-white transition-all">
                  <Download className="w-5 h-5" />
                  <span className="text-xs">QR PNG</span>
                </button>
                <button onClick={shareSMS} className="flex flex-col items-center gap-2 p-3 rounded-glass-md glass-thin text-white/70 hover:text-white transition-all">
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-xs">SMS</span>
                </button>
                <button onClick={shareEmail} className="flex flex-col items-center gap-2 p-3 rounded-glass-md glass-thin text-white/70 hover:text-white transition-all">
                  <Mail className="w-5 h-5" />
                  <span className="text-xs">Email</span>
                </button>
              </div>

              {/* vCard download */}
              <button onClick={downloadVCard} className="w-full flex items-center justify-center gap-2 p-3 rounded-glass-md glass-thin text-white/70 hover:text-white transition-all">
                <Download className="w-4 h-4" />
                <span className="text-sm">Save Contact (vCard)</span>
              </button>

              {/* Wallet downloads */}
              <div className="grid grid-cols-2 gap-2">
                <button onClick={downloadAppleWallet} className="flex items-center justify-center gap-2 p-3 rounded-glass-md glass-thin text-white/70 hover:text-white transition-all">
                  <Wallet className="w-4 h-4" />
                  <span className="text-xs">Apple Wallet</span>
                </button>
                <button onClick={downloadGoogleWallet} className="flex items-center justify-center gap-2 p-3 rounded-glass-md glass-thin text-white/70 hover:text-white transition-all">
                  <Wallet className="w-4 h-4" />
                  <span className="text-xs">Google Wallet</span>
                </button>
              </div>
            </div>

            <button
              onClick={markShared}
              className="w-full mt-4 text-xs text-white/40 hover:text-white/60 transition-colors"
            >
              Mark as shared to update eco stats
            </button>
          </GlassCard>
        </div>
      )}
    </AppLayout>
  );
}

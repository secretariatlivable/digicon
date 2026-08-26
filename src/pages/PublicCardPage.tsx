import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Mail, Phone, Globe, MapPin, Save, Check, Download, Wallet } from 'lucide-react';
import { supabase, type BusinessCard } from '@/lib/supabase';
import { GlassCard, GlassInput, GlassLabel, GlassButton, Spinner } from '@/components/ui/Glass';

type DesignTemplate = 'futuristic' | 'professional' | 'simple' | 'custom';

export function PublicCardPage() {
  const { cardId } = useParams<{ cardId: string }>();
  const [card, setCard] = useState<BusinessCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '', company: '', job_title: '', consent: false });

  useEffect(() => {
    if (!cardId) return;
    supabase.from('business_cards').select('*').eq('id', cardId).maybeSingle().then(({ data }) => {
      setCard(data as BusinessCard | null);
      setLoading(false);
    });
  }, [cardId]);

  const saveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card || !formData.consent) return;
    await supabase.from('contacts').insert({
      user_id: card.user_id,
      card_id: card.id,
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      job_title: formData.job_title,
      consent_given: true,
      consent_date: new Date().toISOString(),
      source: 'qr',
      status: 'new',
    });
    const { data: eco } = await supabase.from('eco_stats').select('contacts_saved').eq('user_id', card.user_id).maybeSingle();
    if (eco) {
      await supabase.from('eco_stats').update({
        contacts_saved: (eco.contacts_saved || 0) + 1,
        updated_at: new Date().toISOString(),
      }).eq('user_id', card.user_id);
    }
    setSaved(true);
  };

  const downloadVCard = () => {
    if (!card) return;
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${card.full_name}`,
      `TITLE:${card.job_title}`,
      `ORG:${card.company}`,
      `TEL:${card.phone}`,
      `EMAIL:${card.email}`,
      `URL:${card.website}`,
      `ADR:;;${card.address}`,
      `NOTE:${card.bio}`,
      'END:VCARD',
    ].join('\n');
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const link = document.createElement('a');
    link.download = `${card.full_name.replace(/\s+/g, '_')}.vcf`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const downloadAppleWallet = () => {
    if (!card) return;
    const pass = {
      formatVersion: 1,
      passType: 'generic',
      organizationName: card.company || 'DigiCon',
      description: `${card.full_name} - Digital Business Card`,
      serialNumber: card.id,
      backgroundColor: 'rgb(0,0,0)',
      foregroundColor: 'rgb(255,255,255)',
      labelColor: 'rgb(255,255,255)',
      primaryFields: [
        { key: 'name', label: 'Name', value: card.full_name },
        { key: 'title', label: 'Title', value: card.job_title },
      ],
      secondaryFields: [
        { key: 'company', label: 'Company', value: card.company },
        { key: 'phone', label: 'Phone', value: card.phone },
        { key: 'email', label: 'Email', value: card.email },
      ],
      auxiliaryFields: [
        { key: 'website', label: 'Website', value: card.website },
      ],
    };
    const blob = new Blob([JSON.stringify(pass, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = `${card.full_name.replace(/\s+/g, '_')}.pkpass.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const downloadGoogleWallet = () => {
    if (!card) return;
    const obj = {
      id: card.id,
      classId: 'digicon-card',
      title: card.full_name,
      subtitle: card.job_title,
      textModulesData: [
        { header: 'Company', body: card.company },
        { header: 'Phone', body: card.phone },
        { header: 'Email', body: card.email },
        { header: 'Website', body: card.website },
      ],
      linksModuleData: {
        uris: [{ uri: window.location.href, description: 'View Digital Card' }],
      },
    };
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = `${card.full_name.replace(/\s+/g, '_')}.google-wallet.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const renderCard = () => {
    if (!card) return null;
    const template = (card.design_template as DesignTemplate) || 'professional';
    const font = card.font_family || 'Inter';
    const photo = card.photo_url || '';
    const accent = card.accent_color || card.card_color;

    const contactLinks = (
      <div className="bg-white/10 backdrop-blur p-6 space-y-3">
        {card.email && (
          <a href={`mailto:${card.email}`} className="flex items-center gap-3 text-white/90 hover:text-white transition-colors">
            <Mail className="w-4 h-4" /> <span className="text-sm">{card.email}</span>
          </a>
        )}
        {card.phone && (
          <a href={`tel:${card.phone}`} className="flex items-center gap-3 text-white/90 hover:text-white transition-colors">
            <Phone className="w-4 h-4" /> <span className="text-sm">{card.phone}</span>
          </a>
        )}
        {card.website && (
          <a href={card.website.startsWith('http') ? card.website : `https://${card.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white/90 hover:text-white transition-colors">
            <Globe className="w-4 h-4" /> <span className="text-sm">{card.website}</span>
          </a>
        )}
        {card.address && (
          <div className="flex items-center gap-3 text-white/90">
            <MapPin className="w-4 h-4" /> <span className="text-sm">{card.address}</span>
          </div>
        )}
      </div>
    );

    const photoEl = photo ? (
      <img src={photo} alt={card.full_name} className="w-16 h-16 rounded-full object-cover ring-2 ring-white/40" />
    ) : (
      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
        <span className="text-2xl font-bold text-white">{card.full_name.charAt(0).toUpperCase()}</span>
      </div>
    );

    if (template === 'futuristic') {
      return (
        <div className="rounded-glass-2xl overflow-hidden animate-scale-in" style={{ background: `linear-gradient(135deg, ${card.card_color}, ${accent})` }}>
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.15) 0%, transparent 50%)' }} />
          <div className="relative p-8">
            <div className="flex justify-end mb-4">{photoEl}</div>
            <h1 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: font }}>{card.full_name}</h1>
            <p className="text-white/90" style={{ fontFamily: font }}>{card.job_title}</p>
            {card.company && <p className="text-white/60 text-sm" style={{ fontFamily: font }}>{card.company}</p>}
          </div>
          {contactLinks}
        </div>
      );
    }

    if (template === 'simple') {
      return (
        <div className="rounded-glass-2xl overflow-hidden animate-scale-in bg-[#1C1C1E] border border-white/10">
          <div className="p-8">
            <div className="mb-4">{photoEl}</div>
            <h1 className="text-2xl font-semibold text-white" style={{ fontFamily: font }}>{card.full_name}</h1>
            <p className="text-white/50" style={{ fontFamily: font }}>{card.job_title}</p>
            {card.company && <p className="text-white/40 text-sm" style={{ fontFamily: font }}>{card.company}</p>}
          </div>
          {contactLinks}
        </div>
      );
    }

    if (template === 'custom') {
      return (
        <div className="rounded-glass-2xl overflow-hidden animate-scale-in relative" style={{ background: `linear-gradient(160deg, ${card.card_color}, ${accent})` }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-40" style={{ backgroundColor: accent }} />
          <div className="relative p-8">
            <div className="mb-4">{photoEl}</div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: font }}>{card.full_name}</h1>
            <p className="text-white/80" style={{ fontFamily: font }}>{card.job_title}</p>
            {card.company && <p className="text-white/60 text-sm" style={{ fontFamily: font }}>{card.company}</p>}
          </div>
          {contactLinks}
        </div>
      );
    }

    // professional (default)
    return (
      <div className="rounded-glass-2xl overflow-hidden animate-scale-in" style={{ background: `linear-gradient(135deg, ${card.card_color}, ${card.card_color}cc)` }}>
        <div className="p-8">
          <div className="flex justify-end mb-4">{photoEl}</div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: font }}>{card.full_name}</h1>
          <p className="text-white/80" style={{ fontFamily: font }}>{card.job_title}</p>
          {card.company && <p className="text-white/60 text-sm" style={{ fontFamily: font }}>{card.company}</p>}
        </div>
        {contactLinks}
      </div>
    );
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner className="w-8 h-8" /></div>;
  }

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <img src="/DigiCon_logo_transparent.jpg" alt="DigiCon logo - digital business card platform" className="w-12 h-12 rounded-full mx-auto mb-4 opacity-30" />
          <h1 className="text-xl font-bold text-white mb-2">Card Not Found</h1>
          <p className="text-white/50">This business card may have been deactivated.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Full-width banner */}
      <section className="relative w-full overflow-hidden">
        <img
          src="/DigiCon_Banner.png"
          alt="DigiCon banner - eco-friendly digital business cards and CRM automation platform"
          className="w-full h-auto block"
        />
      </section>

      <div className="min-h-screen flex items-center justify-center px-4 py-8 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px]" style={{ backgroundColor: card.card_color + '30' }} />
      </div>

      <div className="relative w-full max-w-md space-y-4">
        {renderCard()}

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={downloadVCard} className="flex items-center justify-center gap-2 p-3 rounded-glass-md glass-thin text-white/70 hover:text-white transition-all">
            <Download className="w-4 h-4" />
            <span className="text-sm">Save Contact</span>
          </button>
          <button onClick={() => setShowContactForm(!showContactForm)} className="flex items-center justify-center gap-2 p-3 rounded-glass-md glass-thin text-white/70 hover:text-white transition-all">
            <Save className="w-4 h-4" />
            <span className="text-sm">Share My Info</span>
          </button>
        </div>

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

        {/* Save contact form */}
        {showContactForm && !saved && (
          <GlassCard variant="chrome" className="p-6 animate-fade-in-up">
            <h2 className="text-lg font-semibold text-white mb-1">Share Your Details</h2>
            <p className="text-sm text-white/50 mb-4">Share your contact info with {card.full_name.split(' ')[0]}</p>
            <form onSubmit={saveContact} className="space-y-3">
              <div>
                <GlassLabel>Your Name *</GlassLabel>
                <GlassInput value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <GlassLabel>Email</GlassLabel>
                  <GlassInput type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div>
                  <GlassLabel>Phone</GlassLabel>
                  <GlassInput value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <GlassLabel>Company</GlassLabel>
                  <GlassInput value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                </div>
                <div>
                  <GlassLabel>Job Title</GlassLabel>
                  <GlassInput value={formData.job_title} onChange={(e) => setFormData({ ...formData, job_title: e.target.value })} />
                </div>
              </div>
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-glass-sm glass-thin">
                <input
                  type="checkbox"
                  checked={formData.consent}
                  onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                  className="w-5 h-5 rounded accent-digicon-primary mt-0.5"
                  required
                />
                <span className="text-xs text-white/60">I consent to my contact information being stored and used by {card.full_name} in accordance with the Data Privacy Act of the Philippines.</span>
              </label>
              <GlassButton type="submit" className="w-full" disabled={!formData.consent}>
                <Save className="inline mr-2 w-4 h-4" /> Share My Contact
              </GlassButton>
            </form>
          </GlassCard>
        )}

        {saved && (
          <GlassCard variant="chrome" className="p-8 text-center animate-scale-in">
            <div className="w-16 h-16 rounded-glass-xl glass-chrome flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-digicon-eco" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Contact Shared!</h2>
            <p className="text-white/50 text-sm">Your details have been sent to {card.full_name}.</p>
          </GlassCard>
        )}

        <div className="text-center">
          <span className="inline-flex items-center gap-2 text-white/30 text-xs">
            <img src="/DigiCon_logo_transparent.jpg" alt="DigiCon logo" className="w-4 h-4 rounded-full" /> Powered by DigiCon
          </span>
        </div>
      </div>
    </div>
  );
}

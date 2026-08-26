import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Mail, Phone, Globe, MapPin, Save, Check } from 'lucide-react';
import { supabase, type BusinessCard } from '@/lib/supabase';
import { GlassCard, GlassInput, GlassLabel, GlassButton, Spinner } from '@/components/ui/Glass';
import { DigiConLogo } from '@/components/brand/DigiConLogo';

export function PublicCardPage() {
  const { cardId } = useParams<{ cardId: string }>();
  const [card, setCard] = useState<BusinessCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
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
    await supabase.from('eco_stats').update({
      contacts_saved: ((await supabase.from('eco_stats').select('contacts_saved').eq('user_id', card.user_id).maybeSingle()).data?.contacts_saved || 0) + 1,
      updated_at: new Date().toISOString(),
    }).eq('user_id', card.user_id);
    setSaved(true);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner className="w-8 h-8" /></div>;
  }

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <img src="/DigiCon.png" alt="DigiCon logo" className="w-12 h-12 rounded-full mx-auto mb-4 opacity-30" />
          <h1 className="text-xl font-bold text-white mb-2">Card Not Found</h1>
          <p className="text-white/50">This business card may have been deactivated.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px]" style={{ backgroundColor: card.card_color + '30' }} />
      </div>

      <div className="relative w-full max-w-md space-y-4">
        {/* Business card */}
        <div
          className="rounded-glass-2xl overflow-hidden animate-scale-in"
          style={{ background: `linear-gradient(135deg, ${card.card_color}, ${card.card_color}cc)` }}
        >
          <div className="p-8">
            <div className="w-16 h-16 rounded-glass-lg bg-white/20 backdrop-blur flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-white">{card.full_name.charAt(0).toUpperCase()}</span>
            </div>
            <h1 className="text-2xl font-bold text-white">{card.full_name}</h1>
            <p className="text-white/80">{card.job_title}</p>
            {card.company && <p className="text-white/60 text-sm">{card.company}</p>}
          </div>
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
        </div>

        {/* Save contact form */}
        {!saved ? (
          <GlassCard variant="chrome" className="p-6 animate-fade-in-up">
            <h2 className="text-lg font-semibold text-white mb-1">Save My Contact</h2>
            <p className="text-sm text-white/50 mb-4">Share your details with {card.full_name.split(' ')[0]}</p>
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
        ) : (
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
            <img src="/DigiCon.png" alt="DigiCon logo" className="w-4 h-4 rounded-full" /> Powered by DigiCon
          </span>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { GlassCard, GlassButton, Spinner } from '@/components/ui/Glass';
import { DigiConLogo } from '@/components/brand/DigiConLogo';
import { Mail, Phone, Globe, MapPin, Download, Share2 } from 'lucide-react';

type BusinessCard = {
  id: string;
  user_id: string;
  full_name: string;
  job_title: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  bio: string;
  photo_url: string;
  theme_color: string;
  is_active: boolean;
};

export function PublicCardPage() {
  const { cardId } = useParams<{ cardId: string }>();
  const [card, setCard] = useState<BusinessCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCard = async () => {
      if (!cardId) return;
      
      const { data, error } = await supabase
        .from('business_cards')
        .select('*')
        .eq('id', cardId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        setError('Failed to load card.');
        setLoading(false);
        return;
      }

      if (!data) {
        setError('Card not found or inactive.');
        setLoading(false);
        return;
      }

      setCard(data);
      setLoading(false);

      // ATOMIC INCREMENT: Update eco_stats via RPC to prevent race conditions
      supabase.rpc('increment_eco_stats', {
        p_user_id: data.user_id,
        p_cards_shared: 1,
        p_paper_saved_sqm: 0.05, // 500cm2 = 0.05m2
        p_trees_saved: 0.002,
        p_carbon_reduced_kg: 0.02
      });
    };

    fetchCard();
  }, [cardId]);

  const downloadVCard = () => {
    if (!card) return;
    const vCard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${card.full_name}`,
      `ORG:${card.company}`,
      `TITLE:${card.job_title}`,
      `TEL;TYPE=CELL:${card.phone}`,
      `EMAIL:${card.email}`,
      `URL:${card.website}`,
      `ADR;TYPE=WORK:;;${card.address};;;;`,
      `NOTE:${card.bio}`,
      'END:VCARD'
    ].join('\n');

    const blob = new Blob([vCard], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${card.full_name.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${card?.full_name}'s Digital Card`,
          text: `Check out ${card?.full_name}'s digital business card!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled or failed', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Spinner className="w-10 h-10 text-digicon-primary" />
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
        <DigiConLogo size="md" className="mb-6" />
        <h2 className="text-2xl font-bold mb-2">Card Unavailable</h2>
        <p className="text-white/60">{error || 'This card could not be found.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-digicon-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-digicon-secondary/20 rounded-full blur-[120px]" />

      <GlassCard variant="thick" className="w-full max-w-md p-8 relative z-10 animate-fade-in-up">
        <div className="flex flex-col items-center text-center">
          {card.photo_url ? (
            <img src={card.photo_url} alt={card.full_name} className="w-24 h-24 rounded-full object-cover ring-4 ring-white/10 mb-4" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-digicon-primary/20 flex items-center justify-center mb-4">
              <span className="text-3xl font-bold text-white">{card.full_name.charAt(0)}</span>
            </div>
          )}

          <h1 className="text-2xl font-bold text-white">{card.full_name}</h1>
          <p className="text-white/60 text-sm mb-1">{card.job_title}</p>
          <p className="text-digicon-primary font-medium text-sm mb-6">{card.company}</p>

          {card.bio && <p className="text-white/50 text-sm italic mb-8 px-4">"{card.bio}"</p>}

          <div className="w-full space-y-3 mb-8">
            {card.phone && (
              <a href={`tel:${card.phone}`} className="flex items-center gap-3 p-3 rounded-glass-md glass-thin hover:bg-white/5 transition-colors">
                <Phone className="w-5 h-5 text-digicon-eco" />
                <span className="text-white text-sm">{card.phone}</span>
              </a>
            )}
            {card.email && (
              <a href={`mailto:${card.email}`} className="flex items-center gap-3 p-3 rounded-glass-md glass-thin hover:bg-white/5 transition-colors">
                <Mail className="w-5 h-5 text-digicon-primary" />
                <span className="text-white text-sm">{card.email}</span>
              </a>
            )}
            {card.website && (
              <a href={card.website.startsWith('http') ? card.website : `https://${card.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-glass-md glass-thin hover:bg-white/5 transition-colors">
                <Globe className="w-5 h-5 text-digicon-secondary" />
                <span className="text-white text-sm">{card.website}</span>
              </a>
            )}
            {card.address && (
              <div className="flex items-center gap-3 p-3 rounded-glass-md glass-thin">
                <MapPin className="w-5 h-5 text-digicon-warning" />
                <span className="text-white text-sm text-left">{card.address}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            <GlassButton variant="secondary" size="md" onClick={downloadVCard}>
              <Download className="w-4 h-4 mr-2" /> Save Contact
            </GlassButton>
            <GlassButton variant="primary" size="md" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" /> Share
            </GlassButton>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
          <p className="text-xs text-white/30">Powered by <span className="text-digicon-primary font-semibold">DigiCon</span></p>
        </div>
      </GlassCard>
    </div>
  );
}

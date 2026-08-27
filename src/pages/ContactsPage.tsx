import { useEffect, useState, useMemo } from 'react';
import {
  Users, Plus, Search, Download, RefreshCw, Trash2, Edit3, X,
  Check, Mail, Phone, Building2
} from 'lucide-react';
import { useAuth, useLanguage } from '@/lib/auth';
import { translate, type TranslationKey } from '@/lib/i18n';
import { supabase, type Contact } from '@/lib/supabase';
import { GlassCard, GlassButton, GlassInput, GlassLabel, GlassTextarea, GlassSelect, Spinner, EmptyState, Badge } from '@/components/ui/GlassCard';
import { AppLayout } from '@/components/layout/AppLayout';

const statusColors: Record<string, string> = {
  new: 'blue',
  follow_up: 'orange',
  converted: 'green',
  archived: 'gray',
};

export function ContactsPage() {
  const { session } = useAuth();
  const [lang] = useLanguage();
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncedCount, setSyncedCount] = useState(0);

  const t = (k: TranslationKey) => translate(k, lang);

  const [formData, setFormData] = useState({
    full_name: '', email: '', phone: '', company: '', job_title: '', notes: '', status: 'new', consent_given: false,
  });

  useEffect(() => {
    void loadContacts();
  }, [session?.user?.id]);

  const loadContacts = async () => {
    if (!session?.user?.id) {
      setContacts([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    setContacts((data as Contact[]) || []);
    setLoading(false);
  };

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      const normalizedSearch = search.toLowerCase();
      const matchesSearch = !search ||
        c.full_name.toLowerCase().includes(normalizedSearch) ||
        c.email.toLowerCase().includes(normalizedSearch) ||
        (c.company ?? '').toLowerCase().includes(normalizedSearch);
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [contacts, search, statusFilter]);

  const openCreate = () => {
    setEditingContact(null);
    setFormData({ full_name: '', email: '', phone: '', company: '', job_title: '', notes: '', status: 'new', consent_given: false });
    setShowForm(true);
  };

  const openEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      full_name: contact.full_name ?? '',
      email: contact.email ?? '',
      phone: contact.phone ?? '',
      company: contact.company ?? '',
      job_title: contact.job_title ?? '',
      notes: contact.notes ?? '',
      status: contact.status,
      consent_given: contact.consent_given,
    });
    setShowForm(true);
  };

  const saveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingContact) {
      await supabase.from('contacts').update({
        ...formData, consent_date: formData.consent_given && !editingContact.consent_given ? new Date().toISOString() : editingContact.consent_date,
        updated_at: new Date().toISOString(),
      }).eq('id', editingContact.id);
    } else {
      await supabase.from('contacts').insert({
        ...formData, user_id: session!.user.id, consent_date: formData.consent_given ? new Date().toISOString() : null,
      });
      await supabase.from('eco_stats').update({
        contacts_saved: (await supabase.from('eco_stats').select('contacts_saved').eq('user_id', session!.user.id).maybeSingle()).data?.contacts_saved + 1,
        updated_at: new Date().toISOString(),
      }).eq('user_id', session!.user.id);
    }
    setShowForm(false);
    loadContacts();
  };

  const deleteContact = async (id: string) => {
    await supabase.from('contacts').delete().eq('id', id);
    loadContacts();
  };

  const updateStatus = async (contact: Contact, status: string) => {
    await supabase.from('contacts').update({ status, updated_at: new Date().toISOString() }).eq('id', contact.id);
    loadContacts();
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Job Title', 'Status', 'Consent', 'Source', 'Created At'];
    const rows = filteredContacts.map(c => [
      c.full_name, c.email, c.phone, c.company, c.job_title, c.status,
      c.consent_given ? 'Yes' : 'No', c.source, new Date(c.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map(r => r.map(f => `"${f}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'digicon-contacts.csv';
    link.click();
  };

  const syncToCRM = async () => {
    setSyncing(true);
    const unsynced = contacts.filter(c => !c.synced_to_crm && c.consent_given);
    for (const contact of unsynced) {
      await supabase.from('contacts').update({ synced_to_crm: true, updated_at: new Date().toISOString() }).eq('id', contact.id);
    }
    setSyncedCount(unsynced.length);
    setSyncing(false);
    setTimeout(() => setSyncedCount(0), 3000);
    loadContacts();
  };

  if (loading) {
    return <AppLayout><div className="flex items-center justify-center py-32"><Spinner className="w-8 h-8" /></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">{t('contacts.title')}</h1>
          <p className="text-white/50">{contacts.length} total contacts</p>
        </div>
        <div className="flex gap-2">
          <GlassButton variant="secondary" size="sm" onClick={exportCSV} disabled={contacts.length === 0}>
            <Download className="inline mr-2 w-4 h-4" />
            {t('contacts.export')}
          </GlassButton>
          <GlassButton variant="secondary" size="sm" onClick={syncToCRM} disabled={syncing || contacts.length === 0}>
            <RefreshCw className={`inline mr-2 w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncedCount > 0 ? `${syncedCount} Synced!` : t('contacts.syncCRM')}
          </GlassButton>
          <GlassButton size="sm" onClick={openCreate}>
            <Plus className="inline mr-2 w-4 h-4" />
            {t('contacts.add')}
          </GlassButton>
        </div>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          <GlassInput
            placeholder={t('contacts.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 w-full"
          />
        </div>
        <GlassSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-40">
          <option value="all">{t('common.all')}</option>
          <option value="new">{t('contacts.new')}</option>
          <option value="follow_up">{t('contacts.followUp')}</option>
          <option value="converted">{t('contacts.converted')}</option>
          <option value="archived">{t('contacts.archived')}</option>
        </GlassSelect>
      </div>

      {/* Contacts table */}
      {filteredContacts.length === 0 ? (
        <GlassCard variant="regular" className="p-6">
          <EmptyState
            icon={<Users className="w-8 h-8" />}
            title={t('contacts.noContacts')}
            description="Add contacts manually or share your card to capture leads automatically."
            action={<GlassButton onClick={openCreate}><Plus className="inline mr-2 w-5 h-5" />{t('contacts.add')}</GlassButton>}
          />
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filteredContacts.map((contact) => (
            <GlassCard key={contact.id} variant="thin" className="p-4 animate-fade-in-up" >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-digicon-primary to-digicon-secondary flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {contact.full_name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-white">{contact.full_name}</h3>
                    <Badge color={statusColors[contact.status] || 'gray'}>{contact.status.replace('_', ' ')}</Badge>
                    {contact.synced_to_crm && <Badge color="purple"><Check className="w-3 h-3" /> CRM</Badge>}
                    {contact.consent_given && <Badge color="green"><Check className="w-3 h-3" /> Consent</Badge>}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-white/50">
                    {contact.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {contact.email}</span>}
                    {contact.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {contact.phone}</span>}
                    {contact.company && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {contact.company}</span>}
                  </div>
                  {contact.notes && <p className="text-sm text-white/40 mt-2 line-clamp-2">{contact.notes}</p>}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <select
                    value={contact.status}
                    onChange={(e) => updateStatus(contact, e.target.value)}
                    className="glass-input text-xs py-1.5 px-2 w-auto"
                  >
                    <option value="new">New</option>
                    <option value="follow_up">Follow Up</option>
                    <option value="converted">Converted</option>
                    <option value="archived">Archived</option>
                  </select>
                  <button onClick={() => openEdit(contact)} className="p-2 rounded-glass-sm text-white/60 hover:text-white hover:bg-white/10 transition-all">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteContact(contact.id)} className="p-2 rounded-glass-sm text-digicon-error/60 hover:text-digicon-error hover:bg-white/10 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Create/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <GlassCard variant="chrome" className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{editingContact ? t('contacts.edit') : t('contacts.add')}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-glass-sm text-white/60 hover:text-white hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveContact} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <GlassLabel>{t('contacts.name')} *</GlassLabel>
                  <GlassInput value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
                </div>
                <div>
                  <GlassLabel>{t('contacts.jobTitle')}</GlassLabel>
                  <GlassInput value={formData.job_title} onChange={(e) => setFormData({ ...formData, job_title: e.target.value })} />
                </div>
                <div>
                  <GlassLabel>{t('contacts.email')}</GlassLabel>
                  <GlassInput type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div>
                  <GlassLabel>{t('contacts.phone')}</GlassLabel>
                  <GlassInput value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div>
                  <GlassLabel>{t('contacts.company')}</GlassLabel>
                  <GlassInput value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                </div>
                <div>
                  <GlassLabel>{t('contacts.status')}</GlassLabel>
                  <GlassSelect value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    <option value="new">New</option>
                    <option value="follow_up">Follow Up</option>
                    <option value="converted">Converted</option>
                    <option value="archived">Archived</option>
                  </GlassSelect>
                </div>
              </div>
              <div>
                <GlassLabel>{t('contacts.notes')}</GlassLabel>
                <GlassTextarea rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.consent_given}
                  onChange={(e) => setFormData({ ...formData, consent_given: e.target.checked })}
                  className="w-5 h-5 rounded accent-digicon-primary"
                />
                <span className="text-sm text-white/70">Contact has given consent to store their data (GDPR / Data Privacy Act compliant)</span>
              </label>

              <div className="flex gap-3 pt-2">
                <GlassButton type="submit" className="flex-1">{t('contacts.save')}</GlassButton>
                <GlassButton type="button" variant="ghost" onClick={() => setShowForm(false)}>{t('contacts.cancel')}</GlassButton>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </AppLayout>
  );
}
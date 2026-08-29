import type { Accent } from '@/components/ui/Tiles';
import type { BannerName } from '@/components/ui/SectionBanner';

export type Movement = {
  id: string;
  banner: BannerName;
  kicker: string;
  title: string;
  lede: string;
  body: readonly string[];
  beats: readonly string[];
  closer?: string;
  cta?: string;
  accent: Accent;
};

type Audience = {
  id: 'professionals' | 'teams' | 'organizations';
  banner: BannerName;
  kicker: string;
  title: string;
  lede: string;
  body: readonly string[];
  points: readonly string[];
  closer: string;
  cta: string;
  accent: Accent;
};

export const BRAND = {
  name: 'DigiCon',
  tagline: 'Digital Connections — your professional identity, connected to your network.',
  philosophyLine: 'More than a digital business card. A better way to build relationships.',
} as const;

export const HERO = {
  eyebrow: 'Digital Connections',
  titleLead: 'Create connections',
  titleAccent: 'that last.',
  verses: [
    'People move.',
    'Meetings end.',
    'Business cards disappear.',
    'Relationships should not.',
  ],
  body: 'DigiCon turns a professional introduction into a connection you can remember, organize, and follow up on.',
  closer: ['Your identity is the beginning.', 'Your network is the value.'],
  ctaPrimary: 'Create Your DigiCon',
  ctaSecondary: 'See How It Works',
  reassurance: 'Start with a focused professional identity. No résumé. No unnecessary fields.',
  stats: [
    { value: '01', label: 'Digital identity' },
    { value: '∞', label: 'Connections' },
    { value: '1', label: 'Relationship layer' },
  ],
} as const;

export const PROBLEM = {
  banner: 'problem',
  kicker: 'Networking is full of moments we lose',
  title: 'The introduction is easy.',
  titleAccent: 'Remembering why it mattered is hard.',
  intro: 'A QR scan can exchange details in seconds. The real failure happens afterward.',
  cannotRemember: [
    'Who did I meet at that event?',
    'What were we going to discuss?',
    'Which person was interested in partnering?',
    'Who should I follow up with this week?',
  ],
  after: 'Traditional cards, screenshots, phone contacts, chat threads and spreadsheets scatter the context across places that were never designed to manage relationships.',
  pull: 'The problem is not exchanging contacts. It is losing the relationship after the handshake.',
  beliefLead: 'DigiCon believes',
  belief: 'A valuable connection should become something you can act on.',
} as const;

export const BIG_IDEA = {
  banner: 'bigidea',
  kicker: 'From identity to relationship',
  title: 'The card is the entry point.',
  titleAccent: 'The relationship is the product.',
  body: [
    'DigiCon starts with a professional identity because every relationship needs a clear point of introduction.',
    'Then it follows what happens after the share: connection, context, follow-up, and the network that grows from those interactions.',
  ],
  steps: ['Identity', 'Share', 'Connect', 'Capture', 'Follow Up'],
  closerLead: 'The outcome we optimize for',
  closer: 'Never lose a valuable connection again.',
} as const;

export const WHAT_IS = {
  banner: 'platform',
  kicker: 'Digital Connections',
  title: 'Your professional identity, connected to your network.',
  body: [
    'DigiCon is more than a digital business card. It is the relationship layer around professional networking.',
    'Create once. Share anywhere. Remember everyone. Grow every connection.',
    'Your card remains simple while the system becomes more useful as your network grows.',
  ],
  flowNote: 'The experience gets richer after the introduction — not more complicated before it.',
} as const;

export const MOVEMENTS: readonly Movement[] = [
  {
    id: 'create',
    banner: 'create',
    kicker: 'Digital identity',
    title: 'Build the professional identity people actually need.',
    lede: 'Simple enough to finish. Strong enough to represent you.',
    body: [
      'Name, role, company, photo or logo, contact details and the links that matter.',
      'DigiCon deliberately avoids turning a business card into a résumé. The minimum viable professional identity is the better starting point.',
    ],
    beats: ['Name and professional role', 'Company and contact details', 'Photo or logo', 'Website and relevant links'],
    closer: 'A card that takes two minutes gets finished.',
    accent: 'violet',
  },
  {
    id: 'share',
    banner: 'share',
    kicker: 'Effortless introduction',
    title: 'Share your identity wherever the conversation happens.',
    lede: 'One card. Multiple ways to introduce yourself.',
    body: [
      'QR, link, NFC-compatible sharing, messaging, email and Wallet keep the technology in the background.',
      'The interface should feel like one action: Share Card.',
    ],
    beats: ['QR → your stable card URL', 'Link → open in any browser', 'Wallet → keep your identity ready', 'NFC → tap when the moment calls for it'],
    closer: 'Technology should disappear into the introduction.',
    accent: 'info',
  },
  {
    id: 'connect',
    banner: 'connect',
    kicker: 'Two-way connection',
    title: 'Turn a one-way card into a two-way exchange.',
    lede: 'The person you meet should have an easy way to connect back.',
    body: [
      'A public card can invite the other person to share their own details without forcing them to create a DigiCon account.',
      'That turns a scan into the beginning of a relationship record.',
    ],
    beats: ['Save my contact', 'Share your contact', 'Consent-aware contact exchange', 'Connection captured at the source'],
    closer: 'A scan is useful. A connection is valuable.',
    accent: 'primary',
  },
  {
    id: 'capture',
    banner: 'capture',
    kicker: 'Relationship context',
    title: 'Remember the conversation, not just the contact.',
    lede: 'Context is what makes a connection actionable.',
    body: [
      'Record where you met, what interested them, what you discussed, and what should happen next.',
      'DigiCon is designed to make that context feel natural instead of forcing people into a traditional CRM workflow.',
    ],
    beats: ['Where you met', 'Why the connection matters', 'Notes and context', 'Last interaction'],
    closer: 'Names are data. Context is memory.',
    accent: 'gold',
  },
  {
    id: 'manage',
    banner: 'manage',
    kicker: 'Your network',
    title: 'Make your network visible and useful.',
    lede: 'The value compounds when relationships stop living in disconnected tools.',
    body: [
      'Organize connections around the people and opportunities that matter instead of forcing every interaction into a sales pipeline.',
      'The long-term goal is a lightweight relationship workspace for professionals, founders, teams and organizations.',
    ],
    beats: ['Connections in one place', 'Statuses and tags', 'Interaction history', 'Portable ownership of your data'],
    closer: 'Your network is an asset. Make it visible.',
    cta: 'Build your network',
    accent: 'secondary',
  },
  {
    id: 'followup',
    banner: 'followup',
    kicker: 'From introduction to action',
    title: 'Turn “nice meeting you” into what happens next.',
    lede: 'A relationship becomes valuable when you act on it.',
    body: [
      'See who needs attention, what was promised, and which connections are becoming opportunities.',
      'DigiCon should help you remember the next action without becoming another complicated enterprise system.',
    ],
    beats: ['Next action', 'Follow-up status', 'Interaction history', 'Opportunities and referrals'],
    closer: 'The best networking system is the one you actually use after the event.',
    cta: 'Start a connection',
    accent: 'eco',
  },
];

export const GRAPH = {
  banner: 'graph',
  kicker: 'Connection graph',
  title: 'Your network becomes',
  titleAccent: 'visible.',
  body: [
    'A thousand names do not necessarily make a valuable network. Meaningful relationships, context and follow-through do.',
    'DigiCon can grow from a card into a living map of the people, organizations and opportunities around your professional life.',
  ],
  facets: [
    { title: 'People', desc: 'Know who you met and what connects you.' },
    { title: 'Context', desc: 'Remember where the relationship started.' },
    { title: 'Momentum', desc: 'See which relationships are moving forward.' },
    { title: 'Opportunity', desc: 'Turn introductions into partnerships, clients and referrals.' },
  ],
  closer: 'The goal is not to collect more contacts. It is to create more possibilities between people.',
} as const;

export const AUDIENCES: readonly Audience[] = [
  {
    id: 'professionals',
    banner: 'professionals',
    kicker: 'People who build through relationships',
    title: 'For people whose next opportunity starts with a conversation.',
    lede: 'Consultants, founders, sales professionals, recruiters, freelancers and independent professionals.',
    body: [
      'You meet people everywhere. DigiCon gives those introductions a home and a next step.',
      'Keep your professional identity ready and your valuable connections from disappearing into chat threads and screenshots.',
    ],
    points: ['Share in seconds', 'Keep your identity current', 'Capture the context behind connections', 'Follow up when it matters'],
    closer: 'Your next connection could matter more than you think.',
    cta: 'Create your identity',
    accent: 'info',
  },
  {
    id: 'teams',
    banner: 'teams',
    kicker: 'A consistent team presence',
    title: 'Give every team member a professional identity that stays connected.',
    lede: 'Useful for startups, agencies, sales teams, community teams and growing businesses.',
    body: [
      'People move. Relationships should not disappear with them.',
      'DigiCon can help teams create a consistent way to share identity and capture the relationships created through events, partnerships and everyday work.',
    ],
    points: ['Consistent team identity', 'Faster introductions', 'Shared relationship context', 'A network that survives organizational change'],
    closer: 'Your team’s network is an organizational asset.',
    cta: 'Explore team use',
    accent: 'violet',
  },
  {
    id: 'organizations',
    banner: 'organizations',
    kicker: 'Relationship infrastructure',
    title: 'Make the relationships around your organization more visible and useful.',
    lede: 'For organizations that depend on programs, partnerships, communities and stakeholder networks.',
    body: [
      'DigiCon can create a more consistent, connected way to manage professional relationships across teams, programs, events and partnerships.',
      'The long-term opportunity is organizational memory without turning every relationship into a complicated CRM record.',
    ],
    points: ['Professional identity at scale', 'Connection capture', 'Relationship context', 'A network that becomes organizational memory'],
    closer: 'Make it visible. Make it useful. Make it last.',
    cta: 'Talk to DigiCon',
    accent: 'primary',
  },
];

export const SIMPLICITY = {
  banner: 'simplicity',
  kicker: 'Powerful does not have to mean complicated',
  title: 'Start with what people actually need.',
  body: ['Most tools keep adding features. DigiCon starts with the relationship.'],
  question: 'What do people need to build better relationships?',
  needs: ['A beautiful identity.', 'An effortless introduction.', 'A remembered connection.', 'Useful context.', 'A simple way to follow up.'],
  thatsIt: 'That’s it.',
  closer: ['Technology should disappear into the experience.', 'The relationship should remain.'],
} as const;

export const PRIVACY = {
  banner: 'privacy',
  kicker: 'Your network belongs to you',
  title: 'Connect openly. Share intentionally. Stay in control.',
  body: [
    'Relationships are personal. Your information should never feel like something you surrendered just to participate.',
    'DigiCon is built around transparency and control — helping you decide what you share, what others can see, and how your information is used.',
  ],
  pillars: [
    { title: 'Share intentionally', desc: 'Put the right information in the right context.' },
    { title: 'Know what is visible', desc: 'Public-card information should be deliberate and understandable.' },
    { title: 'Keep control', desc: 'Your identity, your contacts and your data should remain yours.' },
  ],
} as const;

export const WHY = {
  kicker: 'Why DigiCon?',
  title: 'Networking is not about',
  titleAccent: 'collecting people.',
  lead: 'It is about creating possibilities between people.',
  moments: [
    'One meaningful relationship can change a career.',
    'One introduction can create a company.',
    'One conversation can open a partnership.',
    'One person can introduce you to another person who changes everything.',
  ],
  closer: 'DigiCon helps you remember those moments.',
} as const;

export const PHILOSOPHY = {
  kicker: 'The DigiCon philosophy',
  title: 'People do not remember',
  titleAccent: 'business cards.',
  remembered: ['The conversation', 'The idea', 'The kindness', 'The opportunity', 'The person who listened', 'The person who helped', 'The person who said “let’s work together.”'],
  quoteLead: 'What DigiCon exists to protect',
  quote: 'People remember people.',
  closer: 'DigiCon exists to make sure the moments that create relationships do not disappear.',
} as const;

export const HOW_IT_WORKS = {
  kicker: 'How it works',
  title: 'From identity to relationship.',
  steps: [
    { step: '01', title: 'Create', desc: 'Build your focused professional digital identity.' },
    { step: '02', title: 'Share', desc: 'Exchange it through QR, link, NFC, chat, email or Wallet.' },
    { step: '03', title: 'Connect', desc: 'Let the person you meet share their details back.' },
    { step: '04', title: 'Remember', desc: 'Capture the context that makes the connection meaningful.' },
    { step: '05', title: 'Follow Up', desc: 'Know what should happen next and who needs attention.' },
    { step: '06', title: 'Grow', desc: 'Build a network that becomes more valuable over time.' },
  ],
} as const;

export const FAQ = [
  { q: 'Is DigiCon just a digital business card?', a: 'No. The digital card is the entry point. DigiCon is designed to turn introductions into connections, context and follow-up.' },
  { q: 'Do people need a DigiCon account to view my card?', a: 'No. Your public card is designed to open from a stable link such as digicon.cards/c/{cardId}.' },
  { q: 'Can I share my card by QR?', a: 'Yes. The QR should point to your canonical public card URL, not to an authentication session or the homepage.' },
  { q: 'Can I use Apple or Google Wallet?', a: 'DigiCon supports Wallet distribution through its existing Apple and Google Wallet endpoints.' },
  { q: 'Does DigiCon require a bio?', a: 'No. DigiCon intentionally keeps the professional identity focused. Your card should not become a résumé.' },
  { q: 'What happens after someone connects with me?', a: 'The product direction is to capture the connection and its context so you can organize it and follow up rather than losing it in a contact list.' },
] as const;

export const FINAL_CTA = {
  banner: 'cta',
  title: 'Do not just exchange contacts.',
  titleAccent: 'Create connections that last.',
  body: [
    'The world does not need another place to store names.',
    'It needs better ways for people to remember why they met.',
    'DigiCon turns the fleeting moment of an introduction into the beginning of something more.',
  ],
  becomes: ['A conversation', 'A collaboration', 'A partnership', 'An opportunity', 'A relationship'],
  kicker: 'Your next connection could matter more than you think.',
  cta: 'Create Your DigiCon',
  signoff: ['More than a digital business card.', 'A better way to build relationships.'],
} as const;

export const VOCABULARY = [
  { generic: 'Contacts', digicon: 'Connections' },
  { generic: 'Leads', digicon: 'Relationships' },
  { generic: 'Pipeline', digicon: 'Follow-up' },
  { generic: 'Profile', digicon: 'Identity' },
  { generic: 'CRM', digicon: 'Relationship workspace' },
  { generic: 'Views', digicon: 'Introductions' },
] as const;

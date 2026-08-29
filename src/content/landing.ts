/**
 * DigiCon web copy — single source of truth.
 * ==========================================
 * Every string the landing experience renders lives here, so copy can be
 * edited, reviewed or translated without touching layout code. The structure
 * mirrors the approved narrative:
 *
 *   Hero → Problem → Big Idea → What is DigiCon →
 *   Create / Share / Connect / Capture / Manage / Follow Up →
 *   Connection Graph → Audiences → Simplicity → Privacy →
 *   Why → Philosophy → How it works → Final CTA
 *
 * Messaging hierarchy this copy expresses:
 *   CATEGORY   Digital relationship platform
 *   PRODUCT    Professional digital identity + connection capture + lightweight
 *              relationship management
 *   EMOTIONAL  Don't lose the people you meet.
 *   FUNCTIONAL Create, share, capture, remember and follow up — effortlessly.
 *   BRAND      Turn introductions into relationships.
 */

import type { BannerName } from '@/components/ui/SectionBanner';

export const BRAND = {
  name: 'DigiCon',
  tagline: 'More than a digital business card. A better way to build relationships.',
  category: 'Digital relationship platform',
  promise: 'Turn introductions into relationships.',
  philosophyLine:
    'Every introduction is a possibility. DigiCon helps you remember what happens next.',
} as const;

export const HERO = {
  eyebrow: 'Identity · Connection · Relationship',
  titleLead: 'More than a digital business card.',
  titleAccent: 'Turn introductions into relationships.',
  verses: [
    'You meet someone once.',
    'A conversation happens.',
    'A possibility opens.',
    'A name is exchanged.',
    'Then the moment passes.',
  ],
  body:
    'DigiCon helps you keep the connection alive — giving you a professional digital identity, making every introduction effortless, and helping you remember, manage and follow up with the people who matter.',
  closer: ['Your card is the beginning.', 'The relationship is the real value.'],
  ctaPrimary: 'Create Your DigiCon',
  ctaSecondary: 'See How It Works',
  reassurance: 'No complicated setup. No clutter. Just a better way to connect.',
  stats: [
    { value: 'One', label: 'identity, always ready' },
    { value: '6 ways', label: 'to make an introduction' },
    { value: 'Zero', label: 'sign-up to connect with you' },
  ],
} as const;

export const PROBLEM = {
  banner: 'problem' as BannerName,
  kicker: 'The Problem',
  title: 'We have never been more connected.',
  titleAccent: 'Yet meaningful connections are easier to lose than ever.',
  intro: 'A business card can tell someone who you are. But it cannot remember:',
  cannotRemember: [
    'Where you met.',
    'What you talked about.',
    'Why you connected.',
    'What you promised to do next.',
  ],
  after:
    'And after the event, conference, meeting or introduction, that valuable moment can disappear into a phonebook, spreadsheet, messaging app — or nowhere at all.',
  pull: 'Networking should not end when the conversation ends.',
  beliefLead: 'DigiCon was created around a simple belief:',
  belief: 'Every meaningful introduction deserves a chance to become a meaningful relationship.',
} as const;

export const BIG_IDEA = {
  banner: 'bigidea' as BannerName,
  kicker: 'The Big Idea',
  title: 'A card is a moment.',
  titleAccent: 'A connection is a journey.',
  body: [
    'Traditional business cards were designed for exchanging information.',
    'But relationships are built through memory, context, trust and follow-through.',
    'DigiCon connects those pieces.',
  ],
  steps: [
    'Create your identity.',
    'Share it instantly.',
    'Capture the connection.',
    'Remember the context.',
    'Follow up with intention.',
  ],
  closerLead: "Because the value of networking isn't how many cards you collect.",
  closer: "It's what happens after you exchange them.",
} as const;

export const WHAT_IS = {
  banner: 'platform' as BannerName,
  kicker: 'What is DigiCon?',
  title: 'Your professional identity, connection memory, and lightweight relationship workspace — in one place.',
  body: [
    'DigiCon gives you a beautiful digital presence that people can access instantly through QR, link, NFC, email, chat or wallet.',
    "But it doesn't stop at sharing your information.",
    'When someone connects with you, DigiCon helps turn that moment into something you can actually build on.',
  ],
  flowNote: 'A simple flow for something deeply human.',
} as const;

/** The six product movements — each gets its own banner-backed section. */
export type Movement = {
  id: string;
  banner: BannerName;
  kicker: string;
  title: string;
  lede: string;
  body: string[];
  /** Short, punchy lines set as a list. */
  beats: string[];
  closer?: string;
  cta?: string;
  accent: 'primary' | 'info' | 'violet' | 'eco' | 'gold' | 'secondary';
};

export const MOVEMENTS: Movement[] = [
  {
    id: 'create',
    banner: 'create',
    kicker: 'Create',
    title: 'Make your first impression worth remembering.',
    lede: 'One identity. Always ready.',
    body: [
      'Your professional identity should feel like you — not like a template copied from everyone else.',
      'Create a polished digital profile containing the information people actually need to know.',
    ],
    beats: ['Your name.', 'Your story.', 'Your work.', 'Your links.', 'Your way of connecting.'],
    cta: 'Create Your Digital Identity',
    accent: 'violet',
  },
  {
    id: 'share',
    banner: 'share',
    kicker: 'Share',
    title: 'The easiest introduction is the one that gets out of the way.',
    lede: 'Less friction. More conversation.',
    body: [
      'No fumbling through paper cards. No spelling out long URLs. No searching for your profile.',
      'Simply share. One tap can open the door to your professional world.',
    ],
    beats: ['QR.', 'Link.', 'NFC.', 'Email.', 'Chat.', 'Wallet.'],
    cta: 'Share Your DigiCon',
    accent: 'info',
  },
  {
    id: 'connect',
    banner: 'connect',
    kicker: 'Connect',
    title: "Don't just exchange details. Exchange possibility.",
    lede: 'Because connection begins when information moves both ways.',
    body: [
      'Someone scans your card. They see who you are. They choose what they want to share.',
      'And suddenly, a simple introduction becomes a two-way connection.',
    ],
    beats: [
      'They open your identity.',
      'They save your details.',
      'They choose to share their own.',
      'No account required of them.',
    ],
    closer: 'DigiCon helps make that transition effortless.',
    accent: 'primary',
  },
  {
    id: 'capture',
    banner: 'capture',
    kicker: 'Capture',
    title: 'The most valuable part of networking is what happens after the handshake.',
    lede: 'Remember the person — not just the contact.',
    body: [
      'Every connection has context. DigiCon helps you capture those details while they are still meaningful.',
    ],
    beats: [
      'Maybe you met at a conference.',
      'Maybe they mentioned a project.',
      'Maybe you discovered a shared interest.',
      'Maybe there is an opportunity worth exploring.',
    ],
    accent: 'gold',
  },
  {
    id: 'manage',
    banner: 'manage',
    kicker: 'Manage',
    title: 'Your network should feel like a relationship map, not a spreadsheet.',
    lede: 'Just enough structure to help relationships move forward.',
    body: [
      "Your contacts shouldn't disappear into an endless list of names.",
      'DigiCon gives you a lightweight relationship workspace where you can organize connections, capture context and keep track of conversations.',
    ],
    beats: ['Know who you met.', 'Remember why it mattered.', 'See what comes next.'],
    closer: 'No bloated CRM. No unnecessary complexity.',
    accent: 'secondary',
  },
  {
    id: 'followup',
    banner: 'followup',
    kicker: 'Follow Up',
    title: 'A connection becomes valuable when you continue it.',
    lede: '“Let\'s keep in touch” should mean something.',
    body: [
      "The hardest part of networking isn't meeting people. It's remembering to follow up.",
      'DigiCon helps you turn good intentions into action.',
    ],
    beats: [
      'Add notes.',
      'Remember conversations.',
      'Track follow-ups.',
      'Reconnect when the moment is right.',
    ],
    cta: 'Start Building Your Network',
    accent: 'eco',
  },
];

export const GRAPH = {
  banner: 'graph' as BannerName,
  kicker: 'The Connection Graph',
  title: 'Your network is more than a list of contacts.',
  titleAccent: "It's a living map of relationships.",
  body: [
    'Every scan tells a story. Every connection adds context. Every interaction creates another point in your professional world.',
    'Over time, DigiCon can help you see something a conventional business card never could: the shape of your network.',
  ],
  facets: [
    { title: 'Who you meet', desc: 'The people behind every introduction, held in one place.' },
    { title: 'Where connections begin', desc: 'The event, the meeting, the moment that started it.' },
    { title: 'Which relationships grow', desc: 'The threads that keep moving, and the ones going quiet.' },
    { title: 'Where opportunities emerge', desc: 'The conversations worth returning to next.' },
  ],
  closer:
    'Your network becomes more valuable because it becomes more understandable.',
} as const;

export type Audience = {
  id: string;
  banner: BannerName;
  kicker: string;
  title: string;
  lede: string;
  body: string[];
  points: string[];
  closer: string;
  cta: string;
  accent: 'gold' | 'eco' | 'secondary';
};

export const AUDIENCES: Audience[] = [
  {
    id: 'professionals',
    banner: 'professionals',
    kicker: 'For Professionals',
    title: 'Your work is bigger than your job title.',
    lede: 'For people whose opportunities begin with a conversation.',
    body: [
      'Whether you are an entrepreneur, consultant, freelancer, salesperson, advisor, creator or business development professional, your reputation travels through relationships.',
      'DigiCon gives that reputation a place to live.',
    ],
    points: [
      'Entrepreneurs and consultants',
      'Freelancers and creators',
      'Sales and business development',
      'Advisors and community leaders',
    ],
    closer: 'Your reputation travels through relationships. Give it somewhere to live.',
    cta: 'Build My Professional Identity',
    accent: 'gold',
  },
  {
    id: 'teams',
    banner: 'teams',
    kicker: 'For Startups & Teams',
    title: 'When your people connect, your organization connects.',
    lede: 'Individual presence. Collective intelligence.',
    body: [
      'Your team meets customers. Your salespeople meet prospects. Your founders meet partners. Your staff meet communities.',
      'DigiCon gives every member of your organization a professional identity while giving the organization a more connected view of its network.',
    ],
    points: [
      'A consistent identity for every team member',
      'Shared visibility of the network you build together',
      'Connections captured as they happen, not weeks later',
      'Onboarding a new colleague takes minutes',
    ],
    closer: 'Individual presence. Collective intelligence.',
    cta: 'Explore Team DigiCon',
    accent: 'eco',
  },
  {
    id: 'organizations',
    banner: 'organizations',
    kicker: 'For Organizations',
    title: 'Turn networking into organizational memory.',
    lede: "Your organization's network is an asset. Make it visible. Make it useful. Make it last.",
    body: [
      "Events end. Projects change. People move. But relationships shouldn't disappear with them.",
      'DigiCon can help organizations create a more consistent, connected way to manage professional relationships across teams, programs, events and partnerships.',
    ],
    points: [
      'Relationships that survive staff turnover',
      'A connected view across teams and programs',
      'Event and partnership networks retained',
      'Consistent professional presence, org-wide',
    ],
    closer: 'Relationships should outlast the people who made them.',
    cta: 'Talk to DigiCon',
    accent: 'secondary',
  },
];

export const SIMPLICITY = {
  banner: 'simplicity' as BannerName,
  kicker: 'Simplicity',
  title: "Powerful doesn't have to mean complicated.",
  body: [
    'Most tools keep adding features. DigiCon starts somewhere else:',
  ],
  question: 'What do people actually need to build better relationships?',
  needs: [
    'A beautiful identity.',
    'An effortless introduction.',
    'A remembered connection.',
    'Useful context.',
    'A simple way to follow up.',
  ],
  thatsIt: "That's it.",
  closer: ['Technology should disappear into the experience.', 'The relationship should remain.'],
} as const;

export const PRIVACY = {
  banner: 'privacy' as BannerName,
  kicker: 'Privacy & Trust',
  title: 'Your network belongs to you.',
  body: [
    'Relationships are personal. Your information should never feel like something you have surrendered just to participate.',
    'DigiCon is built around transparency and control — helping you decide what you share, what others can see, and how your information is used.',
  ],
  pillars: [
    { title: 'Connect openly', desc: 'Share your identity with anyone, on any device, without friction.' },
    { title: 'Share intentionally', desc: 'Field-level visibility and consent on every exchange.' },
    { title: 'Stay in control', desc: 'Clear settings, transparent analytics, export and deletion.' },
  ],
} as const;

export const WHY = {
  kicker: 'Why DigiCon?',
  title: "Because networking isn't about collecting people.",
  titleAccent: "It's about creating possibilities between people.",
  lead: "A thousand contacts don't necessarily create a valuable network.",
  moments: [
    'One meaningful relationship can change a career.',
    'One introduction can create a company.',
    'One conversation can open a partnership.',
    'One person can introduce you to another person who changes everything.',
  ],
  closer: 'DigiCon helps you remember those moments.',
} as const;

export const PHILOSOPHY = {
  kicker: 'The DigiCon Philosophy',
  title: "People don't remember business cards.",
  titleAccent: 'They remember people.',
  remembered: [
    'The conversation.',
    'The idea.',
    'The kindness.',
    'The opportunity.',
    'The person who listened.',
    'The person who helped.',
  ],
  quote: 'I think we should work together.',
  quoteLead: 'The person who said:',
  closer: "DigiCon exists to make sure those moments don't disappear.",
} as const;

export const HOW_IT_WORKS = {
  kicker: 'How It Works',
  title: 'Six steps, and the last one never ends.',
  steps: [
    { step: '01', title: 'Create', desc: 'Build your professional digital identity.' },
    { step: '02', title: 'Share', desc: 'Exchange your DigiCon through QR, link, NFC, email, chat or wallet.' },
    { step: '03', title: 'Connect', desc: 'Let people share their details with you.' },
    { step: '04', title: 'Remember', desc: 'Capture the context behind the connection.' },
    { step: '05', title: 'Follow Up', desc: 'Turn an introduction into an ongoing relationship.' },
    { step: '06', title: 'Grow', desc: 'Build a network that becomes more valuable over time.' },
  ],
} as const;

export const FINAL_CTA = {
  banner: 'cta' as BannerName,
  title: "Don't just exchange contacts.",
  titleAccent: 'Create connections that last.',
  body: [
    "The world doesn't need another place to store names.",
    'It needs better ways for people to remember why they met.',
    'DigiCon turns the fleeting moment of an introduction into the beginning of something more:',
  ],
  becomes: ['a conversation.', 'a collaboration.', 'a partnership.', 'an opportunity.', 'a relationship.'],
  kicker: 'Your next connection could matter more than you think.',
  cta: 'Create Your DigiCon',
  signoff: ['More than a digital business card.', 'A better way to build relationships.'],
} as const;

/**
 * The DigiCon vocabulary.
 *
 * Generic SaaS labels on the left, DigiCon language on the right. This map is
 * the reference the whole product is written against — surfaced on the landing
 * page so the language is visible, and used verbatim in the app navigation.
 */
export const VOCABULARY: Array<{ generic: string; digicon: string }> = [
  { generic: 'Create Card', digicon: 'Create Your Identity' },
  { generic: 'Share Card', digicon: 'Make an Introduction' },
  { generic: 'Contacts', digicon: 'Connections' },
  { generic: 'Add Contact', digicon: 'Capture Connection' },
  { generic: 'Contact Details', digicon: 'Their Details' },
  { generic: 'Notes', digicon: 'Remember the Moment' },
  { generic: 'CRM', digicon: 'Relationship Workspace' },
  { generic: 'Leads', digicon: 'Opportunities' },
  { generic: 'Analytics', digicon: 'Connection Insights' },
  { generic: 'Reminders', digicon: 'Follow-Up' },
  { generic: 'Profile', digicon: 'Professional Identity' },
  { generic: 'Dashboard', digicon: 'My Network' },
  { generic: 'Add User', digicon: 'Invite Your Team' },
  { generic: 'Contact List', digicon: 'Connection Map' },
];

export const FAQ: Array<{ q: string; a: string }> = [
  {
    q: 'How is this different from a digital business card?',
    a: 'A card is a moment; a connection is a journey. Most digital cards stop at sharing your details. DigiCon captures what happened around the exchange — where you met, what you discussed, what comes next — so the introduction has somewhere to go.',
  },
  {
    q: 'Does the person I meet need a DigiCon account?',
    a: 'No. They can open your identity, save your details and choose to share their own without signing up for anything. Connection begins when information moves both ways, and that should never require an account.',
  },
  {
    q: 'Is this going to feel like another CRM I have to maintain?',
    a: 'No. DigiCon asks what you want to remember about a person rather than forcing a pipeline schema on you. The relationship record emerges from networking behaviour instead of being configured up front.',
  },
  {
    q: 'Who owns my connections and my data?',
    a: 'You do. Your identity, your card, your connections, your notes. You decide what you share, what others can see, and how your information is used — including exporting it or deleting it entirely.',
  },
  {
    q: 'What happens to my QR code if I change jobs?',
    a: 'Nothing. Your QR points to a stable identity, not to a snapshot. Change your name, role, company, photo, links or design and every code you have ever shared keeps working.',
  },
  {
    q: 'Can I use DigiCon offline?',
    a: 'Yes. DigiCon installs to your home screen as an app, opens instantly, and keeps working when the signal does not — which is exactly when you tend to be at an event.',
  },
];

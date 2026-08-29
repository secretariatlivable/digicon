/**
 * DigiCon customer support copy — single source of truth.
 * =======================================================
 * Same contract as `content/landing.ts`: every string the support experience
 * renders lives here, so copy can be edited, reviewed or translated without
 * touching layout code.
 *
 * The voice is the landing page's voice. Support pages usually switch registers
 * — warm marketing prose, then a clipped ticketing tone the moment something
 * breaks. DigiCon's whole argument is that a relationship does not stop being a
 * relationship when it becomes inconvenient, so the page that catches people on
 * their worst day is written like the page that welcomed them on their first.
 *
 *   Hero → Channels → Help topics → Troubleshooting →
 *   Billing → Response times → Contact → Still stuck
 */

import type { BannerName } from '@/components/ui/SectionBanner';

export const SUPPORT_HERO = {
  banner: 'support' as BannerName,
  eyebrow: 'Support · Answers · A human',
  titleLead: "Something isn't working the way it should.",
  titleAccent: "Let's fix it.",
  verses: [
    'You were mid-introduction.',
    'Something did not load.',
    'The moment does not wait.',
  ],
  body:
    'Most of what goes wrong with DigiCon has a two-minute answer, and it is on this page. When it does not, a person reads what you send and replies — no ticket queue you have to chase, no bot asking you to rephrase the question.',
  closer: ['Your problem is not a ticket.', "It's a conversation we owe you."],
  ctaPrimary: 'Search the answers',
  ctaSecondary: 'Message support',
  reassurance: 'No account needed to read this page. Nothing here is behind a paywall.',
  stats: [
    { value: '9 of 10', label: 'answered on this page' },
    { value: 'Same day', label: 'first human reply, weekdays' },
    { value: 'Always', label: 'a person, not a bot' },
  ],
} as const;

/** How to reach us. Ordered by how quickly each one actually resolves things. */
export type SupportChannel = {
  id: string;
  icon: 'search' | 'mail' | 'chat' | 'community' | 'status' | 'phone';
  title: string;
  desc: string;
  detail: string;
  action: string;
  /** External destination, or a section id to scroll to. */
  href?: string;
  section?: string;
  accent: 'primary' | 'info' | 'violet' | 'eco' | 'gold' | 'secondary';
};

export const SUPPORT_CHANNELS: SupportChannel[] = [
  {
    id: 'self',
    icon: 'search',
    title: 'Find it yourself, right now',
    desc: 'The answers below cover uploads, sharing, wallet passes, QR codes, plans and billing.',
    detail: 'Instant · always available',
    action: 'Search the answers',
    section: 'help-topics',
    accent: 'info',
  },
  {
    id: 'email',
    icon: 'mail',
    title: 'Email a person',
    desc: 'The main channel, and the one to use for anything involving your account or a payment.',
    detail: 'support@digicon.cards · same-day weekdays',
    action: 'Write to support',
    section: 'contact',
    accent: 'primary',
  },
  {
    id: 'chat',
    icon: 'chat',
    title: 'Message on Viber or WhatsApp',
    desc: 'For quick questions while you are at an event and cannot sit down to write an email.',
    detail: 'Mon–Fri, 9am–6pm PHT',
    action: 'Open a chat',
    href: 'https://wa.me/639000000000',
    accent: 'eco',
  },
  {
    id: 'billing',
    icon: 'status',
    title: 'Billing and subscriptions',
    desc: 'Charged but still on the free tier? Changed plans? Need a receipt or a refund?',
    detail: 'Handled directly, not by a form',
    action: 'Billing help',
    section: 'billing',
    accent: 'gold',
  },
];

/**
 * The help topics, grouped. These mirror the six movements on the landing page
 * — the language a customer uses to describe a problem should be the language
 * the product taught them.
 */
export type HelpGroup = {
  id: string;
  kicker: string;
  title: string;
  lede: string;
  icon: 'identity' | 'share' | 'connect' | 'network' | 'account';
  accent: 'primary' | 'info' | 'violet' | 'eco' | 'gold' | 'secondary';
  items: Array<{ q: string; a: string }>;
};

export const HELP_GROUPS: HelpGroup[] = [
  {
    id: 'identity',
    kicker: 'Create',
    title: 'Your identity',
    lede: 'Building the card, and making it look like you.',
    icon: 'identity',
    accent: 'violet',
    items: [
      {
        q: 'My photo or logo will not upload',
        a: 'If the upload fails with a message about a security policy, the app is talking to a database that has not received its latest update — the storage area your images live in was created by a migration that has not been applied yet. That is on us, not on your file. Send us a message and we will confirm; there is nothing to fix on your side. If instead the file is simply rejected, check that it is a JPG, PNG or WebP under 5MB — very large photos straight from a DSLR are the usual culprit.',
      },
      {
        q: 'What should actually go on my card?',
        a: 'Less than you think. Your name, what you do, and the one or two ways you genuinely want to be contacted. The bio is optional and collapsed by default because a card that takes two minutes gets finished and a card that takes twenty does not. You can always add more later — every QR code you have already shared keeps pointing at the updated version.',
      },
      {
        q: 'Can I have more than one card?',
        a: 'Yes, and it is the right move if you wear more than one hat — a consulting identity and a board identity, say, or one card in English and one in Filipino. Your plan sets how many you can keep active at once. Each card gets its own link and its own QR.',
      },
      {
        q: 'Why is my card portrait rather than landscape?',
        a: 'Because it lives on a phone. A landscape card is a skeuomorph of the paper rectangle it replaces: it wastes the vertical space every phone actually has and squeezes contact details into cramped rows. Portrait gives your photo real presence and makes every contact method a full-width tap target — which is what people do with a card on a phone. They tap it, they do not read it.',
      },
    ],
  },
  {
    id: 'sharing',
    kicker: 'Share',
    title: 'Sharing and QR codes',
    lede: 'Getting your identity into someone else’s hands.',
    icon: 'share',
    accent: 'info',
    items: [
      {
        q: '“This card isn’t available” when I open my own share link',
        a: 'The public version of a card is served through a separate read-only view, so a stranger can open it without an account and without reaching anything else in your data. If that view is missing on the deployment you are using, every share link reports the card as unavailable even though the card is perfectly fine. Tell us and we will check the deployment — your card and its contents are not lost.',
      },
      {
        q: 'My QR code is not showing on the card',
        a: 'The QR is generated from your card’s public link, so it only appears once the card has been saved and has a link to point at. If you are looking at an unsaved draft in the editor, save it first. If a saved card still shows no QR, that is the same public-view problem as above and is worth reporting.',
      },
      {
        q: 'Do I have to reprint anything when I change jobs?',
        a: 'No. Your QR points to a stable identity, not to a snapshot of it. Change your role, company, photo, links or colours and every code you have ever handed out — printed on a badge, stuck on a laptop, saved in someone’s phone — keeps working and shows the new version.',
      },
      {
        q: 'Does the person I meet need a DigiCon account?',
        a: 'No, and they never will. They open your identity, save your details, and choose whether to share their own. Connection begins when information moves both ways, and requiring an account of the other person is exactly the friction that stops it.',
      },
      {
        q: 'Can I share without a signal?',
        a: 'Yes. Install DigiCon to your home screen and your own card is cached on the device, so the QR renders and the card opens even when the venue Wi-Fi has given up — which, at events, is most of the time.',
      },
    ],
  },
  {
    id: 'connections',
    kicker: 'Capture',
    title: 'Connections and follow-up',
    lede: 'The part that happens after the handshake.',
    icon: 'connect',
    accent: 'primary',
    items: [
      {
        q: 'Someone scanned my card but never appeared in my connections',
        a: 'Opening your card and sharing their details back are two separate choices, and the second one is theirs. A scan is recorded as a view; a connection is only created when the visitor fills in the exchange and submits it. If you expected details and did not get them, they most likely closed the page first.',
      },
      {
        q: 'Can I add a connection I met the old-fashioned way?',
        a: 'Yes. Capture the connection manually and it sits alongside the ones that arrived by QR, with the same place for notes about where you met and what you agreed. The point is one record of the relationship, not one record per channel.',
      },
      {
        q: 'How do I get my connections out of DigiCon?',
        a: 'Export them from your settings, whenever you want, in a standard format that opens in a spreadsheet or imports into a CRM. Your network is yours. A product that holds your relationships hostage has already failed the thing it claims to be for.',
      },
    ],
  },
  {
    id: 'account',
    kicker: 'Account',
    title: 'Account, privacy and data',
    lede: 'Access, control, and getting out if you want to.',
    icon: 'account',
    accent: 'eco',
    items: [
      {
        q: 'I cannot sign in / I did not get the email',
        a: 'Check spam first — sign-in mail lands there more often than anyone would like. If it is genuinely missing, request it again after a minute rather than in quick succession, since repeated requests can be rate-limited. Still nothing after five minutes and it is worth telling us, because that is usually a delivery problem on our side.',
      },
      {
        q: 'Who can see what is on my card?',
        a: 'Anything on a published card is visible to anyone who has the link — that is what a card is for. Everything else — your connections, your notes, your analytics — is visible only to you. Field-level visibility lets you keep something in your record without putting it on the public card.',
      },
      {
        q: 'How do I delete my account and everything in it?',
        a: 'From your settings, and it is a real deletion rather than a flag on a row. Export your connections first if you want to keep them, because once it is gone we cannot recover it for you.',
      },
    ],
  },
];

/**
 * The problems that actually get reported, with the honest cause.
 *
 * Written as symptom → cause → what to do, in that order, because a customer
 * arrives holding a symptom and nothing else. Several of these are our bugs;
 * saying so plainly costs less than a customer discovering it themselves.
 */
export const TROUBLESHOOTING = {
  banner: 'problem' as BannerName,
  kicker: 'Troubleshooting',
  title: 'The five things that actually go wrong',
  lede: 'What you see, what is causing it, and what to do next. Three of these are ours to fix, and we say so.',
  items: [
    {
      symptom: 'Uploading a photo or logo fails with a security-policy message',
      cause:
        'The storage area your images belong in has not been created on this deployment yet. Nothing is wrong with your file or your permissions.',
      fix: 'Report it and carry on building the card — everything else saves normally, and the image can be added once the fix lands.',
      ours: true,
    },
    {
      symptom: '“This card isn’t available” when opening your own share link',
      cause:
        'The read-only public view that serves cards to visitors is missing on this deployment. Your card, and everything on it, is intact.',
      fix: 'Report it. Avoid handing out that link until it resolves, since visitors will see the same message.',
      ours: true,
    },
    {
      symptom: 'Wallet download is refused although your plan is active',
      cause:
        'Your subscription was charged but never recorded against your account, so the app still reads you as being on the free tier. Two separate faults could cause this, and both are ours.',
      fix: 'Send us the email on the account and your PayPal or Stripe subscription reference. We reconcile it by hand and access is restored — you are not asked to pay again.',
      ours: true,
    },
    {
      symptom: 'The sidebar covers the fields you are trying to edit',
      cause: 'A layout fault on narrow desktop windows that trapped dialogs beneath the navigation.',
      fix: 'Fixed. Hard-refresh the page — an open tab keeps the old assets until you do.',
      ours: true,
    },
    {
      symptom: 'Your card looks out of date to someone else',
      cause:
        'Their browser or wallet is showing a cached copy, which is what makes DigiCon work offline in the first place.',
      fix: 'Ask them to reopen the link rather than the saved page. It refreshes on the next connected open.',
      ours: false,
    },
  ],
} as const;

export const BILLING = {
  kicker: 'Billing',
  title: 'Payments, plans and the honest version',
  lede: 'DigiCon bills through Stripe and PayPal. We never see or store your card number — both providers handle that directly.',
  items: [
    {
      q: 'I paid, and I am still on the free tier',
      a: 'This is a known fault and it is ours. Your subscription exists at the payment provider but was not recorded against your DigiCon account, so the app reads you as unsubscribed. Send us the email on your account and the subscription reference from your confirmation email — it starts with I- for PayPal or sub_ for Stripe — and we will restore access. You will not be charged again, and you do not need to cancel and resubscribe.',
    },
    {
      q: 'How do I change or cancel my plan?',
      a: 'From your settings, and it takes effect at the end of the period you have already paid for rather than immediately — you keep what you bought. Cancelling never deletes your cards or connections; you drop to the free tier and your data stays where it is.',
    },
    {
      q: 'Can I get a receipt or an invoice?',
      a: 'Yes. Stripe and PayPal both email one at each renewal, and we can re-send or reissue with your company details on it if you need it for reimbursement. Ask and we will send it.',
    },
    {
      q: 'What happens to my cards if I stop paying?',
      a: 'They keep working. Published cards stay live and every QR you have shared keeps resolving, because letting a customer’s handed-out cards die is not a pricing strategy, it is a punishment. What you lose is access to the paid features — additional cards, wallet passes and the deeper connection insights.',
    },
    {
      q: 'Do you offer anything for nonprofits or students?',
      a: 'Yes, though not as a button on the pricing page. Write to us with a line about what you are doing and we will sort something out.',
    },
  ],
} as const;

/** What "we will get back to you" actually means, per plan. */
export const RESPONSE_TIMES = {
  kicker: 'Response times',
  title: 'What “we’ll get back to you” means here',
  lede: 'First reply from a person, in business hours, Philippine time. Not an automated acknowledgement — an actual answer or an actual question back.',
  rows: [
    { plan: 'Startup', price: 'Free', first: 'Within 2 business days', channels: 'Email', accent: 'info' as const },
    { plan: 'Starter', price: 'Paid', first: 'Same business day', channels: 'Email · Chat', accent: 'primary' as const },
    { plan: 'Growth', price: 'Paid', first: 'Within 4 business hours', channels: 'Email · Chat · Call', accent: 'violet' as const },
    { plan: 'Enterprise', price: 'Paid', first: 'Within 2 business hours', channels: 'Named contact · Call', accent: 'gold' as const },
  ],
  note: 'Anything involving a payment that has gone wrong jumps the queue regardless of plan. Being charged for something you cannot use is not a tier-two issue.',
  hours: 'Monday to Friday, 9am – 6pm Philippine Standard Time (UTC+8). Messages sent over a weekend are read on Monday morning.',
} as const;

export const CONTACT = {
  kicker: 'Message us',
  title: 'Tell us what happened',
  lede: 'The more of this you fill in, the more likely the first reply is an answer rather than a question. Everything except the message itself is optional.',
  topics: [
    'Something is broken',
    'Photo or logo will not upload',
    'My card will not open for others',
    'Billing or subscription',
    'Wallet pass or plan access',
    'Account and sign-in',
    'Privacy or data request',
    'Feature request or feedback',
    'Something else',
  ],
  emailTo: 'support@digicon.cards',
  submitLabel: 'Open in your email app',
  copyLabel: 'Copy the details instead',
  copiedLabel: 'Copied — paste it into an email or chat',
  privacyNote:
    'This form opens your own email app with the message ready to send. Nothing is submitted to DigiCon until you press send there, and nothing you type here is stored or transmitted in the meantime.',
} as const;

export const STILL_STUCK = {
  banner: 'cta' as BannerName,
  title: 'Still stuck?',
  titleAccent: 'Then it is our turn.',
  body: [
    'If you have read this far and the answer was not here, the failure is ours rather than yours — the page was supposed to catch it.',
    'Write to us with whatever you have, in whatever order it comes out. A screenshot, half a sentence, the thing you were trying to do when it went wrong. We would rather have a messy report than none.',
  ],
  reassurance: 'A person reads every message. Same day on weekdays.',
  cta: 'Message support',
  signoff: ['Every introduction is a possibility.', 'Ours to you included.'],
} as const;

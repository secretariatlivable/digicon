export type Language = 'en' | 'fil';

export type TranslationKey =
  | 'nav.dashboard'
  | 'nav.cards'
  | 'nav.contacts'
  | 'nav.analytics'
  | 'nav.settings'
  | 'nav.eco'
  | 'nav.logout'
  | 'nav.getStarted'
  | 'nav.login'
  | 'nav.signup'
  | 'landing.hero.title'
  | 'landing.hero.subtitle'
  | 'landing.hero.cta'
  | 'landing.hero.secondary'
  | 'landing.startups.title'
  | 'landing.startups.desc'
  | 'landing.smes.title'
  | 'landing.smes.desc'
  | 'landing.features.title'
  | 'landing.eco.title'
  | 'landing.eco.desc'
  | 'landing.crm.title'
  | 'landing.crm.desc'
  | 'landing.cards.title'
  | 'landing.cards.desc'
  | 'landing.analytics.title'
  | 'landing.analytics.desc'
  | 'landing.localized.title'
  | 'landing.localized.desc'
  | 'landing.pricing.title'
  | 'landing.pricing.starter'
  | 'landing.pricing.starterPrice'
  | 'landing.pricing.starterDesc'
  | 'landing.pricing.growth'
  | 'landing.pricing.growthPrice'
  | 'landing.pricing.growthDesc'
  | 'landing.pricing.enterprise'
  | 'landing.pricing.enterprisePrice'
  | 'landing.pricing.enterpriseDesc'
  | 'landing.pricing.cta'
  | 'auth.email'
  | 'auth.password'
  | 'auth.signIn'
  | 'auth.signUp'
  | 'auth.fullName'
  | 'auth.companyName'
  | 'auth.haveAccount'
  | 'auth.noAccount'
  | 'auth.signInTitle'
  | 'auth.signUpTitle'
  | 'auth.signingIn'
  | 'auth.signingUp'
  | 'dashboard.welcome'
  | 'dashboard.cardsShared'
  | 'dashboard.contactsCaptured'
  | 'dashboard.conversionRate'
  | 'dashboard.ecoImpact'
  | 'dashboard.paperSaved'
  | 'dashboard.treesSaved'
  | 'dashboard.carbonReduced'
  | 'dashboard.quickActions'
  | 'dashboard.createCard'
  | 'dashboard.viewContacts'
  | 'dashboard.shareCard'
  | 'dashboard.recentContacts'
  | 'dashboard.noContacts'
  | 'cards.title'
  | 'cards.create'
  | 'cards.edit'
  | 'cards.share'
  | 'cards.delete'
  | 'cards.yourCards'
  | 'cards.noCards'
  | 'cards.fullName'
  | 'cards.jobTitle'
  | 'cards.company'
  | 'cards.phone'
  | 'cards.email'
  | 'cards.website'
  | 'cards.address'
  | 'cards.bio'
  | 'cards.save'
  | 'cards.cancel'
  | 'cards.qrCode'
  | 'cards.downloadQR'
  | 'cards.shareLink'
  | 'cards.shareSMS'
  | 'cards.preview'
  | 'cards.active'
  | 'cards.inactive'
  | 'contacts.title'
  | 'contacts.add'
  | 'contacts.search'
  | 'contacts.export'
  | 'contacts.syncCRM'
  | 'contacts.name'
  | 'contacts.email'
  | 'contacts.phone'
  | 'contacts.company'
  | 'contacts.status'
  | 'contacts.consent'
  | 'contacts.source'
  | 'contacts.noContacts'
  | 'contacts.new'
  | 'contacts.followUp'
  | 'contacts.converted'
  | 'contacts.archived'
  | 'contacts.delete'
  | 'contacts.edit'
  | 'contacts.save'
  | 'contacts.cancel'
  | 'contacts.notes'
  | 'contacts.jobTitle'
  | 'analytics.title'
  | 'analytics.leadsOverTime'
  | 'analytics.conversionFunnel'
  | 'analytics.ecoImpact'
  | 'analytics.topSources'
  | 'analytics.networkingROI'
  | 'analytics.totalLeads'
  | 'analytics.converted'
  | 'analytics.pending'
  | 'analytics.paperSaved'
  | 'analytics.treesSaved'
  | 'analytics.carbonReduced'
  | 'settings.title'
  | 'settings.profile'
  | 'settings.preferences'
  | 'settings.team'
  | 'settings.billing'
  | 'settings.language'
  | 'settings.region'
  | 'settings.notifications'
  | 'settings.theme'
  | 'settings.save'
  | 'settings.saved'
  | 'settings.fullName'
  | 'settings.company'
  | 'settings.email'
  | 'settings.role'
  | 'settings.english'
  | 'settings.filipino'
  | 'settings.light'
  | 'settings.dark'
  | 'settings.teamMembers'
  | 'settings.invite'
  | 'settings.noTeam'
  | 'settings.plan'
  | 'settings.currentPlan'
  | 'settings.upgrade'
  | 'eco.title'
  | 'eco.badges'
  | 'eco.progress'
  | 'eco.level'
  | 'eco.nextLevel'
  | 'eco.noBadges'
  | 'eco.keepGoing'
  | 'common.loading'
  | 'common.error'
  | 'common.save'
  | 'common.cancel'
  | 'common.delete'
  | 'common.edit'
  | 'common.confirm'
  | 'common.yes'
  | 'common.no'
  | 'common.back'
  | 'common.next'
  | 'common.previous'
  | 'common.search'
  | 'common.all'
  | 'common.close';

const en: Record<TranslationKey, string> = {
  'nav.dashboard': 'Dashboard',
  'nav.cards': 'Business Cards',
  'nav.contacts': 'Contacts',
  'nav.analytics': 'Analytics',
  'nav.settings': 'Settings',
  'nav.eco': 'Eco Impact',
  'nav.logout': 'Sign Out',
  'nav.getStarted': 'Get Started',
  'nav.login': 'Sign In',
  'nav.signup': 'Sign Up',
  'landing.hero.title': 'Go Digital. Go Green. Grow Faster.',
  'landing.hero.subtitle': 'The all-in-one digital business card and CRM platform built for SMEs and startups.',
  'landing.hero.cta': 'Start Free Today',
  'landing.hero.secondary': 'See How It Works',
  'landing.startups.title': 'For Startups',
  'landing.startups.desc': 'Save money, reduce waste, and project eco-friendly branding with digital cards that impress.',
  'landing.smes.title': 'For Scaling SMEs',
  'landing.smes.desc': 'Automate CRM workflows, gain analytics insights, and streamline lead management at scale.',
  'landing.features.title': 'Everything You Need to Grow',
  'landing.eco.title': 'Eco-Friendly Cards',
  'landing.eco.desc': 'Replace paper cards with beautiful digital ones. Track your environmental impact in real-time.',
  'landing.crm.title': 'CRM Automation',
  'landing.crm.desc': 'Auto-sync contacts to CRM. Export to CSV. Capture leads with consent built-in.',
  'landing.cards.title': 'Smart Digital Cards',
  'landing.cards.desc': 'Share via QR code, NFC, SMS, or link. Store in Google and Apple Wallet.',
  'landing.analytics.title': 'Analytics Dashboard',
  'landing.analytics.desc': 'Track leads, conversion rates, and networking ROI with simple, actionable charts.',
  'landing.localized.title': 'Built for Resilient Entrepreneurs',
  'landing.localized.desc': 'Multi-language support, offline sharing for low-connectivity areas, and affordable micro-subscriptions.',
  'landing.pricing.title': 'Simple, Affordable Pricing',
  'landing.pricing.starter': 'Starter',
  'landing.pricing.starterPrice': '₱199',
  'landing.pricing.starterDesc': 'Perfect for solo entrepreneurs and small teams under 10 people.',
  'landing.pricing.growth': 'Growth',
  'landing.pricing.growthPrice': '₱499',
  'landing.pricing.growthDesc': 'For scaling SMEs that need CRM automation and advanced analytics.',
  'landing.pricing.enterprise': 'Enterprise',
  'landing.pricing.enterprisePrice': 'Custom',
  'landing.pricing.enterpriseDesc': 'Tailored solutions for large organizations with custom integrations.',
  'landing.pricing.cta': 'Choose Plan',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.signIn': 'Sign In',
  'auth.signUp': 'Create Account',
  'auth.fullName': 'Full Name',
  'auth.companyName': 'Company Name',
  'auth.haveAccount': 'Already have an account?',
  'auth.noAccount': "Don't have an account?",
  'auth.signInTitle': 'Welcome Back',
  'auth.signUpTitle': 'Create Your Account',
  'auth.signingIn': 'Signing in...',
  'auth.signingUp': 'Creating account...',
  'dashboard.welcome': 'Welcome back',
  'dashboard.cardsShared': 'Cards Shared',
  'dashboard.contactsCaptured': 'Contacts Captured',
  'dashboard.conversionRate': 'Conversion Rate',
  'dashboard.ecoImpact': 'Eco Impact',
  'dashboard.paperSaved': 'Paper Saved',
  'dashboard.treesSaved': 'Trees Saved',
  'dashboard.carbonReduced': 'Carbon Reduced',
  'dashboard.quickActions': 'Quick Actions',
  'dashboard.createCard': 'Create Card',
  'dashboard.viewContacts': 'View Contacts',
  'dashboard.shareCard': 'Share Card',
  'dashboard.recentContacts': 'Recent Contacts',
  'dashboard.noContacts': 'No contacts yet. Share your card to start capturing leads!',
  'cards.title': 'Business Cards',
  'cards.create': 'Create New Card',
  'cards.edit': 'Edit',
  'cards.share': 'Share',
  'cards.delete': 'Delete',
  'cards.yourCards': 'Your Cards',
  'cards.noCards': "You don't have any cards yet. Create one to start networking!",
  'cards.fullName': 'Full Name',
  'cards.jobTitle': 'Job Title',
  'cards.company': 'Company',
  'cards.phone': 'Phone',
  'cards.email': 'Email',
  'cards.website': 'Website',
  'cards.address': 'Address',
  'cards.bio': 'Bio',
  'cards.save': 'Save Card',
  'cards.cancel': 'Cancel',
  'cards.qrCode': 'QR Code',
  'cards.downloadQR': 'Download QR',
  'cards.shareLink': 'Copy Share Link',
  'cards.shareSMS': 'Share via SMS',
  'cards.preview': 'Card Preview',
  'cards.active': 'Active',
  'cards.inactive': 'Inactive',
  'contacts.title': 'Contacts',
  'contacts.add': 'Add Contact',
  'contacts.search': 'Search contacts...',
  'contacts.export': 'Export CSV',
  'contacts.syncCRM': 'Sync to CRM',
  'contacts.name': 'Name',
  'contacts.email': 'Email',
  'contacts.phone': 'Phone',
  'contacts.company': 'Company',
  'contacts.status': 'Status',
  'contacts.consent': 'Consent',
  'contacts.source': 'Source',
  'contacts.noContacts': 'No contacts found.',
  'contacts.new': 'New',
  'contacts.followUp': 'Follow Up',
  'contacts.converted': 'Converted',
  'contacts.archived': 'Archived',
  'contacts.delete': 'Delete',
  'contacts.edit': 'Edit',
  'contacts.save': 'Save',
  'contacts.cancel': 'Cancel',
  'contacts.notes': 'Notes',
  'contacts.jobTitle': 'Job Title',
  'analytics.title': 'Analytics',
  'analytics.leadsOverTime': 'Leads Over Time',
  'analytics.conversionFunnel': 'Conversion Funnel',
  'analytics.ecoImpact': 'Eco Impact',
  'analytics.topSources': 'Top Lead Sources',
  'analytics.networkingROI': 'Networking ROI',
  'analytics.totalLeads': 'Total Leads',
  'analytics.converted': 'Converted',
  'analytics.pending': 'Pending',
  'analytics.paperSaved': 'Paper Saved',
  'analytics.treesSaved': 'Trees Saved',
  'analytics.carbonReduced': 'Carbon Reduced',
  'settings.title': 'Settings',
  'settings.profile': 'Profile',
  'settings.preferences': 'Preferences',
  'settings.team': 'Team',
  'settings.billing': 'Billing',
  'settings.language': 'Language',
  'settings.region': 'Region',
  'settings.notifications': 'Notifications',
  'settings.theme': 'Theme',
  'settings.save': 'Save Changes',
  'settings.saved': 'Saved!',
  'settings.fullName': 'Full Name',
  'settings.company': 'Company Name',
  'settings.email': 'Email',
  'settings.role': 'Role',
  'settings.english': 'English',
  'settings.filipino': 'Filipino',
  'settings.light': 'Light',
  'settings.dark': 'Dark',
  'settings.teamMembers': 'Team Members',
  'settings.invite': 'Invite Member',
  'settings.noTeam': 'No team members yet.',
  'settings.plan': 'Subscription Plan',
  'settings.currentPlan': 'Current Plan',
  'settings.upgrade': 'Upgrade',
  'eco.title': 'Eco Impact',
  'eco.badges': 'Your Badges',
  'eco.progress': 'Progress to Next Level',
  'eco.level': 'Current Level',
  'eco.nextLevel': 'Next Level',
  'eco.noBadges': 'No badges earned yet. Share your card to start earning!',
  'eco.keepGoing': 'Keep going to earn more badges!',
  'common.loading': 'Loading...',
  'common.error': 'Something went wrong',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.confirm': 'Confirm',
  'common.yes': 'Yes',
  'common.no': 'No',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.previous': 'Previous',
  'common.search': 'Search',
  'common.all': 'All',
  'common.close': 'Close',
};

const fil: Record<TranslationKey, string> = {
  'nav.dashboard': 'Dashboard',
  'nav.cards': 'Digital na Card',
  'nav.contacts': 'Mga Contact',
  'nav.analytics': 'Analytics',
  'nav.settings': 'Mga Setting',
  'nav.eco': 'Eco Impact',
  'nav.logout': 'Mag Sign Out',
  'nav.getStarted': 'Magsimula',
  'nav.login': 'Mag Sign In',
  'nav.signup': 'Mag Sign Up',
  'landing.hero.title': 'Maging Digital. Maging Berde. Lumago nang Mas Mabilis.',
  'landing.hero.subtitle': 'Ang all-in-one digital business card at CRM platform para sa mga SME at startup.',
  'landing.hero.cta': 'Magsimula Ngayon',
  'landing.hero.secondary': 'Tingnan Paano Gumagana',
  'landing.startups.title': 'Para sa mga Startup',
  'landing.startups.desc': 'Makatipid, bawasan ang basura, at ipakita ang eco-friendly branding gamit ang mga digital card.',
  'landing.smes.title': 'Para sa Lumalagong SME',
  'landing.smes.desc': 'I-automate ang CRM workflows, makakuha ng analytics insights, at i-streamline ang lead management.',
  'landing.features.title': 'Lahat ng Kailangan Mo',
  'landing.eco.title': 'Eco-Friendly na Card',
  'landing.eco.desc': 'Palitan ang papel na card ng magagandang digital card. Subaybayan ang environmental impact real-time.',
  'landing.crm.title': 'CRM Automation',
  'landing.crm.desc': 'Auto-sync contacts sa HubSpot. I-export sa CSV. Makakuha ng leads na may consent.',
  'landing.cards.title': 'Smart Digital na Card',
  'landing.cards.desc': 'I-share via QR code, NFC, SMS, o link. I-store sa Google at Apple Wallet.',
  'landing.analytics.title': 'Analytics Dashboard',
  'landing.analytics.desc': 'Subaybayan ang leads, conversion rates, at networking ROI na may simpleng charts.',
  'landing.localized.title': 'Ginawa para sa iyo',
  'landing.localized.desc': 'Multi-language support, offline sharing para sa low-connectivity areas, at abot-kayang subscription.',
  'landing.pricing.title': 'Simpleng Presyo',
  'landing.pricing.starter': 'Starter',
  'landing.pricing.starterPrice': '₱199',
  'landing.pricing.starterDesc': 'Para sa solo entrepreneurs at maliliit na team na kulang sa 10 tao.',
  'landing.pricing.growth': 'Growth',
  'landing.pricing.growthPrice': '₱499',
  'landing.pricing.growthDesc': 'Para sa lumalagong SME na nangangailangan ng CRM automation at advanced analytics.',
  'landing.pricing.enterprise': 'Enterprise',
  'landing.pricing.enterprisePrice': 'Custom',
  'landing.pricing.enterpriseDesc': 'Tailored solutions para sa malalaking organisasyon na may custom integrations.',
  'landing.pricing.cta': 'Piliin ang Plan',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.signIn': 'Mag Sign In',
  'auth.signUp': 'Gumawa ng Account',
  'auth.fullName': 'Buong Pangalan',
  'auth.companyName': 'Pangalan ng Kumpanya',
  'auth.haveAccount': 'May account ka na ba?',
  'auth.noAccount': 'Wala ka pang account?',
  'auth.signInTitle': 'Maligayang Pagbabalik',
  'auth.signUpTitle': 'Gumawa ng Account',
  'auth.signingIn': 'Nagsi-sign in...',
  'auth.signingUp': 'Gumagawa ng account...',
  'dashboard.welcome': 'Maligayang pagbabalik',
  'dashboard.cardsShared': 'Naibahaging Card',
  'dashboard.contactsCaptured': 'Nakuha na Contact',
  'dashboard.conversionRate': 'Conversion Rate',
  'dashboard.ecoImpact': 'Eco Impact',
  'dashboard.paperSaved': 'Naitipid na Papel',
  'dashboard.treesSaved': 'Nailigtas na Puno',
  'dashboard.carbonReduced': 'Nabawasan na Carbon',
  'dashboard.quickActions': 'Mabilis na Aksyon',
  'dashboard.createCard': 'Gumawa ng Card',
  'dashboard.viewContacts': 'Tingnan ang Contact',
  'dashboard.shareCard': 'Ibahagi ang Card',
  'dashboard.recentContacts': 'Mga Kamakailang Contact',
  'dashboard.noContacts': 'Wala pang contact. Ibahagi ang card para makakuha ng leads!',
  'cards.title': 'Mga Digital na Card',
  'cards.create': 'Gumawa ng Bagong Card',
  'cards.edit': 'I-edit',
  'cards.share': 'Ibahagi',
  'cards.delete': 'Burahin',
  'cards.yourCards': 'Iyong mga Card',
  'cards.noCards': 'Wala ka pang card. Gumawa para magsimulang mag-network!',
  'cards.fullName': 'Buong Pangalan',
  'cards.jobTitle': 'Posisyon',
  'cards.company': 'Kumpanya',
  'cards.phone': 'Telepono',
  'cards.email': 'Email',
  'cards.website': 'Website',
  'cards.address': 'Address',
  'cards.bio': 'Tungkol sa Iyo',
  'cards.save': 'I-save ang Card',
  'cards.cancel': 'Kanselahin',
  'cards.qrCode': 'QR Code',
  'cards.downloadQR': 'I-download ang QR',
  'cards.shareLink': 'Kopyahin ang Link',
  'cards.shareSMS': 'I-share via SMS',
  'cards.preview': 'Preview ng Card',
  'cards.active': 'Aktibo',
  'cards.inactive': 'Hindi Aktibo',
  'contacts.title': 'Mga Contact',
  'contacts.add': 'Magdagdag ng Contact',
  'contacts.search': 'Maghanap ng contact...',
  'contacts.export': 'I-export CSV',
  'contacts.syncCRM': 'I-sync sa CRM',
  'contacts.name': 'Pangalan',
  'contacts.email': 'Email',
  'contacts.phone': 'Telepono',
  'contacts.company': 'Kumpanya',
  'contacts.status': 'Status',
  'contacts.consent': 'Pahintulot',
  'contacts.source': 'Source',
  'contacts.noContacts': 'Walang nahanap na contact.',
  'contacts.new': 'Bago',
  'contacts.followUp': 'I-follow Up',
  'contacts.converted': 'Na-convert',
  'contacts.archived': 'Naka-archive',
  'contacts.delete': 'Burahin',
  'contacts.edit': 'I-edit',
  'contacts.save': 'I-save',
  'contacts.cancel': 'Kanselahin',
  'contacts.notes': 'Mga Tala',
  'contacts.jobTitle': 'Posisyon',
  'analytics.title': 'Analytics',
  'analytics.leadsOverTime': 'Mga Lead Sa Paglipas ng Panahon',
  'analytics.conversionFunnel': 'Conversion Funnel',
  'analytics.ecoImpact': 'Eco Impact',
  'analytics.topSources': 'Pangunahing Lead Sources',
  'analytics.networkingROI': 'Networking ROI',
  'analytics.totalLeads': 'Kabuuang Lead',
  'analytics.converted': 'Na-convert',
  'analytics.pending': 'Nakabinbin',
  'analytics.paperSaved': 'Naitipid na Papel',
  'analytics.treesSaved': 'Nailigtas na Puno',
  'analytics.carbonReduced': 'Nabawasan na Carbon',
  'settings.title': 'Mga Setting',
  'settings.profile': 'Profile',
  'settings.preferences': 'Kagustuhan',
  'settings.team': 'Team',
  'settings.billing': 'Billing',
  'settings.language': 'Wika',
  'settings.region': 'Rehiyon',
  'settings.notifications': 'Mga Notipikasyon',
  'settings.theme': 'Tema',
  'settings.save': 'I-save ang Pagbabago',
  'settings.saved': 'Nai-save!',
  'settings.fullName': 'Buong Pangalan',
  'settings.company': 'Pangalan ng Kumpanya',
  'settings.email': 'Email',
  'settings.role': 'Posisyon',
  'settings.english': 'English',
  'settings.filipino': 'Filipino',
  'settings.light': 'Liwanag',
  'settings.dark': 'Madilim',
  'settings.teamMembers': 'Mga Miyembro ng Team',
  'settings.invite': 'Mag-imbita ng Miyembro',
  'settings.noTeam': 'Wala pang miyembro ng team.',
  'settings.plan': 'Subscription Plan',
  'settings.currentPlan': 'Kasalukuyang Plan',
  'settings.upgrade': 'Mag-upgrade',
  'eco.title': 'Eco Impact',
  'eco.badges': 'Iyong mga Badge',
  'eco.progress': 'Progress sa Susunod na Level',
  'eco.level': 'Kasalukuyang Level',
  'eco.nextLevel': 'Susunod na Level',
  'eco.noBadges': 'Wala pang badge. Ibahagi ang card para makakuha!',
  'eco.keepGoing': 'Magpatuloy para makakuha ng higit pang badge!',
  'common.loading': 'Naglo-load...',
  'common.error': 'May nangyaring mali',
  'common.save': 'I-save',
  'common.cancel': 'Kanselahin',
  'common.delete': 'Burahin',
  'common.edit': 'I-edit',
  'common.confirm': 'Kumpirmahin',
  'common.yes': 'Oo',
  'common.no': 'Hindi',
  'common.back': 'Bumalik',
  'common.next': 'Susunod',
  'common.previous': 'Nakaraan',
  'common.search': 'Maghanap',
  'common.all': 'Lahat',
  'common.close': 'Isara',
};

const translations: Record<Language, Record<TranslationKey, string>> = { en, fil };

export function translate(key: TranslationKey, lang: Language = 'en'): string {
  return translations[lang][key] || translations.en[key] || key;
}

export const regions = [
  { value: 'metro-manila', label: 'Metro Manila' },
  { value: 'cebu', label: 'Cebu' },
  { value: 'davao', label: 'Davao' },
  { value: 'iloilo', label: 'Iloilo' },
  { value: 'baguio', label: 'Baguio' },
  { value: 'cagayan-de-oro', label: 'Cagayan de Oro' },
  { value: 'pampanga', label: 'Pampanga' },
  { value: 'laguna', label: 'Laguna' },
  { value: 'cavite', label: 'Cavite' },
  { value: 'other', label: 'Other' },
];

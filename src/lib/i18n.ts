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
  | 'landing.kicker'
  | 'landing.hero.headlineA'
  | 'landing.hero.headlineHighlight'
  | 'landing.hero.headlineB'
  | 'landing.hero.sub'
  | 'landing.hero.ctaPrimary'
  | 'landing.hero.ctaSecondary'
  | 'landing.how.title'
  | 'landing.how.sub'
  | 'landing.how.s1t'
  | 'landing.how.s1d'
  | 'landing.how.s2t'
  | 'landing.how.s2d'
  | 'landing.how.s3t'
  | 'landing.how.s3d'
  | 'landing.startups.title'
  | 'landing.startups.desc'
  | 'landing.startups.b1'
  | 'landing.startups.b2'
  | 'landing.startups.b3'
  | 'landing.startups.b4'
  | 'landing.smes.title'
  | 'landing.smes.desc'
  | 'landing.smes.b1'
  | 'landing.smes.b2'
  | 'landing.smes.b3'
  | 'landing.smes.b4'
  | 'landing.features.title'
  | 'landing.features.sub'
  | 'landing.identity.title'
  | 'landing.identity.desc'
  | 'landing.capture.title'
  | 'landing.capture.desc'
  | 'landing.analytics.title'
  | 'landing.analytics.desc'
  | 'landing.ownership.title'
  | 'landing.ownership.desc'
  | 'landing.localized.title'
  | 'landing.localized.desc'
  | 'landing.cards.title'
  | 'landing.cards.desc'
  | 'landing.eco.sectionTitle'
  | 'landing.eco.sectionDesc'
  | 'landing.eco.statPaper'
  | 'landing.eco.statCo2'
  | 'landing.eco.statTree'
  | 'landing.eco.title'
  | 'landing.eco.desc'
  | 'landing.crm.title'
  | 'landing.crm.desc'
  | 'landing.pricing.title'
  | 'landing.pricing.sub'
  | 'landing.pricing.popular'
  | 'landing.pricing.starter'
  | 'landing.pricing.starterPrice'
  | 'landing.pricing.starterDesc'
  | 'landing.pricing.growth'
  | 'landing.pricing.growthPrice'
  | 'landing.pricing.growthDesc'
  | 'landing.pricing.enterprise'
  | 'landing.pricing.enterprisePrice'
  | 'landing.pricing.enterpriseDesc'
  | 'landing.pricing.enterpriseCta'
  | 'landing.pricing.cta'
  | 'landing.cta.title'
  | 'landing.cta.desc'
  | 'landing.cta.button'
  | 'landing.footer.tagline'
  | 'landing.footer.signin'
  | 'landing.footer.features'
  | 'landing.footer.pricing'
  | 'landing.hero.title'
  | 'landing.hero.subtitle'
  | 'landing.hero.cta'
  | 'landing.hero.secondary'
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
  'nav.cards': 'Digital Connections',
  'nav.contacts': 'Connections',
  'nav.analytics': 'Network Insights',
  'nav.settings': 'Settings',
  'nav.eco': 'Eco Impact',
  'nav.logout': 'Sign Out',
  'nav.getStarted': 'Get Started',
  'nav.login': 'Sign In',
  'nav.signup': 'Create Account',

  'landing.kicker': 'Digital Connections for people who build relationships',
  'landing.hero.headlineA': 'Meet someone.',
  'landing.hero.headlineHighlight': 'Make it count.',
  'landing.hero.headlineB': 'Build the relationship.',
  'landing.hero.sub': 'DigiCon — Digital Connections turns your professional identity into a living network, so every introduction can become a connection you remember, follow up on, and grow.',
  'landing.hero.ctaPrimary': 'Create Your DigiCon',
  'landing.hero.ctaSecondary': 'See How It Works',
  'landing.how.title': 'From introduction to relationship',
  'landing.how.sub': 'A simple flow for professionals, founders, sales teams, and people who meet opportunity every day.',
  'landing.how.s1t': 'Share your identity',
  'landing.how.s1d': 'One professional identity you can share by QR code or link.',
  'landing.how.s2t': 'Capture the connection',
  'landing.how.s2d': 'Turn a meeting into a structured connection instead of another lost contact.',
  'landing.how.s3t': 'Follow up with context',
  'landing.how.s3d': 'Keep the reason you met, the next step, and the relationship in view.',

  'landing.startups.title': 'For Startups & Founders',
  'landing.startups.desc': 'Look credible from the first introduction—and let your team build a network that compounds as the company grows.',
  'landing.startups.b1': 'Create two professional cards free',
  'landing.startups.b2': 'Share instantly at pitches, events, and meetings',
  'landing.startups.b3': 'Keep important connections organized from day one',
  'landing.startups.b4': 'Upgrade when DigiCon becomes part of your workflow',

  'landing.smes.title': 'For Growth-Oriented Professionals & SMEs',
  'landing.smes.desc': 'Stop collecting contacts. Start building relationships you can remember, prioritize, and act on.',
  'landing.smes.b1': 'Capture the people you meet',
  'landing.smes.b2': 'Keep notes, context, and relationship status together',
  'landing.smes.b3': 'Make follow-up visible instead of relying on memory',
  'landing.smes.b4': 'Measure networking activity and relationship growth',

  'landing.features.title': 'Everything you need to turn introductions into relationships',
  'landing.features.sub': 'DigiCon starts with digital identity—but its real value begins after the card is shared.',
  'landing.identity.title': 'Professional Digital Identity',
  'landing.identity.desc': 'Create a polished identity people can trust and remember.',
  'landing.capture.title': 'Connection Capture',
  'landing.capture.desc': 'Turn a shared card into a connection instead of letting the moment disappear.',
  'landing.analytics.title': 'Network Insights',
  'landing.analytics.desc': 'Understand who you meet, where connections come from, and whether your networking is creating momentum.',
  'landing.ownership.title': 'Your Network, Your Data',
  'landing.ownership.desc': 'Keep control of your professional identity and the relationship information you choose to capture.',
  'landing.localized.title': 'Built for Real-World Networking',
  'landing.localized.desc': 'Designed for professionals and SMEs in the Philippines and beyond, including practical sharing for varied connectivity.',
  'landing.cards.title': 'Digital Connections',
  'landing.cards.desc': 'A beautiful professional identity that starts the conversation and gives every connection somewhere to go.',
  'landing.eco.sectionTitle': 'A better connection can start with less paper',
  'landing.eco.sectionDesc': 'Replace disposable paper cards with a reusable digital identity while keeping your networking measurable.',
  'landing.eco.statPaper': 'paper avoided per exchange',
  'landing.eco.statCo2': 'illustrative CO₂ saving',
  'landing.eco.statTree': 'connections before the next milestone',
  'landing.eco.title': 'Eco Impact',
  'landing.eco.desc': 'Track the practical environmental value of moving professional introductions beyond paper.',
  'landing.crm.title': 'Relationship Workspace',
  'landing.crm.desc': 'Organize connections, context, and follow-up without turning DigiCon into a heavyweight enterprise CRM.',

  'landing.pricing.title': 'Start free. Upgrade when DigiCon becomes essential.',
  'landing.pricing.sub': 'Experience the value first. Pay when Digital Connections becomes part of how you work.',
  'landing.pricing.popular': 'Most Popular',
  'landing.pricing.starter': 'Starter',
  'landing.pricing.starterPrice': '₱199',
  'landing.pricing.starterDesc': 'For professionals who want a stronger digital identity and a simple way to stay connected.',
  'landing.pricing.growth': 'Growth',
  'landing.pricing.growthPrice': '₱499',
  'landing.pricing.growthDesc': 'For growing professionals and SMEs who want deeper networking visibility and relationship workflows.',
  'landing.pricing.enterprise': 'Enterprise',
  'landing.pricing.enterprisePrice': 'Custom',
  'landing.pricing.enterpriseDesc': 'For organizations that need team identities, centralized management, integrations, and branded experiences.',
  'landing.pricing.enterpriseCta': 'Talk to DigiCon',
  'landing.pricing.cta': 'Choose Plan',

  'landing.cta.title': 'Never lose a valuable connection again.',
  'landing.cta.desc': 'Create your Digital Connection identity, share it in seconds, and give every introduction a next step.',
  'landing.cta.button': 'Start Building Your Network',
  'landing.footer.tagline': 'Digital Connections that go somewhere.',
  'landing.footer.signin': 'Sign In',
  'landing.footer.features': 'Features',
  'landing.footer.pricing': 'Pricing',

  // Backward-compatible legacy landing keys still used elsewhere.
  'landing.hero.title': 'Meet someone. Make it count.',
  'landing.hero.subtitle': 'DigiCon — Digital Connections helps professionals turn introductions into relationships.',
  'landing.hero.cta': 'Start Free Today',
  'landing.hero.secondary': 'See How It Works',

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
  'dashboard.contactsCaptured': 'Connections Captured',
  'dashboard.conversionRate': 'Connection Rate',
  'dashboard.ecoImpact': 'Eco Impact',
  'dashboard.paperSaved': 'Paper Avoided',
  'dashboard.treesSaved': 'Trees Saved',
  'dashboard.carbonReduced': 'Carbon Reduced',
  'dashboard.quickActions': 'Quick Actions',
  'dashboard.createCard': 'Create Digital Identity',
  'dashboard.viewContacts': 'View Connections',
  'dashboard.shareCard': 'Share Your Identity',
  'dashboard.recentContacts': 'Recent Connections',
  'dashboard.noContacts': 'No connections yet. Share your DigiCon identity to start building your network.',

  'cards.title': 'Digital Connections',
  'cards.create': 'Create New Card',
  'cards.edit': 'Edit',
  'cards.share': 'Share',
  'cards.delete': 'Delete',
  'cards.yourCards': 'Your Digital Identities',
  'cards.noCards': "You don't have a DigiCon identity yet. Create one to start making connections.",
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
  'cards.preview': 'Identity Preview',
  'cards.active': 'Active',
  'cards.inactive': 'Inactive',

  'contacts.title': 'Connections',
  'contacts.add': 'Add Connection',
  'contacts.search': 'Search connections...',
  'contacts.export': 'Export',
  'contacts.syncCRM': 'Export to CRM',
  'contacts.name': 'Name',
  'contacts.email': 'Email',
  'contacts.phone': 'Phone',
  'contacts.company': 'Company',
  'contacts.status': 'Status',
  'contacts.consent': 'Consent',
  'contacts.source': 'Source',
  'contacts.noContacts': 'No connections found.',
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

  'analytics.title': 'Network Insights',
  'analytics.leadsOverTime': 'Connections Over Time',
  'analytics.conversionFunnel': 'Relationship Progress',
  'analytics.ecoImpact': 'Eco Impact',
  'analytics.topSources': 'Top Connection Sources',
  'analytics.networkingROI': 'Networking ROI',
  'analytics.totalLeads': 'Total Connections',
  'analytics.converted': 'Converted',
  'analytics.pending': 'Needs Follow-Up',
  'analytics.paperSaved': 'Paper Avoided',
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
  'eco.noBadges': 'No badges earned yet. Share your identity to start earning!',
  'eco.keepGoing': 'Keep going to build your network!',

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
  ...en,
  'nav.cards': 'Digital Connections',
  'nav.contacts': 'Mga Connection',
  'nav.analytics': 'Network Insights',
  'nav.settings': 'Mga Setting',
  'nav.logout': 'Mag Sign Out',
  'nav.getStarted': 'Magsimula',
  'nav.login': 'Mag Sign In',
  'nav.signup': 'Gumawa ng Account',

  'landing.kicker': 'Digital Connections para sa mga taong bumubuo ng relasyon',
  'landing.hero.headlineA': 'May nakilala ka.',
  'landing.hero.headlineHighlight': 'Gawin itong mahalaga.',
  'landing.hero.headlineB': 'Buuin ang relasyon.',
  'landing.hero.sub': 'Ang DigiCon — Digital Connections ay ginagawang living network ang iyong professional identity para hindi mawala ang mahahalagang koneksyon.',
  'landing.hero.ctaPrimary': 'Gumawa ng DigiCon',
  'landing.hero.ctaSecondary': 'Tingnan Kung Paano',
  'landing.how.title': 'Mula pagpapakilala tungo sa relasyon',
  'landing.how.sub': 'Simpleng daloy para sa professionals, founders, sales teams, at mga taong araw-araw na nakikipag-network.',
  'landing.how.s1t': 'I-share ang iyong identity',
  'landing.how.s1d': 'Isang professional identity na madaling i-share gamit ang QR code o link.',
  'landing.how.s2t': 'I-capture ang connection',
  'landing.how.s2d': 'Gawing organisadong connection ang isang pagkikita sa halip na isa na namang contact na mawawala.',
  'landing.how.s3t': 'Mag-follow up nang may context',
  'landing.how.s3d': 'Itala kung bakit kayo nagkita, ano ang susunod na hakbang, at paano uunlad ang relasyon.',

  'landing.startups.title': 'Para sa Startups at Founders',
  'landing.startups.desc': 'Magmukhang credible sa unang pagkikita at bumuo ng network na lalago kasabay ng iyong kumpanya.',
  'landing.startups.b1': 'Dalawang professional cards nang libre',
  'landing.startups.b2': 'Instant sharing sa pitch, event, at meeting',
  'landing.startups.b3': 'Ayusin ang mahahalagang connection mula pa sa simula',
  'landing.startups.b4': 'Mag-upgrade kapag bahagi na ng workflow ang DigiCon',

  'landing.smes.title': 'Para sa Growth-Oriented Professionals at SME',
  'landing.smes.desc': 'Huwag lang mangolekta ng contacts. Bumuo ng relationships na maaari mong tandaan, unahin, at aksyunan.',
  'landing.smes.b1': 'I-capture ang mga taong nakikilala mo',
  'landing.smes.b2': 'Pagsamahin ang notes, context, at status ng relasyon',
  'landing.smes.b3': 'Gawing visible ang follow-up sa halip na umasa sa memorya',
  'landing.smes.b4': 'Sukatin ang networking activity at paglago ng relationships',

  'landing.features.title': 'Lahat ng kailangan para gawing relasyon ang introductions',
  'landing.features.sub': 'Nagsisimula ang DigiCon sa digital identity—pero ang tunay na halaga ay pagkatapos ma-share ang card.',
  'landing.identity.title': 'Professional Digital Identity',
  'landing.identity.desc': 'Gumawa ng polished identity na madaling pagkatiwalaan at tandaan.',
  'landing.capture.title': 'Connection Capture',
  'landing.capture.desc': 'Gawing connection ang isang shared card sa halip na hayaang mawala ang pagkakataon.',
  'landing.analytics.title': 'Network Insights',
  'landing.analytics.desc': 'Alamin kung sino ang nakikilala mo, saan nanggagaling ang connections, at kung may momentum ang networking mo.',
  'landing.ownership.title': 'Iyong Network, Iyong Data',
  'landing.ownership.desc': 'Ikaw ang may kontrol sa professional identity at relationship information na pinipili mong i-capture.',
  'landing.localized.title': 'Para sa Tunay na Networking',
  'landing.localized.desc': 'Dinisenyo para sa professionals at SME sa Pilipinas at higit pa, kabilang ang practical sharing sa iba’t ibang connectivity.',
  'landing.cards.title': 'Digital Connections',
  'landing.cards.desc': 'Isang magandang professional identity na nagsisimula ng conversation at nagbibigay ng direksyon sa bawat connection.',
  'landing.eco.sectionTitle': 'Mas magandang connection, mas kaunting papel',
  'landing.eco.sectionDesc': 'Palitan ang disposable paper cards ng reusable digital identity habang nasusukat ang networking activity.',
  'landing.eco.statPaper': 'papel na naiiwasan',
  'landing.eco.statCo2': 'illustrative CO₂ saving',
  'landing.eco.statTree': 'connections bago ang susunod na milestone',
  'landing.eco.title': 'Eco Impact',
  'landing.eco.desc': 'Subaybayan ang environmental value ng paglipat mula paper introductions tungo sa digital identity.',
  'landing.crm.title': 'Relationship Workspace',
  'landing.crm.desc': 'Ayusin ang connections, context, at follow-up nang hindi ginagawang heavyweight enterprise CRM ang DigiCon.',

  'landing.pricing.title': 'Magsimula nang libre. Mag-upgrade kapag mahalaga na ang DigiCon.',
  'landing.pricing.sub': 'Damhin muna ang value. Magbayad kapag naging bahagi na ng paraan mo ng pagtatrabaho ang Digital Connections.',
  'landing.pricing.popular': 'Pinaka-Patok',
  'landing.pricing.starter': 'Starter',
  'landing.pricing.starterPrice': '₱199',
  'landing.pricing.starterDesc': 'Para sa professionals na gustong magkaroon ng mas mahusay na digital identity at simpleng paraan para manatiling connected.',
  'landing.pricing.growth': 'Growth',
  'landing.pricing.growthPrice': '₱499',
  'landing.pricing.growthDesc': 'Para sa lumalaking professionals at SME na nangangailangan ng mas malalim na networking visibility at relationship workflows.',
  'landing.pricing.enterprise': 'Enterprise',
  'landing.pricing.enterprisePrice': 'Custom',
  'landing.pricing.enterpriseDesc': 'Para sa organizations na nangangailangan ng team identities, centralized management, integrations, at branded experiences.',
  'landing.pricing.enterpriseCta': 'Makipag-usap sa DigiCon',
  'landing.pricing.cta': 'Piliin ang Plan',
  'landing.cta.title': 'Huwag nang mawalan ng mahalagang connection.',
  'landing.cta.desc': 'Gumawa ng Digital Connection identity, i-share ito sa ilang segundo, at bigyan ng susunod na hakbang ang bawat introduction.',
  'landing.cta.button': 'Simulan ang Iyong Network',
  'landing.footer.tagline': 'Digital Connections na may patutunguhan.',
  'landing.footer.signin': 'Mag Sign In',
  'landing.footer.features': 'Features',
  'landing.footer.pricing': 'Pricing',

  'landing.hero.title': 'May nakilala ka. Gawin itong mahalaga.',
  'landing.hero.subtitle': 'Ang DigiCon — Digital Connections ay tumutulong gawing relationships ang introductions.',
  'landing.hero.cta': 'Magsimula Ngayon',
  'landing.hero.secondary': 'Tingnan Kung Paano',

  'dashboard.welcome': 'Maligayang pagbabalik',
  'dashboard.cardsShared': 'Naibahaging Card',
  'dashboard.contactsCaptured': 'Nakuha na Connection',
  'dashboard.conversionRate': 'Connection Rate',
  'dashboard.ecoImpact': 'Eco Impact',
  'dashboard.paperSaved': 'Naiwasang Papel',
  'dashboard.treesSaved': 'Nailigtas na Puno',
  'dashboard.carbonReduced': 'Nabawasan na Carbon',
  'dashboard.quickActions': 'Mabilis na Aksyon',
  'dashboard.createCard': 'Gumawa ng Digital Identity',
  'dashboard.viewContacts': 'Tingnan ang Connections',
  'dashboard.shareCard': 'I-share ang Identity',
  'dashboard.recentContacts': 'Mga Kamakailang Connection',
  'dashboard.noContacts': 'Wala pang connection. I-share ang iyong DigiCon identity para simulan ang network.',

  'cards.title': 'Digital Connections',
  'cards.create': 'Gumawa ng Bagong Card',
  'cards.edit': 'I-edit',
  'cards.share': 'I-share',
  'cards.delete': 'Burahin',
  'cards.yourCards': 'Iyong Digital Identities',
  'cards.noCards': 'Wala ka pang DigiCon identity. Gumawa para magsimulang makipag-connect.',
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
  'cards.preview': 'Preview ng Identity',
  'cards.active': 'Aktibo',
  'cards.inactive': 'Hindi Aktibo',

  'contacts.title': 'Mga Connection',
  'contacts.add': 'Magdagdag ng Connection',
  'contacts.search': 'Maghanap ng connection...',
  'contacts.export': 'I-export',
  'contacts.syncCRM': 'I-export sa CRM',
  'contacts.name': 'Pangalan',
  'contacts.email': 'Email',
  'contacts.phone': 'Telepono',
  'contacts.company': 'Kumpanya',
  'contacts.status': 'Status',
  'contacts.consent': 'Pahintulot',
  'contacts.source': 'Source',
  'contacts.noContacts': 'Walang nahanap na connection.',
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

  'analytics.title': 'Network Insights',
  'analytics.leadsOverTime': 'Connections sa Paglipas ng Panahon',
  'analytics.conversionFunnel': 'Progress ng Relationship',
  'analytics.ecoImpact': 'Eco Impact',
  'analytics.topSources': 'Pangunahing Connection Sources',
  'analytics.networkingROI': 'Networking ROI',
  'analytics.totalLeads': 'Kabuuang Connections',
  'analytics.converted': 'Na-convert',
  'analytics.pending': 'Kailangang I-follow Up',
  'analytics.paperSaved': 'Naiwasang Papel',
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
  'eco.noBadges': 'Wala pang badge. I-share ang identity para makakuha!',
  'eco.keepGoing': 'Magpatuloy para lumago ang iyong network!',

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

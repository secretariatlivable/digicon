// Import routing components used by the policy navigation.
import { Link, useLocation } from "react-router-dom";
// Import the shared public layout so policy pages use the same DigiCon shell.
import { PublicLayout } from "@/components/layout/Layouts";
// Import the existing section-heading component.
import { SectionHeading } from "@/components/kit";
// Import the shared button style helper.
import { buttonVariants } from "@/components/ui/button";

// Define a structured policy section.
type PolicyBlock = {
  heading: string;
  body: string[];
};

// Define the complete content model for each informational page.
type PolicyContent = {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  blocks: PolicyBlock[];
};

// Define the current publication date for the policy set.
const POLICY_DATE = "September 3, 2026";

// Define the authoritative DigiCon policy content.
const CONTENT: Record<string, PolicyContent> = {
  "/about": {
    eyebrow: "About",
    title: "We built the part that comes after the handshake",
    intro:
      "DigiCon exists because introductions are easy and remembering is hard. Most tools stop at the exchange; the value is in everything that follows.",
    updated: POLICY_DATE,
    blocks: [
      {
        heading: "Our position",
        body: [
          "DigiCon sits between a digital business card and a full CRM: much more useful than a static card, far simpler than enterprise sales software.",
          "The card gets someone into DigiCon. The accumulated relationship memory is why they stay.",
        ],
      },
      {
        heading: "Who we build for",
        body: [
          "Founders, SME owners, consultants, freelancers, sales and business-development professionals, recruiters, agency owners and community leaders — anyone whose relationships carry real economic or career value.",
        ],
      },
    ],
  },

  "/faq": {
    eyebrow: "FAQ",
    title: "Questions we hear most",
    intro:
      "Short answers about how DigiCon works, what is available, and how information is handled.",
    updated: POLICY_DATE,
    blocks: [
      {
        heading: "Is DigiCon just a digital business card?",
        body: [
          "No. The card is the entry point. The product is relationship capture, organisation, follow-up and measurable networking value.",
        ],
      },
      {
        heading: "What can I do on the free plan?",
        body: [
          "One published card with QR and link sharing, contact capture from your public card, relationship records, interaction history and follow-ups.",
        ],
      },
      {
        heading: "What does Pro add?",
        body: [
          "Pro features may include additional cards, CRM capabilities, networking analytics, card and vCard export, wallet identity and personal landing experiences.",
        ],
      },
      {
        heading: "Can people see my private notes?",
        body: [
          "No public-card interface is intended to expose private relationship notes, opportunity information, follow-ups or private interaction history.",
        ],
      },
      {
        heading: "Does the person I meet need an account?",
        body: [
          "No. A visitor can interact with a published card without creating a DigiCon account, subject to the features enabled on that card.",
        ],
      },
    ],
  },

  "/use-cases": {
    eyebrow: "Customers & use cases",
    title: "Where DigiCon earns its place",
    intro:
      "The same loop — share, capture, remember, follow up — applied to very different rooms.",
    updated: POLICY_DATE,
    blocks: [
      {
        heading: "Conferences and trade shows",
        body: [
          "Scan-to-connect at the booth, capture the context of each conversation, then leave with a list of next actions instead of a stack of cards.",
        ],
      },
      {
        heading: "Sales and business development",
        body: [
          "Track interest, opportunity value and relationship health per person, and move contacts through a lightweight relationship workflow.",
        ],
      },
      {
        heading: "Recruiting and job fairs",
        body: [
          "Capture candidates with role, event and shared purpose, then follow up before the strongest opportunities disappear.",
        ],
      },
      {
        heading: "Consultants, freelancers and agencies",
        body: [
          "One identity to share, one place to remember what each client asked for, and one list telling you who to follow up with.",
        ],
      },
    ],
  },

  "/resources": {
    eyebrow: "Resources",
    title: "Get more out of your network",
    intro:
      "Practical material on turning introductions into relationships you can manage.",
    updated: POLICY_DATE,
    blocks: [
      {
        heading: "The five-minute follow-up habit",
        body: [
          "At the end of every event day, capture three things per person: where you met, what they need, and the single next action.",
        ],
      },
      {
        heading: "Relationship health signals",
        body: [
          "A relationship going quiet is easier to address when recent interactions, open actions and shared purpose remain visible.",
        ],
      },
      {
        heading: "Sharing checklist",
        body: [
          "Use QR, a direct link, vCard, NFC-compatible sharing or wallet identity according to the context and capabilities of the receiving device.",
        ],
      },
    ],
  },

  "/support": {
    eyebrow: "Support",
    title: "We will help you get set up",
    intro:
      "Most questions are about sharing, plan features, account access, accessibility or privacy.",
    updated: POLICY_DATE,
    blocks: [
      {
        heading: "Get in touch",
        body: [
          "Email support@digicon.app and include the minimum information needed to identify your request. Do not send passwords, authentication codes, payment-card numbers or other unnecessary sensitive information.",
        ],
      },
      {
        heading: "Accessibility support",
        body: [
          "If an accessibility barrier prevents you from completing a task, tell us the page, device or assistive technology involved when known, and what happened. Accessibility reports are treated as product issues.",
        ],
      },
      {
        heading: "Privacy support",
        body: [
          "For requests concerning personal information, use the privacy contact described in the Privacy Policy. We may need to verify a request before disclosing or changing account information.",
        ],
      },
    ],
  },

  "/terms": {
    eyebrow: "Legal",
    title: "Terms of Service",
    intro:
      "These Terms of Service govern access to and use of DigiCon. They are written in plain language while preserving the legal meaning of the agreement.",
    updated: POLICY_DATE,
    blocks: [
      {
        heading: "1. Agreement and eligibility",
        body: [
          "By creating an account, accessing a paid feature, publishing a DigiCon card or otherwise using the service, you agree to these Terms and the policies incorporated into them. If you use DigiCon for an organisation, you confirm that you have authority to accept these Terms on its behalf.",
          "You must provide information that is accurate enough to operate the account and must not use DigiCon where doing so would violate applicable law or another person's rights.",
        ],
      },
      {
        heading: "2. The DigiCon service",
        body: [
          "DigiCon provides digital identity, contact exchange, relationship-management, follow-up, analytics, sharing and related networking functionality. Features may differ by plan and may change as the service evolves.",
          "A published card is designed for information that you intentionally make available to people who receive or discover the card URL. Publishing information is your decision and responsibility.",
        ],
      },
      {
        heading: "3. Your content and responsibility",
        body: [
          "You retain rights in content you submit, subject to the rights needed for DigiCon to host, process, display and transmit that content to provide the service.",
          "You must have a lawful basis or other valid authority to submit personal information about another person. Do not upload information you are not entitled to collect, use or disclose.",
        ],
      },
      {
        heading: "4. Acceptable use",
        body: [
          "You must not use DigiCon to impersonate another person or organisation, distribute unlawful content, facilitate fraud, harass people, send unlawful or unsolicited bulk communications, bypass security controls, interfere with service availability, or attempt unauthorised access.",
          "You must not use the service to collect or expose sensitive personal information unless the collection and processing are lawful, necessary and appropriately protected.",
        ],
      },
      {
        heading: "5. Accounts and security",
        body: [
          "You are responsible for safeguarding your account credentials and for activity performed through your account, except where applicable law provides otherwise. Tell us promptly if you believe an account has been compromised.",
          "We may suspend or restrict access where reasonably necessary to protect users, the service, security, legal compliance or the rights of others.",
        ],
      },
      {
        heading: "6. Paid subscriptions",
        body: [
          "Paid subscriptions are subject to the plan, price and billing terms presented at checkout. Payment processing may be performed by a third-party payment provider, whose terms and privacy notices also apply to its processing.",
          "A paid feature becomes available only when the service can verify the relevant subscription state. Refunds, cancellations and renewal terms are governed by the offer and applicable consumer-protection law.",
        ],
      },
      {
        heading: "7. Third-party services",
        body: [
          "DigiCon may integrate hosting, authentication, payment, communications, analytics or other third-party services. Those providers may process information as necessary to provide their services and are subject to their own contractual and legal obligations.",
          "Third-party links or integrations are not controlled by DigiCon. Review the relevant third-party terms before using an external service.",
        ],
      },
      {
        heading: "8. Availability and changes",
        body: [
          "DigiCon is provided on an evolving basis. We may add, remove or modify functionality, subject to applicable law and contractual obligations. We aim to maintain reasonable availability but do not promise uninterrupted service.",
          "Scheduled maintenance, security events, third-party outages, network failures and circumstances outside reasonable control may affect availability.",
        ],
      },
      {
        heading: "9. Intellectual property",
        body: [
          "DigiCon software, branding, interfaces, designs and other service materials are protected by applicable intellectual-property laws. Except for rights expressly granted by these Terms, no ownership rights are transferred to you.",
        ],
      },
      {
        heading: "10. Disclaimers",
        body: [
          "To the extent permitted by applicable law, DigiCon is provided without guarantees that every feature will satisfy every particular business purpose. Networking outcomes, sales outcomes and relationship outcomes depend on how users employ the service.",
          "Nothing in these Terms excludes or limits a consumer right, liability or remedy that cannot lawfully be excluded or limited.",
        ],
      },
      {
        heading: "11. Limitation of liability",
        body: [
          "To the maximum extent permitted by applicable law, DigiCon will not be liable for indirect, incidental, special, consequential or punitive losses arising from use of the service. Any applicable mandatory statutory rights remain unaffected.",
        ],
      },
      {
        heading: "12. Termination",
        body: [
          "You may stop using DigiCon and request account deletion. We may suspend or terminate access for material breach, security risk, unlawful use, non-payment or other circumstances permitted by law.",
          "Following termination, information may remain temporarily in backups or records where required for security, legal, accounting or dispute-resolution purposes, after which it is deleted or anonymised according to applicable retention requirements.",
        ],
      },
      {
        heading: "13. Governing law",
        body: [
          "These Terms are intended to operate consistently with applicable laws. Where DigiCon is operated from or subject to Philippine jurisdiction, applicable Philippine law governs to the extent permitted by law. Mandatory consumer or data-protection rights in another jurisdiction are not intended to be excluded.",
        ],
      },
      {
        heading: "14. Contact",
        body: [
          "Questions about these Terms may be sent to support@digicon.app. Please identify the relevant account or service feature without sending unnecessary confidential information.",
        ],
      },
    ],
  },

  "/privacy": {
    eyebrow: "Legal",
    title: "Privacy Policy",
    intro:
      "DigiCon handles professional identity, contact and relationship information. This policy explains what we process, why we process it, how we protect it and the choices available to you.",
    updated: POLICY_DATE,
    blocks: [
      {
        heading: "1. Scope",
        body: [
          "This Privacy Policy applies to DigiCon websites, applications, published cards, authenticated workspaces and related services that link to this policy.",
          "DigiCon is designed primarily for professional networking. Please do not submit sensitive personal information unless the service explicitly asks for it and you have a lawful reason to provide it.",
        ],
      },
      {
        heading: "2. Information you provide",
        body: [
          "Depending on how you use DigiCon, we may process your name, professional role, company, biography, contact details, services, social links, booking links, account credentials or authentication identifiers, card content, contact-exchange information, relationship notes, follow-up information and other content you intentionally submit.",
          "If another person sends their contact information to you through a DigiCon exchange, that information becomes part of your private workspace and must be handled responsibly.",
        ],
      },
      {
        heading: "3. Information collected automatically",
        body: [
          "We may process technical information needed to provide, secure and troubleshoot the service, such as device or browser information, IP address, request information, security events and service logs.",
          "We minimise collection and use information for specified operational, security, legal or service-improvement purposes. Optional analytics or advertising technologies will not be treated as essential merely because they are convenient.",
        ],
      },
      {
        heading: "4. Published versus private information",
        body: [
          "When you publish a DigiCon card, information included on that card is intentionally made available to people who access the public card. Do not publish information that you expect to remain private.",
          "Private relationship notes, opportunity information, follow-ups and other workspace records are intended for your authenticated workspace and are not intended to be exposed through a public card.",
        ],
      },
      {
        heading: "5. Purposes of processing",
        body: [
          "We process information to create and authenticate accounts, publish cards, exchange contact details, maintain relationship records, provide follow-up tools, operate subscriptions, process payments through authorised providers, secure the platform, provide support, prevent abuse, comply with law and improve the service.",
          "Where applicable privacy law requires a legal basis, processing may rely on performance of a contract, legitimate interests, consent, compliance with a legal obligation or another lawful basis appropriate to the processing.",
        ],
      },
      {
        heading: "6. Privacy principles",
        body: [
          "DigiCon follows privacy-by-design principles including purpose limitation, data minimisation, accuracy, storage limitation, confidentiality, security and accountability. These principles are consistent with internationally recognised data-protection frameworks and the Philippine Data Privacy Act of 2012.",
          "Where the General Data Protection Regulation applies, DigiCon will assess the applicable GDPR requirements and lawful basis for the relevant processing rather than assuming that every visitor is subject to the GDPR.",
        ],
      },
      {
        heading: "7. Sharing and processors",
        body: [
          "We may share information with service providers that process information on our behalf, such as infrastructure, authentication, payment, email, security and support providers. We require appropriate safeguards and limit processing to legitimate service purposes.",
          "We may disclose information where required by law, valid legal process, security requirements, protection of rights, fraud prevention or an emergency involving a serious risk of harm.",
        ],
      },
      {
        heading: "8. International transfers",
        body: [
          "Some service providers or infrastructure may process information in countries other than the country where you live. Where applicable law requires safeguards for cross-border transfers, we will use an appropriate transfer mechanism or other lawful safeguard.",
        ],
      },
      {
        heading: "9. Security",
        body: [
          "We use technical and organisational measures appropriate to the nature of the information and risks, including access controls, authentication protections, secure transmission, server-side authorisation, monitoring and security maintenance.",
          "No internet service can guarantee absolute security. You should use strong, unique credentials and notify DigiCon promptly if you suspect unauthorised access.",
        ],
      },
      {
        heading: "10. Retention",
        body: [
          "We retain information only for as long as reasonably necessary for the purpose for which it was collected, to provide the service, satisfy contractual or legal requirements, resolve disputes, enforce agreements, maintain security or protect legitimate interests.",
          "Retention periods differ by information type. When information is no longer required, it is deleted, anonymised or securely disposed of subject to legitimate backup, legal and security requirements.",
        ],
      },
      {
        heading: "11. Your privacy rights",
        body: [
          "Subject to applicable law and lawful limitations, you may have rights to be informed, access personal information, correct inaccurate information, object to certain processing, request erasure or blocking, request data portability, withdraw consent where processing is based on consent, and seek damages or lodge a complaint where available.",
          "Under Philippine law, the National Privacy Commission recognises data-subject rights including the right to be informed, access, rectify, object, erasure or blocking, data portability, damages and filing a complaint.",
        ],
      },
      {
        heading: "12. How to make a privacy request",
        body: [
          "Send a privacy request to support@digicon.app with the subject line “Privacy Request”. We may request reasonable information to verify your identity or authority before fulfilling a request. We will not ask you to send passwords or authentication codes.",
          "If your request concerns another person's information stored in your workspace, we may need additional information to determine the appropriate lawful response.",
        ],
      },
      {
        heading: "13. Personal data breaches",
        body: [
          "DigiCon maintains procedures for identifying, containing, investigating and responding to security incidents. Where a breach meets applicable notification requirements, DigiCon will notify the relevant regulator and affected individuals within the required timeframe.",
          "For Philippine operations, mandatory breach notification requirements may include notification to the National Privacy Commission and affected data subjects within 72 hours where the statutory conditions are met.",
        ],
      },
      {
        heading: "14. Children",
        body: [
          "DigiCon is designed for professional networking and is not directed at children. We do not knowingly design the service to collect children's information for unrelated commercial profiling or advertising purposes.",
          "If you believe a child has provided personal information contrary to applicable requirements, contact support@digicon.app so the matter can be reviewed.",
        ],
      },
      {
        heading: "15. Automated processing and analytics",
        body: [
          "DigiCon may use automated calculations, classifications or analytics to organise relationship information and present service features. These tools are intended to support user decisions rather than replace human judgment in high-impact decisions.",
          "Where applicable law provides rights relating to solely automated decision-making or profiling, those rights will be respected to the extent they apply.",
        ],
      },
      {
        heading: "16. Policy updates",
        body: [
          "We may update this Privacy Policy when our service, processing activities or legal requirements change. Material changes will be communicated through an appropriate notice where required.",
        ],
      },
      {
        heading: "17. Privacy contact",
        body: [
          "Privacy questions and requests may be sent to support@digicon.app. If DigiCon designates a formal Data Protection Officer or publishes a dedicated privacy contact in the future, that contact will supersede this general privacy address.",
        ],
      },
    ],
  },

  "/cookies": {
    eyebrow: "Legal",
    title: "Cookie Policy",
    intro:
      "DigiCon follows a data-minimisation approach to browser storage and cookies. Technologies are grouped by purpose so users can understand and control optional processing.",
    updated: POLICY_DATE,
    blocks: [
      {
        heading: "1. What cookies are",
        body: [
          "Cookies are small pieces of information stored by a website in a browser. Similar browser technologies can include local storage and session storage. This policy describes both cookies and materially similar browser-storage technologies used by DigiCon.",
        ],
      },
      {
        heading: "2. Strictly necessary technologies",
        body: [
          "DigiCon may use cookies, browser storage or similar technologies that are strictly necessary to authenticate sessions, protect accounts, maintain security, remember essential settings or provide a requested service.",
          "Strictly necessary technologies do not require optional marketing consent merely because they are implemented using browser storage. They remain subject to security, transparency and other applicable legal requirements.",
        ],
      },
      {
        heading: "3. Preference technologies",
        body: [
          "Accessibility settings and privacy-choice settings may be stored locally in the browser so that your selected experience can be restored on later visits. These settings are functional preferences and are not advertising identifiers.",
        ],
      },
      {
        heading: "4. Analytics technologies",
        body: [
          "DigiCon does not intentionally enable advertising or cross-site tracking cookies as part of this policy. If optional analytics technology is introduced, it will be documented here and, where required, activated only after an appropriate consent choice.",
        ],
      },
      {
        heading: "5. Advertising and tracking",
        body: [
          "DigiCon does not use this consent interface to authorise third-party advertising or cross-site behavioural tracking. Any future advertising or tracking technology would require a revised privacy and cookie disclosure and the consent mechanism required by applicable law.",
        ],
      },
      {
        heading: "6. Third-party services",
        body: [
          "Third-party services used for authentication, payment or other requested functionality may implement their own browser technologies. Their technologies are governed by their own notices and the contractual integration with DigiCon.",
          "Payment providers may place cookies or other technologies on payment pages that they control. DigiCon does not treat those provider technologies as DigiCon advertising cookies.",
        ],
      },
      {
        heading: "7. Managing your choice",
        body: [
          "You can use the DigiCon cookie notice to choose essential-only processing or allow the categories currently offered. You can also clear browser storage or use browser controls to manage cookies, although disabling necessary technologies can prevent parts of DigiCon from working.",
          "The Accessibility bar remains available at the bottom of DigiCon pages and links directly to this Cookie Policy and the Privacy Policy.",
        ],
      },
      {
        heading: "8. Cookie inventory",
        body: [
          "The exact technology inventory can change with releases. The current DigiCon application should treat authentication and security technologies as necessary, accessibility preferences as functional storage, and optional analytics or advertising as disabled unless separately documented and lawfully enabled.",
        ],
      },
      {
        heading: "9. Updates",
        body: [
          "We will update this policy when our browser-storage practices materially change. The “last updated” date at the top of this page identifies the current policy version.",
        ],
      },
    ],
  },

  "/accessibility": {
    eyebrow: "Commitment",
    title: "Accessibility Statement",
    intro:
      "DigiCon is designed around inclusive interaction: professional identity and relationship tools should remain usable regardless of disability, device, input method or assistive technology.",
    updated: POLICY_DATE,
    blocks: [
      {
        heading: "1. Accessibility standard",
        body: [
          "DigiCon targets Web Content Accessibility Guidelines (WCAG) 2.2 at Level AA as an engineering and design objective. WCAG 2.2 is a W3C Recommendation and is also recognised as ISO/IEC 40500:2025.",
          "Accessibility is treated as an ongoing product responsibility rather than a one-time certification claim. A target does not mean that every page or interaction is guaranteed to conform at every moment.",
        ],
      },
      {
        heading: "2. Perceivable information",
        body: [
          "We use semantic structure, meaningful text alternatives, readable typography, sufficient visual contrast, responsive layouts and non-colour indicators where practical.",
          "Decorative imagery is hidden from assistive technologies where appropriate, while informative images receive meaningful alternative text.",
        ],
      },
      {
        heading: "3. Operable interaction",
        body: [
          "Core controls are intended to be keyboard accessible. Focus states are visible, interactive controls use appropriately sized targets, dialogs and menus are designed for keyboard operation, and navigation provides meaningful landmarks and labels.",
          "The interface includes reduced-motion support and the accessibility toolbar provides an explicit reduced-motion preference.",
        ],
      },
      {
        heading: "4. Understandable experience",
        body: [
          "Forms use labels and predictable controls. Error and status information is intended to be communicated clearly, and navigation patterns remain consistent across public pages.",
          "The policy pages use plain-language summaries alongside legally relevant detail so that users can understand the purpose of the service and their available choices.",
        ],
      },
      {
        heading: "5. Robust compatibility",
        body: [
          "DigiCon uses semantic HTML and accessible ARIA attributes where native HTML alone is insufficient. The interface is tested across modern browsers and common keyboard and assistive-technology interaction patterns as part of development.",
        ],
      },
      {
        heading: "6. Accessibility tools",
        body: [
          "A persistent accessibility bar is available at the bottom of DigiCon pages. It provides text-size controls, high-contrast mode, grayscale mode, link underlining, reduced-motion mode and reset controls.",
          "The accessibility interface also links directly to this statement, the Privacy Policy and the Cookie Policy.",
        ],
      },
      {
        heading: "7. Reduced motion",
        body: [
          "DigiCon respects the browser-level prefers-reduced-motion setting and provides an explicit reduced-motion preference. Decorative transitions and animations should not be necessary to understand or operate the product.",
        ],
      },
      {
        heading: "8. Keyboard and focus support",
        body: [
          "Visible focus indicators are maintained for interactive controls. Fixed navigation and accessibility controls are positioned so that important focused content is not intentionally hidden behind persistent interface elements.",
        ],
      },
      {
        heading: "9. Reporting an accessibility barrier",
        body: [
          "If an accessibility barrier prevents you from completing a task, email support@digicon.app. Please include the page address, a description of the barrier, the device and browser if known, and the assistive technology if relevant.",
          "Do not include passwords, authentication codes, payment-card information or other unnecessary sensitive information in an accessibility report.",
        ],
      },
      {
        heading: "10. Continuous improvement",
        body: [
          "We review accessibility issues as functional product defects and use user feedback, automated checks, manual keyboard testing and assistive-technology testing to improve the experience.",
          "Where a third-party integration creates an accessibility limitation outside DigiCon's direct control, we will assess available alternatives and communicate material limitations where appropriate.",
        ],
      },
    ],
  },
};

// Export the shared informational page used by the application's public policy routes.
export default function InfoPage() {
  // Retrieve the current route pathname.
  const { pathname } = useLocation();
  // Select the appropriate content and safely fall back to the About page.
  const content = CONTENT[pathname] ?? CONTENT["/about"];

  // Render the selected information page.
  return (
    <PublicLayout>
      {/* Provide a semantic page landmark for the policy content. */}
      <article
        className="mx-auto max-w-4xl px-4 py-12 sm:py-16"
        aria-labelledby="info-page-title"
      >
        {/* Render the policy heading. */}
        <SectionHeading
          eyebrow={content.eyebrow}
          title={content.title}
          testId="info-heading"
        />

        {/* Render the policy introduction. */}
        <p
          className="dense mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg"
          data-testid="info-intro"
        >
          {/* Render the introduction text. */}
          {content.intro}
        </p>

        {/* Render the current policy version date. */}
        <p
          className="dense mt-3 text-xs text-muted-foreground"
          data-testid="policy-updated"
        >
          {/* Render the publication date. */}
          Last updated: {content.updated}
        </p>

        {/* Render all policy sections as separate semantic sections. */}
        <div className="mt-10 space-y-4">
          {/* Render each structured policy block. */}
          {content.blocks.map((block) => (
            <section
              key={block.heading}
              className="glass rounded-2xl p-5 sm:p-7"
              aria-labelledby={`policy-${block.heading
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")}`}
              data-testid={`info-block-${block.heading
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")}`}
            >
              {/* Render the section heading. */}
              <h2
                id={`policy-${block.heading
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")}`}
                className="font-heading text-lg font-bold text-foreground"
              >
                {/* Render the section title. */}
                {block.heading}
              </h2>

              {/* Render every paragraph in the section. */}
              {block.body.map((paragraph, paragraphIndex) => (
                <p
                  key={`${block.heading}-${paragraphIndex}`}
                  className="dense mt-3 text-sm leading-7 text-muted-foreground sm:text-base"
                >
                  {/* Render the policy paragraph. */}
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>

        {/* Render useful actions beneath the policy. */}
        <div className="mt-10 flex flex-wrap gap-3">
          {/* Provide a primary account action. */}
          <Link
            to="/signup"
            className={buttonVariants()}
            data-testid="info-cta"
          >
            Create Your DigiCon
          </Link>

          {/* Provide a support action. */}
          <Link
            to="/support"
            className={buttonVariants({ variant: "outline" })}
            data-testid="info-support"
          >
            Contact Support
          </Link>
        </div>
      </article>
    </PublicLayout>
  );
}

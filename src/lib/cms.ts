import websiteContent from '../content/website.json';

export interface Service {
  title: string;
  copy: string;
  tag: string;
}

export interface Reason {
  text: string;
}

export interface ProcessStep {
  title: string;
  copy: string;
}

export interface Industry {
  title: string;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface WebsiteSettings {
  brandName: string;
  seo: { title: string; description: string };
  social: { whatsAppNumber: string; linkedInUrl: string };
  navigation: {
    home: string;
    services: string;
    why: string;
    process: string;
    about: string;
    industries: string;
    faqs: string;
    contact: string;
  };
  hero: {
    kicker: string;
    titleFirst: string;
    titleAccent: string;
    titleLast: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
  };
  servicesSection: { label: string; intro: string; titleFirst: string; titleAccent: string; description: string };
  whySection: { label: string; titleFirst: string; titleAccent: string; description: string; linkText: string };
  processSection: { label: string; titleFirst: string; titleAccent: string; description: string };
  industriesSection: { label: string; titleFirst: string; titleAccent: string; description: string };
  aboutSection: { label: string; titleFirst: string; titleAccent: string; paragraphOne: string; paragraphTwo: string; ctaText: string };
  faqSection: { label: string; titleFirst: string; titleAccent: string; description: string };
  contactSection: {
    label: string;
    titleFirst: string;
    titleAccent: string;
    description: string;
    detailsPlaceholder: string;
    submitText: string;
    successMessage: string;
    sideNoteFirst: string;
    sideNoteLast: string;
  };
  form: {
    fullNameLabel: string;
    companyLabel: string;
    emailLabel: string;
    phoneLabel: string;
    countryLabel: string;
    serviceLabel: string;
    servicePlaceholder: string;
    detailsLabel: string;
    budgetLabel: string;
    deadlineLabel: string;
    optionalLabel: string;
  };
  footer: {
    taglineFirst: string;
    taglineSecond: string;
    projectLabel: string;
    projectTitleFirst: string;
    projectTitleLast: string;
    privacyLabel: string;
  };
}

export interface WebsiteContent {
  settings: WebsiteSettings;
  services: Service[];
  reasons: Reason[];
  process: ProcessStep[];
  industries: Industry[];
  faqs: Faq[];
}

/**
 * Decap CMS writes to src/content/website.json. Astro includes that file in
 * each deployment, so published edits are reflected after Vercel redeploys.
 */
export function getWebsiteContent(): WebsiteContent {
  return websiteContent as WebsiteContent;
}

import websiteContent from '../content/website.json';
import { database, hasNeonDatabase } from './neon';

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

export const fallbackContent = websiteContent as WebsiteContent;

export const isWebsiteContent = (value: unknown): value is WebsiteContent => {
  if (!value || typeof value !== 'object') return false;
  const content = value as Partial<WebsiteContent>;
  return Boolean(content.settings)
    && Array.isArray(content.services)
    && Array.isArray(content.reasons)
    && Array.isArray(content.process)
    && Array.isArray(content.industries)
    && Array.isArray(content.faqs);
};

/**
 * Published copy stays available from the checked-in approved brief until a
 * Neon database is connected. Once connected, the client portal updates the
 * single public content record without requiring a deployment.
 */
export async function getWebsiteContent(): Promise<WebsiteContent> {
  if (!hasNeonDatabase()) return fallbackContent;

  try {
    const rows = await database()`select content from website_content where id = 'website' limit 1` as Array<{ content?: unknown }>;
    const content = rows[0]?.content;

    return isWebsiteContent(content) ? content : fallbackContent;
  } catch {
    return fallbackContent;
  }
}

export async function saveWebsiteContent(content: WebsiteContent) {
  await database()`
    insert into website_content (id, content, updated_at)
    values ('website', ${JSON.stringify(content)}::jsonb, now())
    on conflict (id) do update
    set content = excluded.content, updated_at = now()
  `;
}

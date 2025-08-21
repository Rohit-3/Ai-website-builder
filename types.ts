export interface GeneratedFile {
  name: string;
  content: string;
}

export interface ColorPalette {
  background: string;
  foreground: string;
  card: string;
  'card-foreground': string;
  primary: string;
  'primary-foreground': string;
}

export interface ChatMessage {
  sender: 'user' | 'ai' | 'system';
  text: string;
}

export interface SEO {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

export interface WebsiteComponent {
  id: string; // e.g., 'hero-1'
  type: 'Hero' | 'FeatureGrid' | 'Content' | 'CareerList' | 'ContactForm' | 'Logo' | 'Testimonials' | 'CTA' | 'DetailedServiceList';
  props: {
    title?: string;
    subtitle?: string;
    description?: string;
    content?: string; // For generic content blocks
    imageUrl?: string; // base64 data URI
    ctaText?: string;
    ctaLink?: string;
    items?: Array<{
      id: string;
      title: string;
      description: string;
      icon?: string; // Optional icon name
      imageUrl?: string; // base64 data URI
      // For Testimonials
      quote?: string;
      author?: string;
      role?: string;
    }>;
    formspreeEndpoint?: string; // for contact form
  };
}

export interface WebsitePage {
  id: string; // e.g., 'home'
  name: string; // e.g., 'Home'
  path: string; // e.g., 'index.html'
  componentIds: string[]; // e.g., ['hero-1', 'feature-grid-1']
}

export interface WebsiteProject {
  domain: string;
  topic: string;
  palette: ColorPalette;
  seo: SEO;
  pages: WebsitePage[];
  components: WebsiteComponent[];
}


export interface GenerationParams {
    topic: string;
    domain: string;
    style: string; // e.g., 'Modern and minimalist'
}

export interface ProgressUpdate {
  percentage: number;
  message: string;
}

export type ProgressCallback = (update: ProgressUpdate) => void;
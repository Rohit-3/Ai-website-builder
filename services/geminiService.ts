import { GoogleGenAI, Type } from "@google/genai";
import type { GenerationParams, WebsiteProject, ProgressCallback, ColorPalette, WebsiteComponent } from '../types';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Gemini API Service ---

const colorPaletteSchema = {
  type: Type.OBJECT,
  properties: {
    'background': { type: Type.STRING, description: "Main background color, e.g., #0F172A (slate-900)" },
    'foreground': { type: Type.STRING, description: "Main text color on the background, e.g., #E2E8F0 (slate-200)" },
    'card': { type: Type.STRING, description: "Background color for cards, e.g., #1E293B (slate-800)" },
    'card-foreground': { type: Type.STRING, description: "Text color for on top of cards, e.g., #CBD5E1 (slate-300)" },
    'primary': { type: Type.STRING, description: "Primary accent color for buttons, links, and highlights, e.g., #3B82F6 (blue-500)" },
    'primary-foreground': { type: Type.STRING, description: "Text color for on top of the primary color, e.g., #FFFFFF" },
  },
  required: ['background', 'foreground', 'card', 'card-foreground', 'primary', 'primary-foreground']
};

const websiteComponentSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "Unique identifier for the component, e.g., 'hero-1'." },
        type: { type: Type.STRING, description: "Type of the component. Must be one of: 'Hero', 'FeatureGrid', 'Content', 'CareerList', 'ContactForm', 'Logo', 'Testimonials', 'CTA', 'DetailedServiceList'." },
        props: {
            type: Type.OBJECT,
            description: "An object containing the properties for the component.",
            properties: {
                title: { type: Type.STRING },
                subtitle: { type: Type.STRING },
                description: { type: Type.STRING },
                content: { type: Type.STRING },
                ctaText: { type: Type.STRING },
                ctaLink: { type: Type.STRING },
                items: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            icon: { type: Type.STRING },
                            quote: { type: Type.STRING },
                            author: { type: Type.STRING },
                            role: { type: Type.STRING },
                        },
                        required: ['id']
                    }
                },
                formspreeEndpoint: { type: Type.STRING }
            }
        }
    },
    required: ['id', 'type', 'props']
};

const websitePageSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "Unique identifier for the page, e.g., 'home'." },
        name: { type: Type.STRING, description: "Display name of the page, e.g., 'Home'." },
        path: { type: Type.STRING, description: "File path for the page, e.g., 'index.html'." },
        componentIds: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An ordered list of component IDs to render on this page."
        }
    },
    required: ['id', 'name', 'path', 'componentIds']
};


const websiteProjectSchema = {
  type: Type.OBJECT,
  properties: {
    domain: { type: Type.STRING },
    topic: { type: Type.STRING },
    seo: { 
      type: Type.OBJECT, 
      properties: { 
        metaTitle: { type: Type.STRING }, 
        metaDescription: { type: Type.STRING }, 
        keywords: { type: Type.ARRAY, items: { type: Type.STRING } } 
      }, 
      required: ['metaTitle', 'metaDescription', 'keywords'] 
    },
    pages: {
      type: Type.ARRAY,
      description: "An array of page objects for the website.",
      items: websitePageSchema
    },
    components: {
      type: Type.ARRAY,
      description: "An array of all component objects used across all pages.",
      items: websiteComponentSchema
    }
  },
  required: ['domain', 'topic', 'seo', 'pages', 'components']
};


export const generateWebsiteProject = async (
  params: GenerationParams,
  onProgress: ProgressCallback
): Promise<WebsiteProject> => {
  if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set.");
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash";

  // 1. Generate Color Palette
  onProgress({ percentage: 15, message: 'Designing color palette...' });
  const paletteResponse = await ai.models.generateContent({
      model,
      contents: `Based on the topic "${params.topic}" and style guide "${params.style}", generate a modern, vibrant, professional, and WCAG AA accessible color palette.`,
      config: { responseMimeType: "application/json", responseSchema: colorPaletteSchema }
  });
  const palette: ColorPalette = JSON.parse(paletteResponse.text);

  // 2. Generate Website Structure and Content
  onProgress({ percentage: 40, message: 'Architecting site & writing content...' });
  const contentPrompt = `
    You are an expert AI Web Architect, SEO Specialist, and Senior Content Writer. Your task is to design the complete data structure for a professional, content-rich website that is optimized for search engines.
    - Topic/Industry: "${params.topic}"
    - Domain Name: "${params.domain}"
    - Desired Style: "${params.style}"

    **Your Goal:**
    Create a comprehensive JSON object representing the entire website. This is a high-stakes project, and the output must be exceptional.

    **CRITICAL INSTRUCTIONS:**

    1.  **Content Depth & SEO**: This is the most important rule. For EACH page you create, you MUST generate **at least 2000 words** of high-quality, relevant, and engaging content. The content must be well-researched, professional, and structured to maximize SEO value and user readability.

    2.  **Content Formatting**: For long text fields like \`description\` or \`content\`, you MUST use markdown-like formatting. Use double newlines (\`\\n\\n\`) to separate paragraphs. Use hashes for headings (e.g., \`## This is a Subheading\`). This is crucial for the rendering engine to create a beautiful, readable layout. DO NOT just write one giant block of text.

    3.  **Autonomous Page Architecture**: DO NOT use a predefined list of pages. You must intelligently determine the most appropriate and comprehensive set of pages (categories) for a website about this topic. Think like a business strategist. A good structure will likely include pages like 'Home', 'Services', 'Our Technology', 'Solutions by Industry', 'About Us', 'Case Studies', 'Blog', 'Contact'. Create a rich navigation structure that reflects a real, authoritative website.

    4.  **Component-Based Design**: Structure the extensive content into logical, reusable components.
        -   Available component types: 'Hero', 'FeatureGrid', 'Content', 'CareerList', 'ContactForm', 'Logo', 'Testimonials', 'CTA', 'DetailedServiceList'.
        -   Each component object must have a unique 'id' (e.g., "hero-1", "about-content-1").
        -   Vary the component order and combination on each page to create a unique and dynamic user experience. Avoid repetitive layouts.

    5.  **Imagery**: **DO NOT generate any \`imageUrl\` properties for any component.** Leave the \`imageUrl\` field completely out of the component's \`props\` object. The rendering engine will create beautiful, abstract placeholders automatically. All tokens should be used for generating high-quality text.

    6.  **Contact Form**: If you create a 'Contact' page, use a 'ContactForm' component with the Formspree endpoint: "https://formspree.io/f/your_form_id". Add a placeholder note in the description that the user needs to replace this.

    7.  **SEO Metadata**: Generate a catchy, SEO-friendly meta title (50-60 chars), a compelling meta description (150-160 chars), and 10-15 relevant, high-impact keywords.

    8.  **IDs**: All IDs for pages and components must be unique strings (e.g., "home", "services-cta-1").

    Adhere strictly to the JSON schema. Your output MUST be only the JSON object. Failure to produce a complete, ultra-high-quality result will not be acceptable.
  `;
  
  const contentResponse = await ai.models.generateContent({
    model,
    contents: contentPrompt,
    config: { responseMimeType: "application/json", responseSchema: websiteProjectSchema },
  });
  
  onProgress({ percentage: 90, message: 'Parsing AI architecture...' });
  await sleep(500);

  let project: WebsiteProject;
  try {
    project = JSON.parse(contentResponse.text.trim());
    project.palette = palette; // Add palette to the project
  } catch(e) {
    console.error("Failed to parse JSON response:", contentResponse.text);
    throw new Error("AI returned invalid JSON for project structure. Check the console.");
  }

  onProgress({ percentage: 100, message: 'Finalizing...' });
  return project;
};

export const refineWebsiteProject = async (
  currentProject: WebsiteProject,
  userPrompt: string
): Promise<WebsiteProject> => {
    if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set.");
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const refinementPrompt = `
You are an expert AI Web Architect. A user wants to modify their website, which is represented by the following JSON object.
Your task is to process the user's request and return the **complete, updated JSON object** for the entire website.

**Rules:**
1.  **Analyze the Request:** Carefully understand what the user wants to change. This could be colors, text, adding/removing sections, or even adding new pages.
2.  **Modify the JSON:** Apply the changes directly to the provided JSON structure.
    *   **Color changes:** Modify the \`palette\` object.
    *   **Text changes:** Find the correct component in the \`components\` array and update its \`props\` property. Use markdown-like formatting (e.g. \`\\n\\n\` for paragraphs) for readability.
    *   **Add a section:** Create a new component object, add it to the \`components\` array, and add its ID to the correct page's \`componentIds\` array.
    *   **Remove a section:** Remove the component from the \`components\` array and its ID from the page's \`componentIds\` array.
    *   **Add a page:** Create a new page object in the \`pages\` array and at least one new component for its content in the \`components\` array.
3.  **Return the Full Object:** Your response MUST be the entire, modified \`WebsiteProject\` JSON object. Do not return partial data or explanations. Your output must be parseable JSON.
4.  **Maintain Consistency:** If you add a new page, ensure the navigation structure (which is dynamically generated from the \`pages\` array) will automatically update.
5.  **Component Types:** When adding new components, you MUST use one of the existing, valid component types: 'Hero', 'FeatureGrid', 'Content', 'CareerList', 'ContactForm', 'Logo', 'Testimonials', 'CTA', 'DetailedServiceList'. Do not invent new component types.
6.  **IDs:** When creating new components or pages, always generate new, unique string IDs (e.g., 'new-feature-5', 'contact-page'). Do NOT modify existing component or page IDs.
7.  **Imagery**: Remember, the project does not use images. Do not add \`imageUrl\` properties. The frontend handles placeholders.

**Current Website JSON:**
\`\`\`json
${JSON.stringify(currentProject, null, 2)}
\`\`\`

**User's Request:** "${userPrompt}"

Now, provide the complete, updated JSON object.
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: refinementPrompt,
    });

    try {
        // The response might be wrapped in markdown, so we extract the JSON part.
        const text = response.text.trim();
        const jsonMatch = text.match(/```json\n([\s\S]*)\n```/);
        const jsonString = jsonMatch ? jsonMatch[1] : text;
        const newProject: WebsiteProject = JSON.parse(jsonString);

        return newProject;
    } catch(e) {
        console.error("Failed to parse refinement JSON response:", response.text, e);
        throw new Error("AI returned invalid JSON for refinement request.");
    }
};
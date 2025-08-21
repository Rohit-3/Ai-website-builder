import type { WebsiteProject, WebsiteComponent, GeneratedFile } from '../types';

const escapeHtml = (unsafe: string): string => {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
};

const formatContent = (content: string = ''): string => {
    return content.split(/\n\s*\n/).map(paragraph => {
        paragraph = paragraph.trim();
        if (paragraph.startsWith('###')) {
            return `<h4 class="text-xl font-semibold mb-4 mt-6 animate-on-scroll">${escapeHtml(paragraph.replace(/###/g, '').trim())}</h4>`;
        }
        if (paragraph.startsWith('##')) {
            return `<h3 class="text-2xl font-bold mb-4 mt-8 animate-on-scroll">${escapeHtml(paragraph.replace(/##/g, '').trim())}</h3>`;
        }
        if (paragraph.startsWith('#')) {
            return `<h2 class="text-3xl font-bold mb-6 mt-10 animate-on-scroll">${escapeHtml(paragraph.replace(/#/g, '').trim())}</h2>`;
        }
        if(paragraph) {
            return `<p class="mb-6 animate-on-scroll">${escapeHtml(paragraph)}</p>`;
        }
        return '';
    }).join('');
};


const renderComponent = (component: WebsiteComponent): string => {
  const { type, props } = component;
  
  switch (type) {
    case 'Logo':
      return `
        <a href="index.html" class="text-2xl font-bold tracking-tighter gradient-text interactive-target">${props.title}</a>
      `;
    
    case 'Hero':
      return `
        <section class="hero-section relative text-center py-24 sm:py-32 lg:py-48 px-4 sm:px-6 lg:px-8 overflow-hidden">
             <div class="hero-background absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-black opacity-80 z-0"></div>
             <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--primary)_0%,_transparent_40%)] opacity-20"></div>

            <div class="relative container mx-auto z-10">
                <h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white animate-on-scroll animated-title" style="text-shadow: 0 2px 10px rgba(0,0,0,0.5);">
                    ${escapeHtml(props.title ?? '')}
                </h1>
                <div class="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-gray-300 animate-on-scroll" style="transition-delay: 100ms;">
                    ${formatContent(props.description)}
                </div>
                ${props.ctaText ? `
                 <div class="mt-10 animate-on-scroll" style="transition-delay: 200ms;">
                    <a href="${props.ctaLink || '#'}" class="modern-btn interactive-target">${props.ctaText}</a>
                </div>
                ` : ''}
            </div>
        </section>
      `;
    
    case 'FeatureGrid':
      return `
        <section class="py-20 sm:py-28" style="background-color: var(--background);">
            <div class="container mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-16 max-w-3xl mx-auto">
                  <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text animate-on-scroll">${props.title}</h2>
                  ${props.description ? `<div class="mt-4 max-w-2xl mx-auto text-lg text-gray-400 animate-on-scroll" style="transition-delay: 100ms;">${formatContent(props.description)}</div>` : ''}
                </div>
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    ${(props.items || []).map((item, index) => `
                        <div class="modern-card animate-on-scroll interactive-target" style="transition-delay: ${index * 100}ms;">
                           <div class="mb-4 text-[--primary]">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                           </div>
                            <h3 class="text-xl font-semibold mb-3" style="color: var(--foreground);">${item.title}</h3>
                            <div style="color: var(--card-foreground);">${formatContent(item.description)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
      `;
      
    case 'Content':
      return `
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div class="max-w-4xl mx-auto">
                ${props.title ? `<h2 class="text-3xl sm:text-4xl font-bold mb-8 text-center gradient-text animate-on-scroll">${props.title}</h2>` : ''}
                <div class="prose prose-xl mx-auto text-left" style="color: var(--foreground);">
                  ${formatContent(props.content)}
                </div>
            </div>
        </div>
      `;
      
    case 'CareerList':
       return `
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div class="text-center max-w-3xl mx-auto">
                <h2 class="text-3xl sm:text-4xl font-bold gradient-text animate-on-scroll">${props.title}</h2>
                <div class="mt-4 text-lg text-gray-400 animate-on-scroll" style="transition-delay: 100ms;">${formatContent(props.description)}</div>
            </div>
            <div class="mt-12 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            ${(props.items || []).map((role, index) => `
                <div class="modern-card animate-on-scroll interactive-target" style="transition-delay: ${index * 100}ms;">
                    <h3 class="text-xl font-semibold mb-3" style="color: var(--primary);">${role.title}</h3>
                    <div style="color: var(--card-foreground);">${formatContent(role.description)}</div>
                </div>
            `).join('')}
            </div>
        </div>
    `;

    case 'ContactForm':
      return `
         <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div class="max-w-xl mx-auto modern-card animate-on-scroll" style="padding: 2rem;">
                <h2 class="text-3xl sm:text-4xl font-bold text-center mb-4 gradient-text">${props.title}</h2>
                <div class="text-center mb-8" style="color: var(--card-foreground);">${formatContent(props.description)}</div>
                 <form action="${props.formspreeEndpoint}" method="POST" class="space-y-6">
                    <div>
                        <label for="name" class="sr-only">Name</label>
                        <input type="text" name="name" id="name" required placeholder="Your Name" class="modern-input interactive-target">
                    </div>
                     <div>
                        <label for="email" class="sr-only">Email</label>
                        <input type="email" name="email" id="email" required placeholder="Your Email" class="modern-input interactive-target">
                    </div>
                     <div>
                        <label for="message" class="sr-only">Message</label>
                        <textarea name="message" id="message" required rows="4" placeholder="Your Message" class="modern-input interactive-target"></textarea>
                    </div>
                    <div>
                        <button type="submit" class="modern-btn w-full interactive-target">Send Message</button>
                    </div>
                </form>
            </div>
        </div>
      `;
      
    case 'Testimonials':
       return `
        <section class="py-16 sm:py-24" style="background: radial-gradient(circle at 100% 0%, rgba(255,255,255,0.03), transparent 30%), var(--background);">
            <div class="container mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-16 max-w-3xl mx-auto">
                  <h2 class="text-3xl sm:text-4xl font-bold gradient-text animate-on-scroll">${props.title}</h2>
                   ${props.description ? `<div class="mt-4 max-w-2xl mx-auto text-lg text-gray-400 animate-on-scroll" style="transition-delay: 100ms;">${formatContent(props.description)}</div>` : ''}
                </div>
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    ${(props.items || []).map((item, index) => `
                        <div class="modern-card flex flex-col animate-on-scroll interactive-target" style="transition-delay: ${index * 100}ms;">
                           <div class="flex-grow mb-4">
                             <p class="text-lg italic" style="color: var(--card-foreground);">“${escapeHtml(item.quote ?? '')}”</p>
                           </div>
                           <div class="flex-shrink-0 mt-auto pt-4">
                                <p class="font-bold text-md" style="color: var(--foreground);">${escapeHtml(item.author ?? '')}</p>
                                <p class="text-sm" style="color: var(--primary);">${escapeHtml(item.role ?? '')}</p>
                           </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
       `;

    case 'CTA':
       return `
        <section class="py-16 sm:py-24" style="background-color: var(--card);">
             <div class="container mx-auto px-4 sm:px-6 lg:px-8 text-center animate-on-scroll">
                 <h2 class="text-3xl sm:text-4xl font-bold gradient-text">${props.title}</h2>
                 <div class="mt-4 max-w-2xl mx-auto text-lg text-gray-400">${formatContent(props.description)}</div>
                 <div class="mt-8">
                     <a href="${props.ctaLink || '#'}" class="modern-btn interactive-target">${props.ctaText}</a>
                 </div>
             </div>
        </section>
       `;
    
    case 'DetailedServiceList':
        return `
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div class="text-center max-w-3xl mx-auto">
                <h2 class="text-3xl sm:text-4xl font-bold gradient-text animate-on-scroll">${props.title}</h2>
                <div class="mt-4 text-lg text-gray-400 animate-on-scroll" style="transition-delay: 100ms;">${formatContent(props.description)}</div>
            </div>
            <div class="mt-20 space-y-20">
            ${(props.items || []).map((item, index) => `
                <div class="grid md:grid-cols-2 gap-12 items-center">
                    <div class="animate-on-scroll ${index % 2 === 1 ? 'md:order-2' : ''}">
                        <h3 class="text-2xl font-semibold mb-4" style="color: var(--primary);">${item.title}</h3>
                        <div class="text-lg" style="color: var(--foreground);">${formatContent(item.description)}</div>
                    </div>
                     <div class="img-placeholder h-80 animate-on-scroll ${index % 2 === 1 ? 'md:order-1' : ''}" style="transition-delay: 150ms;">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="w-24 h-24 opacity-20" style="color: var(--primary);">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h12A2.25 2.25 0 0 0 20.25 14.25V3M3.75 21h16.5M16.5 3.75h.008v.008h-.008V3.75Zm-3.75 0h.008v.008h-.008V3.75Zm-3.75 0h.008v.008h-.008V3.75Zm-3.75 0h.008v.008h-.008V3.75Z" />
                        </svg>
                    </div>
                </div>
            `).join('')}
            </div>
        </div>
        `;

    default:
      return `<!-- Unknown component type: ${type} -->`;
  }
};


const createHtmlPage = (project: WebsiteProject, pageId: string): string => {
    const page = project.pages.find(p => p.id === pageId);
    if (!page) {
        return `<html><body><h1>Error: Page with ID '${pageId}' not found.</h1></body></html>`;
    }
    const { seo, palette, domain } = project;
    
    const bodyContent = page.componentIds.map(id => {
        const component = project.components.find(c => c.id === id);
        return component ? renderComponent(component) : `<!-- Component with id ${id} not found -->`;
    }).join('\n');

    const navLinks = project.pages.map(p => 
        `<a href="${p.path}" class="interactive-target text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">${p.name}</a>`
    ).join('');

    return `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(seo.metaTitle)}</title>
    <meta name="description" content="${escapeHtml(seo.metaDescription)}">
    <meta name="keywords" content="${escapeHtml(seo.keywords.join(', '))}">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
      :root {
        --background: ${palette.background};
        --foreground: ${palette.foreground};
        --card: ${palette.card};
        --card-foreground: ${palette['card-foreground']};
        --primary: ${palette.primary};
        --primary-foreground: ${palette['primary-foreground']};
      }
      body {
        background-color: var(--background);
        color: var(--foreground);
        font-family: 'Inter', sans-serif;
        cursor: none;
      }
      html {
        -ms-overflow-style: none; /* IE and Edge */
        scrollbar-width: none; /* Firefox */
      }
      html::-webkit-scrollbar {
        display: none; /* Chrome, Safari, and Opera */
      }
      .prose { color: var(--foreground); max-width: 100%; }
      .prose h1, .prose h2, .prose h3, .prose h4 { color: var(--foreground); }
      .prose strong { color: var(--foreground); }
      .prose a { color: var(--primary); }
      .prose blockquote { border-left-color: var(--primary); color: var(--card-foreground); }
      .prose code { color: var(--foreground); }

      /* Apple-level modern styles */
      .gradient-text {
        background-image: linear-gradient(45deg, var(--primary), ${palette.foreground});
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-fill-color: transparent;
      }
      .modern-btn {
        display: inline-block;
        padding: 0.75rem 2rem;
        background-color: var(--primary);
        color: var(--primary-foreground);
        border-radius: 9999px;
        font-weight: 600;
        text-decoration: none;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      }
      .modern-btn:hover {
        transform: scale(1.05) translateY(-2px);
        box-shadow: 0 8px 25px color-mix(in srgb, var(--primary) 30%, transparent);
      }
      .modern-card {
        background-color: var(--card);
        padding: 2rem;
        border-radius: 1.5rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      .modern-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.45);
      }
      .modern-input {
        width: 100%;
        background-color: rgba(0,0,0,0.2);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 0.75rem;
        padding: 0.75rem 1rem;
        color: var(--foreground);
        transition: border-color 0.3s ease, box-shadow 0.3s ease;
      }
      .modern-input:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 40%, transparent);
      }
      .img-placeholder {
        background: linear-gradient(45deg, var(--card), rgba(0,0,0,0.2));
        border-radius: 1.5rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Scroll Animations */
      .animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
      }
      .animate-on-scroll.is-visible {
        opacity: 1;
        transform: translateY(0);
      }

      /* Kinetic Typography */
      .animated-title .animated-word {
        display: inline-block;
        opacity: 0;
        transform: translateY(20px);
        animation: reveal-word 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
      }
      @keyframes reveal-word {
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Custom Cursor */
      .custom-cursor {
        position: fixed;
        top: 0;
        left: 0;
        width: 8px;
        height: 8px;
        background-color: var(--primary);
        border-radius: 50%;
        pointer-events: none;
        transform: translate(-50%, -50%);
        transition: width 0.3s ease, height 0.3s ease, background-color 0.3s ease;
        z-index: 9999;
      }
      .custom-cursor.hover {
        width: 40px;
        height: 40px;
        background-color: color-mix(in srgb, var(--primary) 30%, transparent);
      }
      .custom-cursor.pointer {
         width: 40px;
         height: 40px;
         background-color: rgba(255,255,255,0.1);
      }
      
      /* Page loader */
      .page-loader {
        position: fixed;
        inset: 0;
        background-color: var(--background);
        z-index: 10000;
        transition: opacity 0.5s ease-out;
      }
    </style>
</head>
<body class="antialiased font-sans opacity-0 transition-opacity duration-500">
    <div class="page-loader"></div>
    <div class="custom-cursor"></div>

    <header class="bg-black/30 backdrop-blur-xl sticky top-0 z-50 border-b border-white/10">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-20">
                ${renderComponent({id: 'logo', type: 'Logo', props: {title: domain}})}
                <nav class="hidden md:flex md:space-x-2">
                    ${navLinks}
                </nav>
                 <div class="md:hidden">
                    <button id="mobile-menu-button" class="interactive-target inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                        <svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                </div>
            </div>
        </div>
         <div id="mobile-menu" class="md:hidden hidden">
            <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
                ${navLinks}
            </div>
        </div>
    </header>
    
    <main>
        ${bodyContent}
    </main>

    <footer class="mt-20 py-12 px-4 sm:px-6 lg:px-8" style="background: linear-gradient(to top, rgba(0,0,0,0.3), transparent);">
        <div class="container mx-auto text-center text-gray-400">
            <p>&copy; ${new Date().getFullYear()} ${escapeHtml(domain)}. All rights reserved.</p>
        </div>
    </footer>

    <script>
      document.addEventListener('DOMContentLoaded', () => {
        const body = document.body;
        const pageLoader = document.querySelector('.page-loader');

        // Page load transition
        pageLoader.style.opacity = '0';
        body.style.opacity = '1';
        setTimeout(() => pageLoader.style.display = 'none', 500);

        // Mobile menu toggle
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }

        // Intersection Observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              if(entry.target.classList.contains('animated-title')) {
                animateTitle(entry.target);
              }
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1 });

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
          observer.observe(el);
        });

        // Kinetic Typography (Word-based)
        function animateTitle(titleElement) {
            const words = titleElement.textContent.trim().split(/\\s+/);
            titleElement.innerHTML = '';
            words.forEach((word, index) => {
                const wordSpan = document.createElement('span');
                wordSpan.textContent = word;
                wordSpan.className = 'animated-word';
                wordSpan.style.animationDelay = \`\${index * 0.1}s\`;
                titleElement.appendChild(wordSpan);
                titleElement.appendChild(document.createTextNode(' '));
            });
        }

        // Custom Cursor
        const cursor = document.querySelector('.custom-cursor');
        window.addEventListener('mousemove', e => {
          cursor.style.left = e.clientX + 'px';
          cursor.style.top = e.clientY + 'px';
        });

        document.querySelectorAll('.interactive-target, a, button').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });
        
        // Parallax Hero
        const heroSection = document.querySelector('.hero-section');
        const heroBackground = document.querySelector('.hero-background');
        if(heroSection && heroBackground) {
            window.addEventListener('scroll', () => {
                const scrollPosition = window.pageYOffset;
                heroBackground.style.transform = \`translateY(\${scrollPosition * 0.3}px)\`;
            });
        }

        // In-page navigation for preview iframe
        if (window.self !== window.top) {
          document.addEventListener('click', e => {
            const anchor = e.target.closest('a');
            if (anchor && anchor.href) {
              const url = new URL(anchor.href);
              if (url.origin === window.location.origin && url.pathname.endsWith('.html')) {
                e.preventDefault();
                const pagePath = url.pathname.startsWith('/') ? url.pathname.substring(1) : url.pathname;
                window.parent.postMessage({ type: 'navigate', page: pagePath }, '*');
              }
            }
          });
        }
      });
    </script>
</body>
</html>
`;
}


const createRobotsTxt = (): GeneratedFile => ({
    name: 'robots.txt',
    content: `User-agent: *\nAllow: /\n\nSitemap: /sitemap.xml`
});

const createSitemapXml = (project: WebsiteProject): GeneratedFile => {
  const urls = project.pages.map(page => `
  <url>
    <loc>https://${escapeHtml(project.domain)}/${escapeHtml(page.path)}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>${page.path === 'index.html' ? '1.00' : '0.80'}</priority>
  </url>
  `).join('');

  return {
    name: 'sitemap.xml',
    content: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
  };
};

export const assembleWebsiteFiles = (project: WebsiteProject): GeneratedFile[] => {
    const files: GeneratedFile[] = [];

    // Generate HTML for each page
    for (const page of project.pages) {
        files.push({
            name: page.path,
            content: createHtmlPage(project, page.id)
        });
    }
    
    // Add other assets
    files.push(createRobotsTxt());
    files.push(createSitemapXml(project));

    return files;
};
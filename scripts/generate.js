import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();

// Helper to safely read JSON
function readJSON(filePath) {
  try {
    const fullPath = path.join(ROOT_DIR, filePath);
    if (!fs.existsSync(fullPath)) return null;
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return null;
  }
}

// Helper to escape HTML entity characters in text
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── 1. UPDATE HTML META TAGS & HEAD SAFELY WITHOUT REMOVING STYLES / SCRIPTS ───
function updateHTMLMetadata(metaConfig) {
  console.log('--- Updating HTML Meta Tags & Structured Data ---');
  const site = metaConfig.site || {};
  const pages = metaConfig.pages || {};

  for (const [pageRelPath, pageMeta] of Object.entries(pages)) {
    const fullPagePath = path.join(ROOT_DIR, pageRelPath);
    if (!fs.existsSync(fullPagePath)) {
      console.warn(`Page file not found: ${pageRelPath}`);
      continue;
    }

    let html = fs.readFileSync(fullPagePath, 'utf8');

    const canonicalUrl = `${site.baseUrl}${pageMeta.path.startsWith('/') ? '' : '/'}${pageMeta.path}`;
    const ogImage = pageMeta.ogImage || site.ogImage;
    const title = pageMeta.title || site.name;
    const description = pageMeta.description || '';
    const keywords = Array.isArray(pageMeta.keywords) ? pageMeta.keywords.join(', ') : (pageMeta.keywords || '');
    const ogTitle = pageMeta.ogTitle || title;
    const ogDescription = pageMeta.ogDescription || description;

    // Relative depth fix for favicon
    const isSubdir = pageRelPath.includes('/') && !pageRelPath.startsWith('./');
    const faviconPath = isSubdir ? '../favicon.ico' : 'favicon.ico';

    // Page-specific metadata tags block
    const metaBlockLines = [
      '<!-- ── AUTO-GENERATED META TAGS & SEO ── -->',
      `  <link rel="icon" href="${faviconPath}" />`,
      '  <!-- Google tag (gtag.js) -->',
      '  <script async src="https://www.googletagmanager.com/gtag/js?id=G-2QKJX6PHT9"></script>',
      '  <script>',
      '    window.dataLayer = window.dataLayer || [];',
      '    function gtag(){dataLayer.push(arguments);}',
      '    gtag(\'js\', new Date());',
      '    gtag(\'config\', \'G-2QKJX6PHT9\');',
      '  </script>',
      `  <title>${esc(title)}</title>`,
      `  <meta name="description" content="${esc(description)}" />`,
      `  <meta name="keywords" content="${esc(keywords)}" />`,
      `  <link rel="canonical" href="${esc(canonicalUrl)}" />`,
      '  <!-- Open Graph / Facebook -->',
      `  <meta property="og:title" content="${esc(ogTitle)}" />`,
      `  <meta property="og:description" content="${esc(ogDescription)}" />`,
      `  <meta property="og:type" content="${esc(pageMeta.ogType || 'website')}" />`,
      `  <meta property="og:url" content="${esc(canonicalUrl)}" />`,
      `  <meta property="og:image" content="${esc(ogImage)}" />`,
      '  <!-- Twitter Card -->',
      '  <meta name="twitter:card" content="summary_large_image" />',
      `  <meta name="twitter:title" content="${esc(ogTitle)}" />`,
      `  <meta name="twitter:description" content="${esc(ogDescription)}" />`,
      `  <meta name="twitter:image" content="${esc(ogImage)}" />`
    ];

    if (site.twitterHandle) {
      metaBlockLines.push(`  <meta name="twitter:site" content="${esc(site.twitterHandle)}" />`);
    }

    if (pageMeta.structuredData && Array.isArray(pageMeta.structuredData)) {
      metaBlockLines.push('  <!-- Structured Data (Schema.org) -->');
      for (const sd of pageMeta.structuredData) {
        metaBlockLines.push(`  <script type="application/ld+json">\n${JSON.stringify(sd, null, 2)}\n  </script>`);
      }
    }
    metaBlockLines.push('<!-- ── END AUTO-GENERATED META TAGS ── -->');

    const metaBlockStr = metaBlockLines.join('\n');

    const autoBlockRegex = /<!-- ── AUTO-GENERATED META TAGS & SEO ── -->[\s\S]*?<!-- ── END AUTO-GENERATED META TAGS ── -->/;

    if (autoBlockRegex.test(html)) {
      html = html.replace(autoBlockRegex, metaBlockStr.trim());
    } else {
      // Safely replace title, meta description/keywords, og, twitter, and canonical without removing stylesheet links or styles
      html = html
        .replace(/<title>[\s\S]*?<\/title>/gi, '')
        .replace(/<meta\s+name=["'](description|keywords)["'][\s\S]*?>/gi, '')
        .replace(/<meta\s+property=["']og:[\s\S]*?>/gi, '')
        .replace(/<meta\s+name=["']twitter:[\s\S]*?>/gi, '')
        .replace(/<link\s+rel=["'](icon|canonical)["'][\s\S]*?>/gi, '');

      html = html.replace(/<head>/i, `<head>\n  ${metaBlockStr.trim()}\n`);
    }

    fs.writeFileSync(fullPagePath, html, 'utf8');
    console.log(`Updated metadata for: ${pageRelPath}`);
  }
}

// ── 2. AUTO-GENERATE SITEMAP.XML ──────────────────────────────────
function generateSitemap(metaConfig) {
  console.log('--- Generating sitemap.xml ---');
  const site = metaConfig.site || {};
  const pages = metaConfig.pages || {};
  const today = new Date().toISOString().split('T')[0];

  const urlsXml = Object.entries(pages).map(([pageRelPath, pageMeta]) => {
    let priority = '0.8';
    let changefreq = 'weekly';

    if (pageRelPath === 'index.html' || pageMeta.path === '/') {
      priority = '1.0';
      changefreq = 'monthly';
    } else if (pageRelPath.includes('novahack') || pageRelPath === 'ctf/index.html') {
      priority = '0.9';
    }

    const fullUrl = `${site.baseUrl}${pageMeta.path.startsWith('/') ? '' : '/'}${pageMeta.path}`;

    return `  <url>
    <loc>${esc(fullUrl)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join('\n');

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>
`;

  fs.writeFileSync(path.join(ROOT_DIR, 'sitemap.xml'), sitemapXml, 'utf8');
  console.log('sitemap.xml generated successfully!');
}

// ── 3. AUTO-GENERATE LLMS.TXT ──────────────────────────────────────
function generateLLMSTxt(metaConfig) {
  console.log('--- Generating llms.txt ---');
  const site = metaConfig.site || {};
  const events = readJSON('data/events.json') || [];
  const team = readJSON('data/team.json') || [];

  let llmsContent = `# IEEE Computer Society Nirma University
# llms.txt — Machine-readable context for AI agents and large language models
# Standard format: https://llmstxt.org/

> IEEE Computer Society Nirma University, Ahmedabad, India.
> We run technical events, hackathons, CTF competitions, workshops, and research programs for undergraduate engineering students.

## Organization

- Name: IEEE Computer Society Nirma University
- Short Name: IEEE CS Nirma University
- University: Nirma University, Ahmedabad, Gujarat — 382 481, India
- Parent Organization: IEEE Computer Society (www.computer.org)
- Website: ${site.baseUrl}/

## Contact

- Phone: +91 9265641668
- Email: deep@computer.org
- GitHub: https://github.com/IEEE-Computer-Nirma
- LinkedIn: https://www.linkedin.com/company/ieee-computer-nirma-university
- Instagram: https://www.instagram.com/ieee.cs.sbnu/

## Flagship Event: NovaHack 2026

- Date: August 22–23, 2026
- Format: 24-Hour Hackathon + Pre-Event Jeopardy CTF
- Location: Nirma University, Ahmedabad, Gujarat

### Problem Statements (Hackathon Tracks)

1. **Autonomous Contract Review Agent**
   - Track: AI & LegalTech / Agentic AI
   - Summary: Automated analysis of contracts (NDAs, vendor agreements) to identify potential legal risks, policy deviations, and missing clauses.
   - Key Challenges: Lawyer hours, human oversights, policy comparison repetition, knowledge reuse, legal risk visibility.

2. **AI Meeting Intelligence Platform**
   - Track: AI & Enterprise Intelligence
   - Summary: Intelligent conversation understanding that converts meeting discussions, decisions, and action items into automated workflows and project updates.
   - Key Challenges: Information loss, action item tracking, manual project updates, blocker visibility, stakeholder alignment.

## Events

`;

  if (Array.isArray(events) && events.length > 0) {
    events.forEach(ev => {
      llmsContent += `### ${ev.title} (${ev.status ? ev.status.toUpperCase() : 'EVENT'})\n`;
      llmsContent += `- Type: ${ev.type || 'Event'}\n`;
      llmsContent += `- Date: ${ev.date || 'TBA'}\n`;
      if (ev.duration) llmsContent += `- Duration: ${ev.duration}\n`;
      if (ev.description) llmsContent += `- Description: ${ev.description}\n`;
      if (ev.link) llmsContent += `- URL: ${ev.link}\n`;
      llmsContent += '\n';
    });
  }

  llmsContent += `## Key Platform Pages\n\n`;
  if (metaConfig.pages) {
    for (const [pageFile, pageMeta] of Object.entries(metaConfig.pages)) {
      const pageUrl = `${site.baseUrl}${pageMeta.path.startsWith('/') ? '' : '/'}${pageMeta.path}`;
      llmsContent += `- ${pageMeta.title}: ${pageUrl}\n`;
    }
  }
  llmsContent += `- Sitemap: ${site.baseUrl}/sitemap.xml\n`;

  llmsContent += `\n## Core Team\n\n`;
  if (Array.isArray(team)) {
    team.forEach(cat => {
      if (cat.category && Array.isArray(cat.members)) {
        llmsContent += `### ${cat.category}\n`;
        cat.members.forEach(m => {
          llmsContent += `- ${m.name} — ${m.role}`;
          if (m.github) llmsContent += ` (GitHub: ${m.github})`;
          if (m.linkedin) llmsContent += ` (LinkedIn: ${m.linkedin})`;
          llmsContent += '\n';
        });
        llmsContent += '\n';
      }
    });
  }

  llmsContent += `## Technology Stack

- Static Site: HTML5, CSS3, Vanilla JavaScript
- Dynamic Data Engine: Runtime JSON assets under \`/data/\` (\`events.json\`, \`team.json\`, \`gallery.json\`, \`meta.json\`)
- CTF Flag Verification: SHA-256 hashed flags via Web Crypto API
- Hosted: GitHub Pages
`;

  fs.writeFileSync(path.join(ROOT_DIR, 'llms.txt'), llmsContent, 'utf8');
  console.log('llms.txt generated successfully!');
}

// ── MAIN EXECUTOR ──────────────────────────────────────────────────
function main() {
  const metaConfig = readJSON('data/meta.json');
  if (!metaConfig) {
    console.error('Failed to read data/meta.json. Aborting generation.');
    process.exit(1);
  }

  updateHTMLMetadata(metaConfig);
  generateSitemap(metaConfig);
  generateLLMSTxt(metaConfig);

  console.log('\n✅ All SEO & GEO assets generated successfully!');
}

main();

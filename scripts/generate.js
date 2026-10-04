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

// ── 1. UPDATE HTML META TAGS & JSON-LD ───────────────────────────
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

    const canonicalUrl = `${site.baseUrl}${pageMeta.path === '/' ? '' : pageMeta.path}`;
    const ogImage = pageMeta.ogImage || site.ogImage;
    const title = pageMeta.title || site.name;
    const description = pageMeta.description || '';
    const keywords = Array.isArray(pageMeta.keywords) ? pageMeta.keywords.join(', ') : (pageMeta.keywords || '');
    const ogTitle = pageMeta.ogTitle || title;
    const ogDescription = pageMeta.ogDescription || description;

    // Head inner construction
    const metaBlockLines = [
      '  <!-- ── AUTO-GENERATED META TAGS & SEO ── -->',
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

    // Append JSON-LD structured data scripts
    if (pageMeta.structuredData && Array.isArray(pageMeta.structuredData)) {
      metaBlockLines.push('  <!-- Structured Data (Schema.org) -->');
      for (const sd of pageMeta.structuredData) {
        metaBlockLines.push(`  <script type="application/ld+json">\n${JSON.stringify(sd, null, 2)}\n  </script>`);
      }
    }
    metaBlockLines.push('  <!-- ── END AUTO-GENERATED META TAGS ── -->');

    const metaBlockStr = metaBlockLines.join('\n');

    // Replace existing block if present, or replace <title>...</title> and adjacent meta tags
    const autoBlockRegex = /<!-- ── AUTO-GENERATED META TAGS & SEO ── -->[\s\S]*?<!-- ── END AUTO-GENERATED META TAGS ── -->/;

    if (autoBlockRegex.test(html)) {
      html = html.replace(autoBlockRegex, metaBlockStr.trim());
    } else {
      // Replace existing title & tags in head
      const titleRegex = /<title>[\s\S]*?<\/title>/i;
      if (titleRegex.test(html)) {
        html = html.replace(titleRegex, metaBlockStr.trim());
      } else {
        html = html.replace(/<head>/i, `<head>\n${metaBlockStr.trim()}\n`);
      }
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
    }

    const fullUrl = `${site.baseUrl}${pageMeta.path === '/' ? '' : pageMeta.path}`;

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
  const achievements = readJSON('data/achievements.json') || [];

  let llmsContent = `# IEEE Computer Society — Nirma University Student Branch Chapter
# llms.txt — Machine-readable context for AI agents and large language models
# Standard format: https://llmstxt.org/

> IEEE Computer Society Student Branch Chapter at Nirma University, Ahmedabad, India.
> We run technical events, hackathons, CTF competitions, workshops, and research programs for undergraduate engineering students.

## Organization

- Name: IEEE Computer Society Student Branch Chapter, Nirma University
- Short Name: IEEE CS Nirma
- University: Nirma University, Ahmedabad, Gujarat — 382 481, India
- Parent Organization: IEEE Computer Society (www.computer.org)
- Website: ${site.baseUrl}/

## Contact

- Phone: +91 9265641668
- Email: deep@computer.org
- GitHub: https://github.com/IEEE-Computer-Nirma
- LinkedIn: https://www.linkedin.com/company/ieee-computer-nirma-university
- Instagram: https://www.instagram.com/ieee.cs.sbnu/

## Flagship Event: HackIEEE

- Host: IEEE Computer Society Nirma University
- Official Portal: https://hack.ieeenirma.org/
- Summary: Premier regional student hackathon bringing developers, researchers, and engineers together to build impactful technical projects.

## Key Platform Pages

`;

  if (metaConfig.pages) {
    for (const [pageFile, pageMeta] of Object.entries(metaConfig.pages)) {
      const pageUrl = `${site.baseUrl}${pageMeta.path === '/' ? '' : pageMeta.path}`;
      llmsContent += `- ${pageMeta.title}: ${pageUrl}\n`;
    }
  }
  llmsContent += `- Sitemap: ${site.baseUrl}/sitemap.xml\n`;

  llmsContent += `\n## Events\n\n`;
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

  llmsContent += `## Achievements & Milestones\n\n`;
  if (Array.isArray(achievements) && achievements.length > 0) {
    achievements.forEach(ach => {
      llmsContent += `### ${ach.title}\n`;
      llmsContent += `- Date: ${ach.date}\n`;
      llmsContent += `- Description: ${ach.description}\n`;
      if (ach.contributors && ach.contributors.length) {
        llmsContent += `- Contributors: ${ach.contributors.map(c => c.name).join(', ')}\n`;
      }
      llmsContent += '\n';
    });
  }

  llmsContent += `## Core Team & Leadership\n\n`;
  if (Array.isArray(team)) {
    team.forEach(cat => {
      if (cat.category && Array.isArray(cat.members)) {
        llmsContent += `### ${cat.category}\n`;
        cat.members.forEach(m => {
          llmsContent += `- ${m.name} — ${m.role} (Profile: ${site.baseUrl}/member?id=${encodeURIComponent(m.id)})`;
          if (m.github) llmsContent += ` [GitHub: ${m.github}]`;
          if (m.linkedin) llmsContent += ` [LinkedIn: ${m.linkedin}]`;
          llmsContent += '\n';
        });
        llmsContent += '\n';
      }
    });
  }

  llmsContent += `## Technology Stack

- Static Site: HTML5, CSS3, Vanilla JavaScript
- Dynamic Data Engine: Runtime JSON assets under \`/data/\` (\`events.json\`, \`team.json\`, \`gallery.json\`, \`achievements.json\`, \`meta.json\`)
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

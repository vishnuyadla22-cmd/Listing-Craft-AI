import { GeneratedListing } from '../types';

export function formatAsMarkdown(listing: GeneratedListing): string {
  const dateStr = new Date(listing.created_at || Date.now()).toLocaleDateString();
  const bullets = listing.selling_points.map(p => `- ${p}`).join('\n');
  const tags = listing.tags.map(t => `\`#${t}\``).join(' ');
  const alts = listing.alternative_titles.map(t => `- ${t}`).join('\n');

  return `# ${listing.title}

*Platform:* **${listing.platform.toUpperCase()}** | *Created:* ${dateStr}${listing.is_demo_mode ? ' | *(Generated in DEMO MODE)*' : ''}

## Short Summary
${listing.short_description}

## Key Features & Bullet Points
${bullets}

## Full Product Description
${listing.full_description}

## Call to Action
> **${listing.call_to_action}**

---

### Alternative Titles
${alts}

### Search Keywords
${listing.keywords.join(', ')}

### Tags
${tags}

### Listing Quality Assessment
- **Overall Score:** ${listing.quality_score.overall_score}/100
- **SEO Score:** ${listing.quality_score.seo_score}/100
- **Readability:** ${listing.quality_score.readability_score}/100
- **Persuasiveness:** ${listing.quality_score.persuasiveness_score}/100
- **Assessment:** ${listing.quality_score.summary}

### Improvement Suggestions
${listing.improvement_suggestions.map(s => `- ${s}`).join('\n')}
`;
}

export function formatAsPlainText(listing: GeneratedListing): string {
  const bullets = listing.selling_points.map((p, i) => `${i + 1}. ${p}`).join('\n');
  const alts = listing.alternative_titles.map((t, i) => `  ${i + 1}) ${t}`).join('\n');

  return `PRODUCT LISTING: ${listing.title}
PLATFORM: ${listing.platform.toUpperCase()}
${listing.is_demo_mode ? '[NOTE: GENERATED IN DEMO MODE]\n' : ''}
PRIMARY TITLE:
${listing.title}

ALTERNATIVE TITLES:
${alts}

SUMMARY:
${listing.short_description}

KEY SELLING POINTS:
${bullets}

FULL DESCRIPTION:
${listing.full_description}

CALL TO ACTION:
${listing.call_to_action}

KEYWORDS:
${listing.keywords.join(', ')}

TAGS:
${listing.tags.join(', ')}

QUALITY SCORE: ${listing.quality_score.overall_score}/100
${listing.quality_score.summary}
`;
}

export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

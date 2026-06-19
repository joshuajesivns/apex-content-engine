// Blog article generator. Combines a category (voice + focus) with a format
// (structure + length) on top of the shared brand system prompt.
import { systemPrompt } from './brand.js';
import { slugify, titleCase } from './util.js';

export function buildPrompt(ctx) {
	const c = ctx.category;
	const f = ctx.format;
	const length = ctx.length || f.length;
	const tags = [...(c.tags || []), ...(ctx.models ? [ctx.models] : [])].join(', ');

	const optional = [
		ctx.angle ? `ANGLE — the point this proves: ${ctx.angle}` : '',
		ctx.insights ? `MY REAL INSIGHTS (use these, do not invent facts): ${ctx.insights}` : '',
		ctx.models ? `CARS TO ANCHOR / internal links: ${ctx.models}` : '',
		ctx.hooks ? `SOUTH LUZON HOOKS to include: ${ctx.hooks}` : '',
	].filter(Boolean).join('\n');

	const user = `Write a ${f.label} for the "${c.label}" category of the Apex Engine blog.

CATEGORY: ${c.label}
CATEGORY FOCUS: ${c.focus}
TONE FOR THIS CATEGORY: ${c.tone}
FORMAT / STRUCTURE: ${f.structure}
LENGTH: ${length}

TOPIC: ${ctx.topic}
${optional}

INTERNAL PAGES (link 2–5 of these EXACT paths where relevant; never invent a url):
${ctx.linkList}

FORMAT (this output becomes a Word document for review):
- First line MUST be exactly: TITLE: <SEO-optimized title>
- Then plain Markdown, no H1. Open with a short intro paragraph, then use ## for sections and ### for sub-sections.
- Suggested tags to weave in / declare: ${tags || '(add specific make/model tags)'}
- Insert internal links as [anchor](path) using ONLY the paths above, where genuinely relevant.
- Mark images on their own line: [[IMAGE: <kebab-id> | <caption> | <vivid photographic description>]] — one hero image + 1–2 supporting; unique kebab-case ids.
- No code fences. Localized for the Philippines. Hold the category tone above throughout. No AI fluff.`;

	return { system: systemPrompt(), user, temperature: 0.7 };
}

export const slug = (ctx) => slugify(ctx.topic);
export const title = (ctx) => titleCase(ctx.topic);
export const subtitle = (ctx) => `${ctx.category.label} · ${ctx.format.label} · draft for review`;
export const outSubdir = (ctx) => `blog/${ctx.category.key}`;

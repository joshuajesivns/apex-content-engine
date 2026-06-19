import { systemPrompt } from '../brand.js';
import { slugify, titleCase } from '../util.js';

const MODES = [
	{
		key: 'review',
		label: 'Technical Review',
		tone: 'Analytical, honest, data-heavy — document the machine.',
		length: '1,500–2,500 words',
		requirements: 'Include a "Quick Specs" bullet list near the top and a "Technical Verdict" section at the end.',
	},
	{
		key: 'culture',
		label: 'Culture Story',
		tone: 'Passionate, evocative, narrative-driven — heritage and soul.',
		length: '1,200–2,000 words',
		requirements: 'Lead with story and local Philippine context (touge runs, car meets, scene history).',
	},
	{
		key: 'howto',
		label: 'How-To Guide',
		tone: 'Instructive, clear, practical — safety and efficiency.',
		length: '800–1,500 words',
		requirements: 'Use numbered steps and a "Recommended Gear" section with [Product Name - Affiliate Link Placeholder] markers.',
	},
	{
		key: 'market',
		label: 'Market Insight',
		tone: 'Investigative, strategic — EVs, trends, ROI.',
		length: '1,000–1,800 words',
		requirements: 'Focus on future-proofing, cost-benefit analysis, and upcoming technology in the PH market.',
	},
];

const inputs = [
	{ key: 'topic', question: 'Topic / specific car: ', required: true },
	{ key: 'notes', question: 'Your key human insights (optional): ', required: false },
];

function buildPrompt(ctx) {
	const m = ctx.mode;
	const user = `Write a ${m.label} article for Apex Engine.
TONE: ${m.tone}
LENGTH: ${m.length}
TOPIC: ${ctx.topic}
HUMAN INSIGHTS: ${ctx.notes || '(none provided)'}

INTERNAL PAGES (link to the most relevant EXACT urls below; never invent urls):
${ctx.linkList}

FORMAT (this output becomes a Word document):
- First line MUST be exactly: TITLE: <SEO-optimized title>
- Then plain Markdown. Do NOT add an H1. Open with a short intro paragraph, then use ## for sections and ### for sub-sections.
- Insert 2–5 natural internal links as [anchor](url) using ONLY the urls listed above, and only where genuinely relevant.
- Mark images on their own line as: [[IMAGE: <kebab-id> | <caption> | <vivid photographic description for image generation>]]
  Include one hero image near the top and 1–2 supporting images; ids must be unique.
- ${m.requirements}
- No code fences. Localized for the Philippines. No AI fluff.`;
	return { system: systemPrompt(), user, temperature: 0.7 };
}

export default {
	key: 'blog',
	label: 'Editorial Blog Post',
	description: 'Long-form article with internal links + image slots.',
	modes: MODES,
	inputs,
	buildPrompt,
	slug: (ctx) => slugify(ctx.topic),
	title: (ctx) => titleCase(ctx.topic),
	subtitle: (ctx) => `${ctx.mode.label} · draft for review`,
};

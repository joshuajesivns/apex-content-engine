import { systemPrompt } from '../brand.js';
import { slugify } from '../util.js';

const inputs = [
	{ key: 'make', question: 'Make (e.g. Toyota): ', required: true },
	{ key: 'model', question: 'Model (e.g. Vios): ', required: true },
	{ key: 'notes', question: 'Angle / generation to focus on (optional): ', required: false },
];

function buildPrompt(ctx) {
	const user = `Write a Model Catalog entry for the ${ctx.make} ${ctx.model}.
NOTES: ${ctx.notes || '(none)'}

INTERNAL PAGES (link to relevant EXACT urls below — e.g. active listings of this model or related guides; never invent urls):
${ctx.linkList}

FORMAT (this output becomes a Word document):
- First line MUST be exactly: TITLE: <SEO-optimized title, e.g. "${ctx.make} ${ctx.model}: Specs, Common Issues & Buying Guide">
- Then plain Markdown, no H1.
- Begin with a "## Quick Specs" section as a bullet list with ACCURATE values:
  - Years produced, Engine, Transmission, Fuel, Seats, Body type, Category (sports/kei-truck/van/sedan/suv/pickup/hatchback), Average market price (peso range, used)
- Then these sections with ## headings:
  ## Overview
  ## Engine & Drivetrain
  ## What to Watch (Common Issues)
  ## Ownership in the Philippines  (parts availability, fuel economy, LTO/registration, resale)
  ## Verdict
- Insert 1–4 internal links as [anchor](url) using ONLY the urls above where relevant.
- Mark images on their own line as: [[IMAGE: <kebab-id> | <caption> | <vivid photographic description>]]
  Include one hero image and optionally one detail image; unique ids.
- ~800–1,400 words. No code fences. Localized for the Philippines. Technical, no fluff.`;
	return { system: systemPrompt(), user, temperature: 0.6 };
}

export default {
	key: 'models',
	label: 'Model Catalog Entry',
	description: 'Spec + buying guide for a make/model.',
	modes: null,
	inputs,
	buildPrompt,
	slug: (ctx) => slugify(`${ctx.make}-${ctx.model}`),
	title: (ctx) => `${ctx.make} ${ctx.model}`,
	subtitle: () => 'Model Catalog entry · draft for review',
};

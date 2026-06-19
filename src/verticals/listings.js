import { systemPrompt } from '../brand.js';
import { slugify } from '../util.js';

const inputs = [
	{ key: 'make', question: 'Make: ', required: true },
	{ key: 'model', question: 'Model: ', required: true },
	{ key: 'year', question: 'Year: ', required: true },
	{ key: 'notes', question: 'Condition / spec / sourcing notes (optional): ', required: false },
];

function buildPrompt(ctx) {
	const user = `Write a marketplace listing write-up for a ${ctx.year} ${ctx.make} ${ctx.model}.
NOTES: ${ctx.notes || '(none)'}

INTERNAL PAGES (link to the model catalog page or similar active listings if present; never invent urls):
${ctx.linkList}

FORMAT (this output becomes a Word document — a draft to review before it is added to inventory):
- First line MUST be exactly: TITLE: ${ctx.year} ${ctx.make} ${ctx.model}
- Then plain Markdown, no H1.
- "## Specifications" as a bullet list with realistic PH-market values:
  - Engine, Transmission, Fuel, Seats, Verified odometer (e.g. "84,200 km"), Inspection grade (e.g. "4.5 / A"), Price (in PHP, e.g. "₱1,450,000"), Category, Status (Available/Sold)
- "## Description" — a transparency-first writeup (2–4 short paragraphs): documented condition, what was inspected, standout details, honest caveats. Evidence-led, no hype.
- "## Apex Technical Audit" — bullet list of audit points (odometer, chassis/structural, mechanical, LTO/customs clearance).
- Insert 1–3 internal links as [anchor](url) using ONLY the urls above where relevant.
- Mark images on their own line as: [[IMAGE: <kebab-id> | <caption> | <vivid photographic description>]]
  Include exterior, interior, and engine-bay slots (ids: exterior, interior, engine).
- No code fences. Localized for the Philippines. No fluff.`;
	return { system: systemPrompt(), user, temperature: 0.6 };
}

export default {
	key: 'listings',
	label: 'Listing Write-up',
	description: 'Marketplace write-up + technical audit for one vehicle.',
	modes: null,
	inputs,
	buildPrompt,
	slug: (ctx) => slugify(`${ctx.year}-${ctx.make}-${ctx.model}`),
	title: (ctx) => `${ctx.year} ${ctx.make} ${ctx.model}`,
	subtitle: () => 'Listing write-up · draft for review',
};

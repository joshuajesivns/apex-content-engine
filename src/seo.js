// SEO + GEO/AEO rules. PRIORITY: be the source AI Overviews and AI assistants
// (ChatGPT, Gemini, Perplexity) CITE — not just rank in classic search.
// Add your own rules to this list; they flow into every generated article.
export const SEO_RULES = [
	'PRIMARY GOAL: be the answer AI engines cite (AI Overviews, ChatGPT, Gemini, Perplexity), not just a classic search ranking.',
	'SEO skeleton stays English: the title, meta description, URL slug, and every heading carry the primary keyword/entity in clear English.',
	'Put the primary keyword + main entity (make/model/topic) in the title AND in the first sentence.',
	'Answer-first: open the article and each section with a direct, self-contained answer in 1–2 sentences, then elaborate. AI extracts the lead.',
	'Include a "Key Takeaways" bulleted block near the top: 3–5 short, factual, standalone statements with specific numbers where possible.',
	'Write self-contained claims — each key sentence should make sense quoted on its own, out of context.',
	'Use specific, verifiable facts and numbers (PHP prices, ranges, dates). Attribute non-obvious claims to a named source.',
	'Define entities clearly and name them consistently (full model name, brand, body type, year).',
	'Add an FAQ of 3–6 real buyer questions — mix English and Tagalog phrasings (e.g. "Magkano ang ... sa Pilipinas?") — each with a concise, standalone answer.',
	'Keep paragraphs short and scannable; use lists/tables for specs and comparisons.',
];

export const seoRulesText = () => SEO_RULES.map((r, i) => `${i + 1}. ${r}`).join('\n');

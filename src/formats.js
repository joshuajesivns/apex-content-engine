// Article formats. The category sets the voice; the format sets the structure
// and length. Combine any category with any format.
export const FORMATS = [
	{
		key: 'news',
		label: 'News',
		structure: 'Short, timely news piece: what happened → why it matters locally → what to watch/do next.',
		length: '500–900 words',
	},
	{
		key: 'guide',
		label: 'Deep Guide',
		structure: 'Thorough how-to / explainer with clear ## sections and, where useful, numbered steps.',
		length: '1,200–2,000 words',
	},
	{
		key: 'review',
		label: 'Review',
		structure: 'Evaluate a specific car: Quick Specs list → drive & ownership impression → what to inspect → Verdict.',
		length: '1,200–2,000 words',
	},
	{
		key: 'list',
		label: 'List / Ranking',
		structure: 'Ranked listicle (e.g. "5 best…"): short intro → numbered entries each with a clear takeaway → closing.',
		length: '900–1,500 words',
	},
	{
		key: 'feature',
		label: 'Feature',
		structure: 'Long-form narrative: open on a scene, weave history + local context, and land a clear point.',
		length: '1,200–2,200 words',
	},
];

export const formatByKey = Object.fromEntries(FORMATS.map((f) => [f.key, f]));

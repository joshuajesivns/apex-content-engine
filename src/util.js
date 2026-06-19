export const slugify = (s) =>
	String(s)
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

export const titleCase = (s) =>
	String(s)
		.trim()
		.replace(/\s+/g, ' ')
		.replace(/\b\w/g, (c) => c.toUpperCase());

// Strip a leading ```lang fence and trailing ``` if the model wrapped output.
export const stripFences = (s) =>
	String(s)
		.replace(/^\s*```[a-z]*\s*\n/i, '')
		.replace(/\n```\s*$/i, '')
		.trim();

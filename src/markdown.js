// Minimal Markdown parser tuned for LLM output. Produces a flat block list the
// docx renderer can consume. Supported: headings, paragraphs, bullet/numbered
// lists, blockquotes, horizontal rules, inline bold/italic/links, and a custom
// image-slot syntax:  [[IMAGE: id | caption | generation prompt]]

const IMAGE_RE = /^\[\[IMAGE:\s*([^|\]]+?)\s*(?:\|\s*([^|\]]*?)\s*)?(?:\|\s*([^\]]*?)\s*)?\]\]$/i;

const slugId = (s) =>
	String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export function parseMarkdown(md) {
	const lines = String(md).replace(/\r\n/g, '\n').split('\n');
	const blocks = [];
	let para = [];

	const flush = () => {
		if (para.length) {
			blocks.push({ type: 'paragraph', runs: inlineRuns(para.join(' ')) });
			para = [];
		}
	};

	for (const raw of lines) {
		const t = raw.trim();
		if (!t) {
			flush();
			continue;
		}
		const img = t.match(IMAGE_RE);
		if (img) {
			flush();
			blocks.push({ type: 'image', id: slugId(img[1]), caption: (img[2] || '').trim(), prompt: (img[3] || '').trim() });
			continue;
		}
		if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) {
			flush();
			blocks.push({ type: 'hr' });
			continue;
		}
		const h = t.match(/^(#{1,4})\s+(.*)$/);
		if (h) {
			flush();
			blocks.push({ type: 'heading', level: h[1].length, runs: inlineRuns(h[2]) });
			continue;
		}
		const b = t.match(/^[-*]\s+(.*)$/);
		if (b) {
			flush();
			blocks.push({ type: 'bullet', runs: inlineRuns(b[1]) });
			continue;
		}
		const n = t.match(/^\d+\.\s+(.*)$/);
		if (n) {
			flush();
			blocks.push({ type: 'number', runs: inlineRuns(n[1]) });
			continue;
		}
		const q = t.match(/^>\s?(.*)$/);
		if (q) {
			flush();
			blocks.push({ type: 'quote', runs: inlineRuns(q[1]) });
			continue;
		}
		para.push(t);
	}
	flush();
	return blocks;
}

// Tokenize inline text into runs. Links are extracted first, then bold/italic.
export function inlineRuns(text) {
	const runs = [];
	let rest = String(text);
	const linkRe = /\[([^\]]+)\]\(([^)]+)\)/;
	while (rest.length) {
		const m = rest.match(linkRe);
		if (!m) {
			runs.push(...styleRuns(rest));
			break;
		}
		if (m.index > 0) runs.push(...styleRuns(rest.slice(0, m.index)));
		runs.push({ text: m[1], link: m[2].trim() });
		rest = rest.slice(m.index + m[0].length);
	}
	return runs;
}

function styleRuns(text) {
	const out = [];
	let rest = text;
	const re = /(\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_)/;
	while (rest.length) {
		const m = rest.match(re);
		if (!m) {
			if (rest) out.push({ text: rest });
			break;
		}
		if (m.index > 0) out.push({ text: rest.slice(0, m.index) });
		if (m[2] !== undefined) out.push({ text: m[2], bold: true });
		else if (m[3] !== undefined) out.push({ text: m[3], bold: true });
		else if (m[4] !== undefined) out.push({ text: m[4], italics: true });
		else if (m[5] !== undefined) out.push({ text: m[5], italics: true });
		rest = rest.slice(m.index + m[0].length);
	}
	return out;
}

// Builds an internal-link map by scanning the live Apex Engine site repo, so
// generated content can link to pages that actually exist.
import fs from 'fs';
import path from 'path';

export function buildLinkMap(siteDir, baseUrl) {
	if (!siteDir || !fs.existsSync(siteDir)) return [];
	const entries = [];

	const collections = [
		{ dir: path.join(siteDir, 'src', 'content', 'blog'), prefix: '/blog', kind: 'Blog post' },
		{ dir: path.join(siteDir, 'src', 'content', 'models'), prefix: '/models', kind: 'Model page' },
	];
	for (const { dir, prefix, kind } of collections) {
		if (!fs.existsSync(dir)) continue;
		for (const f of fs.readdirSync(dir)) {
			if (!/\.(md|mdx)$/i.test(f)) continue;
			const id = f.replace(/\.(md|mdx)$/i, '');
			const fm = readFrontmatter(path.join(dir, f));
			const label = fm.title || [fm.make, fm.model].filter(Boolean).join(' ') || id;
			entries.push({ kind, label, url: `${baseUrl}${prefix}/${id}`, keywords: keywordsFrom(label, fm) });
		}
	}

	const listingsFile = path.join(siteDir, 'src', 'data', 'listings.ts');
	if (fs.existsSync(listingsFile)) {
		const txt = fs.readFileSync(listingsFile, 'utf8');
		const re = /id:\s*'([^']+)'[\s\S]*?make:\s*'([^']+)'[\s\S]*?model:\s*'([^']+)'[\s\S]*?year:\s*(\d+)/g;
		let m;
		while ((m = re.exec(txt))) {
			const [, id, make, model, year] = m;
			entries.push({
				kind: 'Listing',
				label: `${year} ${make} ${model}`,
				url: `${baseUrl}/listings/${id}`,
				keywords: [make, model, String(year)].map((s) => s.toLowerCase()),
			});
		}
	}

	return entries;
}

function readFrontmatter(file) {
	try {
		const txt = fs.readFileSync(file, 'utf8');
		const m = txt.match(/^---\n([\s\S]*?)\n---/);
		if (!m) return {};
		const fm = {};
		for (const line of m[1].split('\n')) {
			const mm = line.match(/^(\w+):\s*(.*)$/);
			if (mm) fm[mm[1]] = mm[2].replace(/^["']|["']$/g, '').trim();
		}
		return fm;
	} catch {
		return {};
	}
}

function keywordsFrom(label, fm) {
	const words = new Set();
	for (const w of String(label).toLowerCase().split(/[^a-z0-9]+/)) if (w.length > 2) words.add(w);
	for (const k of ['make', 'model', 'category']) if (fm[k]) words.add(String(fm[k]).toLowerCase());
	return [...words];
}

// Compact list for the prompt.
export function linkMapForPrompt(entries, limit = 50) {
	return entries
		.slice(0, limit)
		.map((e) => `- ${e.url} — ${e.kind}: ${e.label}`)
		.join('\n');
}

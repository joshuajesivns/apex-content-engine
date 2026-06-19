import path from 'path';
import { complete } from './openai.js';
import { buildLinkMap, linkMapForPrompt } from './linkmap.js';
import { parseMarkdown } from './markdown.js';
import { writeDocx } from './docx.js';
import { generateImages } from './images.js';
import { getConfig } from './config.js';
import { stripFences } from './util.js';

// Orchestrates a full generation. Kept UI-agnostic so a web form can call it
// exactly like the CLI does. Returns a result object describing what happened.
export async function runGeneration(vertical, ctx, opts = {}) {
	const cfg = getConfig();

	const links = buildLinkMap(cfg.siteDir, cfg.siteUrl);
	ctx.links = links;
	ctx.linkList = links.length
		? linkMapForPrompt(links)
		: '(no site repo configured — do not invent internal links)';

	const prompt = vertical.buildPrompt(ctx);

	if (opts.dryRun) {
		return { dryRun: true, prompt, links, vertical: vertical.key };
	}

	const raw = stripFences(await complete(prompt));

	// Optional leading "TITLE: ..." line overrides the fallback title.
	let title = vertical.title(ctx);
	let body = raw;
	const tm = raw.match(/^\s*TITLE:\s*(.+?)\s*(?:\n|$)/i);
	if (tm) {
		title = tm[1].trim();
		body = raw.slice(tm[0].length);
	}

	const blocks = parseMarkdown(body);

	const slug = vertical.slug(ctx);
	const outDir = path.join(cfg.outputDir, vertical.key);
	const imgDir = path.join(cfg.outputDir, 'images', slug);

	const slots = blocks.filter((b) => b.type === 'image');
	let images = {};
	if (slots.length && !opts.noImages) {
		images = await generateImages(slots, { dir: imgDir });
		for (const b of blocks) {
			if (b.type === 'image' && images[b.id]) b._file = path.posix.join('images', slug, images[b.id]);
		}
	}

	const outPath = path.join(outDir, `${slug}.docx`);
	await writeDocx({
		title,
		subtitle: vertical.subtitle ? vertical.subtitle(ctx) : undefined,
		meta: vertical.meta ? vertical.meta(ctx) : [],
		blocks,
		outPath,
	});

	return { outPath, imgDir, images, slots, links, title, blocks, content: raw };
}

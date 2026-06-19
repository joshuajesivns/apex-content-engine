import path from 'path';
import { complete } from './openai.js';
import { buildLinkMap, linkMapForPrompt } from './linkmap.js';
import { parseMarkdown } from './markdown.js';
import { writeDocx } from './docx.js';
import { generateImages } from './images.js';
import { getConfig } from './config.js';
import { stripFences } from './util.js';
import * as blog from './blog.js';

// Generates one blog article. UI-agnostic (CLI or a future web form call it the
// same way). ctx = { category, format, topic, angle?, insights?, models?, hooks?, length? }
export async function runGeneration(ctx, opts = {}) {
	const cfg = getConfig();

	const links = buildLinkMap(cfg.siteDir, cfg.siteUrl);
	ctx.links = links;
	ctx.linkList = links.length
		? linkMapForPrompt(links)
		: '(no site repo configured — do not invent internal links)';

	const prompt = blog.buildPrompt(ctx);

	if (opts.dryRun) {
		return { dryRun: true, prompt, links };
	}

	const raw = stripFences(await complete(prompt));

	let title = blog.title(ctx);
	let body = raw;
	const tm = raw.match(/^\s*TITLE:\s*(.+?)\s*(?:\n|$)/i);
	if (tm) {
		title = tm[1].trim();
		body = raw.slice(tm[0].length);
	}

	const blocks = parseMarkdown(body);
	const slug = blog.slug(ctx);
	const outDir = path.join(cfg.outputDir, blog.outSubdir(ctx));
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
	await writeDocx({ title, subtitle: blog.subtitle(ctx), meta: [], blocks, outPath });

	return { outPath, imgDir, images, slots, links, title, blocks, content: raw };
}

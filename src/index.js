#!/usr/bin/env node
import { CATEGORIES, categoryByKey } from './categories.js';
import { FORMATS, formatByKey } from './formats.js';
import { parseArgs, ask, choose, closeCli } from './cli.js';
import { runGeneration } from './engine.js';
import { getConfig } from './config.js';

async function loadEnv() {
	try {
		await import('dotenv/config');
	} catch {
		/* dotenv optional for --dry-run */
	}
}

const INPUTS = [
	{ key: 'topic', q: 'Topic / specific subject: ', required: true },
	{ key: 'angle', q: 'Angle — the point this proves (optional): ' },
	{ key: 'insights', q: 'Your real insights / anecdotes (optional): ' },
	{ key: 'models', q: 'Cars to anchor / internal-link (optional): ' },
	{ key: 'hooks', q: 'South Luzon hooks (optional): ' },
	{ key: 'length', q: 'Length override (optional): ' },
];

function printHelp() {
	console.log(`Apex Content Engine — blog article generator.

Usage:
  node src/index.js                                          interactive
  node src/index.js --category jdm-90s --format feature --topic "Why the AE86 owns Tagaytay"
  node src/index.js --category south-luzon-roads --format guide --topic "CALAX RFID, explained" --dry-run

Categories: ${CATEGORIES.map((c) => c.key).join(', ')}
Formats:    ${FORMATS.map((f) => f.key).join(', ')}
Flags:
  --category <key>     ${CATEGORIES.map((c) => c.key).join(' | ')}
  --format <key>       ${FORMATS.map((f) => f.key).join(' | ')}
  --topic / --angle / --insights / --models / --hooks / --length
  --dry-run            build link map + prompt and print them; no API calls, no files
  --no-images          generate the doc but skip image generation
  --help
`);
}

async function pickCategory(flags) {
	if (flags.category) {
		const c = categoryByKey[flags.category];
		if (!c) throw new Error(`Unknown category "${flags.category}". Options: ${CATEGORIES.map((x) => x.key).join(', ')}`);
		return c;
	}
	const choice = await choose(
		'Which blog category?',
		CATEGORIES.map((c) => ({ key: c.key, label: `${c.label}` }))
	);
	if (!choice) throw new Error('No category selected.');
	return categoryByKey[choice.key];
}

async function pickFormat(flags) {
	if (flags.format) {
		const f = formatByKey[flags.format];
		if (!f) throw new Error(`Unknown format "${flags.format}". Options: ${FORMATS.map((x) => x.key).join(', ')}`);
		return f;
	}
	const choice = await choose(
		'Which format?',
		FORMATS.map((f) => ({ key: f.key, label: `${f.label} — ${f.length}` }))
	);
	if (!choice) throw new Error('No format selected.');
	return formatByKey[choice.key];
}

async function collectInputs(flags) {
	const ctx = {};
	for (const input of INPUTS) {
		const flagVal = flags[input.key];
		if (flagVal !== undefined && flagVal !== true) {
			ctx[input.key] = String(flagVal);
			continue;
		}
		// Non-interactive (piped / scripted): never block on a prompt.
		if (!process.stdin.isTTY) {
			if (input.required) throw new Error(`Missing required --${input.key} (non-interactive).`);
			ctx[input.key] = '';
			continue;
		}
		let val = await ask(input.q);
		while (!val && input.required) val = await ask(`  (required) ${input.q}`);
		ctx[input.key] = val;
	}
	return ctx;
}

async function main() {
	await loadEnv();
	const flags = parseArgs();
	if (flags.help || flags.h) {
		printHelp();
		return;
	}

	const cfg = getConfig();
	const dryRun = !!flags['dry-run'];

	console.log(`\n=== Apex Engine Content Engine — Blog ===`);
	console.log(`text: ${cfg.model} · image: ${cfg.imageModel} (${cfg.imageSize})`);
	console.log(`site repo: ${cfg.siteDir || '(not set — internal links disabled)'}`);
	console.log(`output dir: ${cfg.outputDir}/`);

	const category = await pickCategory(flags);
	const format = await pickFormat(flags);
	const inputs = await collectInputs(flags);
	const ctx = { ...inputs, category, format };

	if (!dryRun && !process.env.OPENAI_API_KEY) {
		throw new Error('OPENAI_API_KEY is not set. Add it to .env, or use --dry-run to preview without calling the API.');
	}

	const opts = { dryRun, noImages: !!flags['no-images'] };

	if (dryRun) {
		const r = await runGeneration(ctx, opts);
		console.log(`\n--- DRY RUN (no API calls, no files written) ---`);
		console.log(`Category: ${category.label}  ·  Format: ${format.label}`);
		console.log(`Internal link candidates found: ${r.links.length}`);
		console.log(`\n[SYSTEM PROMPT]\n${r.prompt.system}`);
		console.log(`\n[USER PROMPT]\n${r.prompt.user}\n`);
		closeCli();
		return;
	}

	console.log(`\nGenerating ${category.label} (${format.label})… this can take a moment.`);
	const r = await runGeneration(ctx, opts);
	console.log(`\n✅ Word doc written:\n   ${r.outPath}`);
	if (r.slots.length) {
		if (opts.noImages) console.log(`🖼  ${r.slots.length} image slot(s) left as placeholders (--no-images).`);
		else console.log(`🖼  ${Object.keys(r.images).length}/${r.slots.length} image(s) saved to:\n   ${r.imgDir}`);
	}
	if (r.links.length) console.log(`🔗 internal link map: ${r.links.length} pages available to the model.`);
	closeCli();
}

main().catch((e) => {
	console.error(`\n❌ ${e.message}`);
	closeCli();
	process.exit(1);
});

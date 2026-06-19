#!/usr/bin/env node
import { VERTICALS, byKey } from './verticals/index.js';
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

function printHelp() {
	console.log(`Apex Content Engine — AI content generator for every Apex Engine vertical.

Usage:
  node src/index.js                                   interactive
  node src/index.js --vertical blog --mode review --topic "Toyota Vios 2018"
  node src/index.js --vertical models --make Toyota --model Innova
  node src/index.js --vertical listings --make Nissan --model "Skyline GT-R" --year 1999

Verticals: ${VERTICALS.map((v) => v.key).join(', ')}
Flags:
  --vertical <key>     blog | models | listings
  --mode <key>         blog only: review | culture | howto | market
  --<input> <value>    provide an input non-interactively (topic, make, model, year, notes)
  --dry-run            build link map + prompt and print them; no API calls, no files
  --no-images          generate the doc but skip image generation
  --help               this message
`);
}

async function pickVertical(flags) {
	if (flags.vertical) {
		const v = byKey[flags.vertical];
		if (!v) throw new Error(`Unknown vertical "${flags.vertical}". Options: ${VERTICALS.map((x) => x.key).join(', ')}`);
		return v;
	}
	const choice = await choose(
		'Which Apex Engine vertical?',
		VERTICALS.map((v) => ({ key: v.key, label: `${v.label} — ${v.description}` }))
	);
	if (!choice) throw new Error('No vertical selected.');
	return byKey[choice.key];
}

async function pickMode(vertical, flags) {
	if (!vertical.modes) return null;
	if (flags.mode) {
		const m = vertical.modes.find((x) => x.key === flags.mode);
		if (!m) throw new Error(`Unknown mode "${flags.mode}". Options: ${vertical.modes.map((x) => x.key).join(', ')}`);
		return m;
	}
	const choice = await choose(
		`Select a ${vertical.label} mode:`,
		vertical.modes.map((m) => ({ key: m.key, label: `${m.label} — ${m.tone}` }))
	);
	if (!choice) throw new Error('No mode selected.');
	return vertical.modes.find((m) => m.key === choice.key);
}

async function collectInputs(vertical, flags) {
	const ctx = {};
	for (const input of vertical.inputs) {
		const flagVal = flags[input.key];
		if (flagVal !== undefined && flagVal !== true) {
			ctx[input.key] = String(flagVal);
			continue;
		}
		let val = await ask(input.question);
		while (!val && input.required) val = await ask(`  (required) ${input.question}`);
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

	console.log(`\n=== Apex Engine Content Engine ===`);
	console.log(`text: ${cfg.model} · image: ${cfg.imageModel} (${cfg.imageSize})`);
	console.log(`site repo: ${cfg.siteDir || '(not set — internal links disabled)'}`);
	console.log(`output dir: ${cfg.outputDir}/`);

	const vertical = await pickVertical(flags);
	const mode = await pickMode(vertical, flags);
	const inputs = await collectInputs(vertical, flags);
	const ctx = { ...inputs, mode };

	if (!dryRun && !process.env.OPENAI_API_KEY) {
		throw new Error('OPENAI_API_KEY is not set. Add it to .env, or use --dry-run to preview without calling the API.');
	}

	const opts = { dryRun, noImages: !!flags['no-images'] };

	if (dryRun) {
		const r = await runGeneration(vertical, ctx, opts);
		console.log(`\n--- DRY RUN (no API calls, no files written) ---`);
		console.log(`Vertical: ${vertical.key}${mode ? ` · mode: ${mode.key}` : ''}`);
		console.log(`Internal link candidates found: ${r.links.length}`);
		console.log(`\n[SYSTEM PROMPT]\n${r.prompt.system}`);
		console.log(`\n[USER PROMPT]\n${r.prompt.user}\n`);
		closeCli();
		return;
	}

	console.log(`\nGenerating ${vertical.label}${mode ? ` (${mode.label})` : ''}… this can take a moment.`);
	const r = await runGeneration(vertical, ctx, opts);
	console.log(`\n✅ Word doc written:\n   ${r.outPath}`);
	if (r.slots.length) {
		if (opts.noImages) {
			console.log(`🖼  ${r.slots.length} image slot(s) left as placeholders (--no-images).`);
		} else {
			console.log(`🖼  ${Object.keys(r.images).length}/${r.slots.length} image(s) saved to:\n   ${r.imgDir}`);
		}
	}
	if (r.links.length) console.log(`🔗 internal link map: ${r.links.length} pages available to the model.`);
	closeCli();
}

main().catch((e) => {
	console.error(`\n❌ ${e.message}`);
	closeCli();
	process.exit(1);
});

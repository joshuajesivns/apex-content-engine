import fs from 'fs';
import path from 'path';
import { getClient } from './openai.js';
import { getConfig } from './config.js';

function framedPrompt(p) {
	return `Professional automotive editorial photograph for a Philippine car publication. ${p}. Realistic, high detail, natural lighting, sharp focus, no text, no watermark, no logos.`;
}

// slots: [{ id, caption, prompt }] -> { [id]: filename }
export async function generateImages(slots, { dir }) {
	const cfg = getConfig();
	const client = await getClient();
	const results = {};
	fs.mkdirSync(dir, { recursive: true });

	for (const slot of slots) {
		const basePrompt = slot.prompt || slot.caption || slot.id;
		try {
			const res = await client.images.generate({
				model: cfg.imageModel,
				prompt: framedPrompt(basePrompt),
				size: cfg.imageSize,
				n: 1,
			});
			const item = res.data?.[0] || {};
			const file = `${slot.id}.png`;
			const dest = path.join(dir, file);
			if (item.b64_json) {
				fs.writeFileSync(dest, Buffer.from(item.b64_json, 'base64'));
				results[slot.id] = file;
			} else if (item.url) {
				const resp = await fetch(item.url);
				fs.writeFileSync(dest, Buffer.from(await resp.arrayBuffer()));
				results[slot.id] = file;
			}
		} catch (e) {
			console.error(`  ! image "${slot.id}" failed: ${e.message}`);
		}
	}
	return results;
}

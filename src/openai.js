// OpenAI wrappers. The SDK is imported lazily so --dry-run works without the
// package present and without an API key.
import { getConfig } from './config.js';

let _client;
export async function getClient() {
	if (!_client) {
		const { default: OpenAI } = await import('openai');
		_client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
	}
	return _client;
}

export async function complete({ system, user, temperature = 0.7, json = false }) {
	const client = await getClient();
	const res = await client.chat.completions.create({
		model: getConfig().model,
		messages: [
			...(system ? [{ role: 'system', content: system }] : []),
			{ role: 'user', content: user },
		],
		temperature,
		...(json ? { response_format: { type: 'json_object' } } : {}),
	});
	return res.choices[0].message.content;
}

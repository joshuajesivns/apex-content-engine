import { BRAND } from './brand.js';

export function getConfig() {
	return {
		siteDir: (process.env.APEX_SITE_DIR || '').trim(),
		siteUrl: (process.env.APEX_SITE_URL || BRAND.website).replace(/\/+$/, ''),
		outputDir: (process.env.APEX_OUTPUT_DIR || 'output').trim() || 'output',
		model: process.env.APEX_MODEL || 'gpt-4o',
		imageModel: process.env.APEX_IMAGE_MODEL || 'gpt-image-1',
		imageSize: process.env.APEX_IMAGE_SIZE || '1024x1024',
		brand: BRAND,
	};
}

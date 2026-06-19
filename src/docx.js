import fs from 'fs';
import path from 'path';
import {
	Document,
	Packer,
	Paragraph,
	TextRun,
	HeadingLevel,
	ExternalHyperlink,
	AlignmentType,
	BorderStyle,
} from 'docx';

const HEADINGS = {
	1: HeadingLevel.HEADING_1,
	2: HeadingLevel.HEADING_2,
	3: HeadingLevel.HEADING_3,
	4: HeadingLevel.HEADING_4,
};

const ACCENT = 'C8102E'; // Apex red

function runsToChildren(runs) {
	return runs.map((r) => {
		if (r.link) {
			return new ExternalHyperlink({
				link: r.link,
				children: [new TextRun({ text: r.text, style: 'Hyperlink' })],
			});
		}
		return new TextRun({ text: r.text, bold: !!r.bold, italics: !!r.italics });
	});
}

export function blocksToParagraphs(blocks) {
	const out = [];
	for (const b of blocks) {
		if (b.type === 'heading') {
			out.push(new Paragraph({ heading: HEADINGS[b.level] || HeadingLevel.HEADING_4, children: runsToChildren(b.runs) }));
		} else if (b.type === 'paragraph') {
			out.push(new Paragraph({ spacing: { after: 160 }, children: runsToChildren(b.runs) }));
		} else if (b.type === 'bullet') {
			out.push(new Paragraph({ bullet: { level: 0 }, children: runsToChildren(b.runs) }));
		} else if (b.type === 'number') {
			out.push(new Paragraph({ numbering: { reference: 'apex-numbering', level: 0 }, children: runsToChildren(b.runs) }));
		} else if (b.type === 'quote') {
			out.push(
				new Paragraph({
					children: runsToChildren(b.runs),
					indent: { left: 360 },
					spacing: { before: 120, after: 120 },
					border: { left: { style: BorderStyle.SINGLE, size: 18, color: ACCENT, space: 12 } },
				})
			);
		} else if (b.type === 'hr') {
			out.push(new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '999999', space: 8 } } }));
		} else if (b.type === 'image') {
			const children = [new TextRun({ text: `[ IMAGE: ${b.id} ]`, bold: true, color: ACCENT })];
			if (b.caption) children.push(new TextRun({ text: `  ${b.caption}`, italics: true }));
			if (b._file) children.push(new TextRun({ text: ` → generated: ${b._file}`, color: '666666', size: 18 }));
			else if (b.prompt) children.push(new TextRun({ text: ` (prompt: ${b.prompt})`, color: '999999', size: 18 }));
			out.push(new Paragraph({ shading: { type: 'clear', color: 'auto', fill: 'F2F2F2' }, spacing: { before: 160, after: 160 }, children }));
		}
	}
	return out;
}

export async function writeDocx({ title, subtitle, meta = [], blocks, outPath }) {
	const children = [];
	if (title) children.push(new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: title })] }));
	if (subtitle) children.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: subtitle, italics: true, color: '666666' })] }));
	for (const line of meta) {
		children.push(new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: line, color: '666666', size: 18 })] }));
	}
	if (meta.length) children.push(new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '999999', space: 8 } } }));
	children.push(...blocksToParagraphs(blocks));

	const doc = new Document({
		numbering: {
			config: [
				{
					reference: 'apex-numbering',
					levels: [{ level: 0, format: 'decimal', text: '%1.', alignment: AlignmentType.START, style: { paragraph: { indent: { left: 360, hanging: 260 } } } }],
				},
			],
		},
		sections: [{ children }],
	});

	const buf = await Packer.toBuffer(doc);
	fs.mkdirSync(path.dirname(outPath), { recursive: true });
	fs.writeFileSync(outPath, buf);
	return outPath;
}

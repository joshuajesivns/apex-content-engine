import readline from 'readline';

// --key value | --key=value | --flag (boolean)
export function parseArgs(argv = process.argv.slice(2)) {
	const flags = {};
	for (let i = 0; i < argv.length; i++) {
		let a = argv[i];
		if (!a.startsWith('--')) continue;
		a = a.slice(2);
		if (a.includes('=')) {
			const [k, ...rest] = a.split('=');
			flags[k] = rest.join('=');
		} else {
			const next = argv[i + 1];
			if (next === undefined || next.startsWith('--')) {
				flags[a] = true;
			} else {
				flags[a] = next;
				i++;
			}
		}
	}
	return flags;
}

let rl;
function getRl() {
	if (!rl) rl = readline.createInterface({ input: process.stdin, output: process.stdout });
	return rl;
}

export function ask(query) {
	return new Promise((resolve) => getRl().question(query, (a) => resolve(a.trim())));
}

// options: [{ key, label }] -> returns the chosen option or null
export async function choose(label, options) {
	console.log(`\n${label}`);
	options.forEach((o, i) => console.log(`  ${i + 1}. ${o.label}`));
	const ans = await ask(`Enter number (1-${options.length}): `);
	const idx = parseInt(ans, 10) - 1;
	return options[idx] || null;
}

export function closeCli() {
	if (rl) {
		rl.close();
		rl = null;
	}
}

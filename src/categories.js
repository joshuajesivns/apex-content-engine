// Blog content categories (pillars). Each carries its own tone + focus + default
// tags, drawn from the brand identity in brand.js. Add a category by appending
// an entry here — nothing else needs to change.
export const CATEGORIES = [
	{
		key: 'jdm-90s',
		label: '90s JDM & Classics',
		tags: ['JDM', 'Classics'],
		tone: '"Street," authentic, enthusiast-driven. Speak the language of car culture — heritage, builds, late-night runs.',
		focus: 'Heritage, the build/mod scene, why the machine still matters, and the local enthusiast community around it.',
	},
	{
		key: 'daily-2000s',
		label: '2000s Daily Drivers',
		tags: ['Daily Driver'],
		tone: 'Practical, friendly, appreciative — these are the backbone of Filipino families and commutes.',
		focus: 'Real-world value, total cost of ownership, reliability, PH parts availability, and used-buying advice.',
	},
	{
		key: 'south-luzon-roads',
		label: 'South Luzon Roads & Commuting',
		tags: ['South Luzon', 'Commuting'],
		tone: 'Practical and actionable, never a complaint. Apply the pain-points playbook: THE REALITY → THE ROUTE → THE FIX.',
		focus: 'Tollways (SLEX, STAR, MCX, CALAX), RFID, monsoon flooding chokepoints, local enforcement (NCAP, window hours).',
	},
	{
		key: 'ev-upcoming',
		label: 'EVs & Upcoming Cars',
		tags: ['EV', 'Hybrid'],
		tone: 'Optimistic, forward-looking, genuinely excited — while keeping respect for internal combustion.',
		focus: 'New tech and models, hybrid/PHEV/BEV, efficiency, and the growth of CALABARZON charging infrastructure.',
	},
	{
		key: 'buying-ownership',
		label: 'Buying & Ownership Guides',
		tags: ['Buying Guide', 'Ownership'],
		tone: 'Brutally honest, transparent, educational — the marketplace promise.',
		focus: 'How to inspect a unit, spot hidden defects, decode dealer jargon, avoid lemons, and judge real value for money.',
	},
];

export const categoryByKey = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]));

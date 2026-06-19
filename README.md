# Apex Content Engine

An AI **blog article** generator for Apex Engine. You pick a **category** (which
sets the voice & focus) and a **format** (which sets the structure & length),
give it a topic, and it produces a **Word-doc draft** with internal links and
image slots — ready to review before it goes up on the site.

Brand identity, tone, and NAP are fixed in `src/brand.js` (single brand). The
pipeline lives in `src/engine.js`, decoupled from the CLI so a web form can wrap
it later.

> This tool is **blog/article generation only.** (Model-catalog and listing
> generation were removed — the engine is focused on the blog.)

## Setup

```bash
npm install
cp .env.example .env        # then edit .env
```

Key `.env` values:
- `OPENAI_API_KEY` — required to generate (not needed for `--dry-run`)
- `APEX_SITE_DIR` — absolute path to the website repo (the `apex-engine` folder).
  Enables internal linking by scanning its blog/model/listing pages.
- `APEX_SITE_URL`, `APEX_MODEL`, `APEX_IMAGE_MODEL`, `APEX_IMAGE_SIZE` — optional

## Usage

```bash
# Interactive — pick category, then format, then answer prompts
npm run generate

# Non-interactive (scriptable)
node src/index.js --category jdm-90s --format feature --topic "Why the AE86 still owns Tagaytay"
node src/index.js --category south-luzon-roads --format guide  --topic "CALAX RFID, explained"
node src/index.js --category ev-upcoming --format news --topic "BYD Sealion 6 lands in PH"

# Preview the prompt + internal-link map without spending tokens
node src/index.js --category buying-ownership --format guide --topic "How to inspect a used Vios" --dry-run

# Generate the doc but skip images
node src/index.js --category daily-2000s --format review --topic "2008 Honda City review" --no-images
```

## Categories (set the voice)

| key | category | voice |
|-----|----------|-------|
| `jdm-90s` | 90s JDM & Classics | "Street," authentic, enthusiast |
| `daily-2000s` | 2000s Daily Drivers | Practical, appreciative, value-led |
| `south-luzon-roads` | South Luzon Roads & Commuting | Actionable — Reality → Route → Fix |
| `ev-upcoming` | EVs & Upcoming Cars | Optimistic, forward-looking |
| `buying-ownership` | Buying & Ownership Guides | Brutally honest, educational |
| `pms-maintenance` | PMS & Maintenance Guides | Simple, friendly, demystifying |

Add or rename one by editing `src/categories.js` — nothing else changes.

## Formats (set the structure)

| key | format | length |
|-----|--------|--------|
| `news` | News | 500–900 words |
| `guide` | Deep Guide | 1,200–2,000 words |
| `review` | Review | 1,200–2,000 words |
| `list` | List / Ranking | 900–1,500 words |
| `feature` | Feature | 1,200–2,200 words |

Edit `src/formats.js` to adjust.

## Output

```
output/
  blog/<category>/<slug>.docx     # the draft, filed under its category
  images/<slug>/<image-id>.png    # one per image slot in the doc
```

Internal links become real hyperlinks; image slots are labeled placeholders with
the matching generated `.png` saved alongside for you to place.

## Also in this repo (Claude-run builders)

If you'd rather generate **through Claude** (no API key) and get site-ready MDX:
- `prompts/blog-prompt-builder.md` — fill the inputs, ask Claude to "run the blog builder"
- `docs/index.html` — a self-contained form that assembles the prompt to paste into Claude.
  Published via GitHub Pages: **https://joshuajesivns.github.io/apex-content-engine/**

Both use the same categories, formats, and brand voice.

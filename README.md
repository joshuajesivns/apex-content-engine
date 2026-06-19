# Apex Content Engine

A standalone AI content generator for **every Apex Engine vertical** — editorial
blog posts, model catalog entries, and marketplace listing write-ups.

Each run produces a **Word document** (for review/approval), generates **images
separately** into an output folder, and **auto-inserts internal links** to real
pages on the live site. Brand identity, tone, and NAP are fixed in
`src/brand.js` (single brand — edit there).

> CLI today; the generation logic lives in `src/engine.js`, decoupled from the
> CLI so a web form can wrap it next without rewriting anything.

## Setup

```bash
npm install
cp .env.example .env        # then edit .env
```

Set in `.env`:

- `OPENAI_API_KEY` — required to generate (not needed for `--dry-run`)
- `APEX_SITE_DIR` — absolute path to the website repo (e.g. the `southshift`
  folder). Enables internal linking by scanning its blog/model/listing pages.
- `APEX_SITE_URL` — public base URL for the internal hyperlinks
- `APEX_MODEL` / `APEX_IMAGE_MODEL` / `APEX_IMAGE_SIZE` — optional overrides

## Usage

```bash
# Interactive — pick a vertical, then answer prompts
npm run generate

# Non-interactive (scriptable for daily/batch runs)
node src/index.js --vertical blog --mode review --topic "2018 Toyota Vios ownership review"
node src/index.js --vertical models --make Toyota --model Innova
node src/index.js --vertical listings --make Nissan --model "Skyline GT-R" --year 1999

# Preview the exact prompt + internal-link map without spending tokens
node src/index.js --vertical blog --mode market --topic "EVs in South Luzon" --dry-run

# Generate the doc but skip images
node src/index.js --vertical models --make Honda --model Civic --no-images
```

## Verticals

| Vertical   | Modes                                   | Produces |
|------------|-----------------------------------------|----------|
| `blog`     | review · culture · howto · market       | Long-form article |
| `models`   | —                                       | Quick Specs + buying guide |
| `listings` | —                                       | Specs + description + technical audit |

## Output

```
output/
  blog/<slug>.docx
  models/<slug>.docx
  listings/<slug>.docx
  images/<slug>/<image-id>.png      # one per image slot in the doc
```

- **Internal links** appear as real hyperlinks in the Word doc, pointing at
  existing pages found in the site repo (`/blog/…`, `/models/…`, `/listings/…`).
- **Image slots** are written into the doc as labeled placeholders
  (`[ IMAGE: hero ] …`) and the matching generated `.png` is saved under
  `output/images/<slug>/` for you to place manually.

## How it works

`src/engine.js` runs the pipeline: build the internal-link map from the site
repo → build the vertical's prompt → call the text model → parse the Markdown →
generate images for each slot → render the `.docx`.

Adding a vertical = drop a module in `src/verticals/` exporting
`{ key, label, description, modes, inputs, buildPrompt, slug, title }` and
register it in `src/verticals/index.js`.

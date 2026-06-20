# Apex Engine — Blog Content Prompt Builder

A fill-in template you run **through Claude** (no API key needed). Fill the
`INPUTS` block, tell Claude "run the blog builder," and it returns a site-ready
**MDX draft** you can drop into `apex-engine/src/content/blog/`.

You choose a **category** (sets the voice & focus) and a **format** (sets the
structure & length).

---

## ▶ INPUTS (fill these, then ask Claude to run)

```yaml
category:    # jdm-90s | daily-2000s | south-luzon-roads | ev-upcoming | buying-ownership | pms-maintenance
format:      # news | guide | review | list | feature
topic:       # the specific car / subject, e.g. "CALAX RFID transition explained"
angle:       # the one thing this piece argues or proves
insights:    # YOUR human takeaways — ownership notes, prices seen, real anecdotes
models:      # car make/model(s) to anchor internal links, e.g. Toyota Vios
local_hooks: # South Luzon specifics to weave in (routes, floods, meets, prices) — optional
length:      # optional override; otherwise use the format default
```

---

## 🎙 Brand voice (the basis — keep in sync with `src/brand.js`)

Write as **Apex Engine**: the South-Luzon-meet hybrid of the friendly road-trip
neighbor + the tech-savvy younger brother. A trusted peer at eye level, talking
over coffee at a gas-station pitstop — never lecturing from an editorial tower.
Relatable, nostalgic but forward-looking, grounded in everyday reality.

- **Language (English-led Taglish):** the **English sentence carries the meaning**;
  Tagalog enters only as **complete, natural phrases** — emphasis tails (*lalo na
  dito sa South Luzon*), connectors (*pero, kasi, kaya, diba*), casual asides.
  **Never** translate a whole English statement into Tagalog (keep "This is already
  happening," not "nangyayari na talaga ito"). Mostly English, hindi corny. Keep
  **title, meta, slug, and headings in keyword-first English**; technical terms,
  model names, and numbers stay as-is.
- **Region first:** filter through CALABARZON (Cavite, Laguna, Batangas, Rizal,
  Quezon) — "what does this mean for a driver here today?"
- **Pain-points playbook:** for road/commuting issues, answer **Reality → Route
  → Fix.** Actionable, never a complaint.
- **ICE vs EV:** optimistic about EV/Hybrid/PHEV *and* in love with internal
  combustion. No gatekeeping.
- **Transparency core:** value-for-money first. Teach readers to inspect cars,
  spot defects, decode dealer jargon, avoid lemons. Reliability is a relationship.
- **Don't:** AI fluff ("In the world of…", "crucial", "game changer", "in
  conclusion", "elevate", "unleash"), salesman hype, generic filler.

---

## 🗂 Categories (pick one — it sets the voice & focus)

| category | voice | focus |
|----------|-------|-------|
| `jdm-90s` | "Street," authentic, enthusiast | Heritage, builds, why it still matters, the local scene |
| `daily-2000s` | Practical, appreciative | Value, cost of ownership, reliability, used-buying |
| `south-luzon-roads` | Actionable (Reality → Route → Fix) | Tolls (SLEX/STAR/MCX/CALAX), RFID, floods, NCAP |
| `ev-upcoming` | Optimistic, forward-looking | New tech/models, hybrids, efficiency, charging infra |
| `buying-ownership` | Brutally honest, educational | Inspecting units, spotting defects, dealer jargon, value |
| `pms-maintenance` | Simple, friendly, demystifying | PMS intervals, casa vs DIY, fluids/filters/brakes, peso costs |

## 🧱 Formats (pick one — it sets the structure)

| format | structure | length |
|--------|-----------|--------|
| `news` | What happened → why it matters locally → what to watch next | 500–900 words |
| `guide` | Thorough how-to/explainer, clear sections, numbered steps where useful | 1,200–2,000 words |
| `review` | Quick Specs → drive & ownership → what to inspect → Verdict | 1,200–2,000 words |
| `list` | Ranked listicle: intro → numbered entries with takeaways → closing | 900–1,500 words |
| `feature` | Long-form narrative: open on a scene, weave history + local context | 1,200–2,200 words |

For a `review`, also `import VehicleSpecCard from '../../components/VehicleSpecCard.astro';`
and include one `<VehicleSpecCard data={{ ... }} />`.

---

## 📤 Output format (site-ready MDX)

Return **only** the MDX (no code fences around it), in this shape:

```mdx
---
title: "SEO-optimized title"
description: "1–2 sentence meta description"
pubDate: "Month DD, YYYY"
heroImage: "../../assets/blog-placeholder-1.jpg"
tags: ["<category tags>", "Make", "Make Model"]
faq:
  - q: "A real buyer question (mix English + Tagalog, e.g. Magkano ang ... sa Pilipinas?)"
    a: "Concise, standalone, English-led answer."
---

import { Figure, Split, Gallery, Pullquote } from '../../components/editorial';
import img1 from '../../assets/blog-placeholder-2.jpg';
import img2 from '../../assets/blog-placeholder-3.jpg';

Short, punchy intro in the brand voice — state the main answer + primary keyword in the first sentence (no H1; the layout adds it).

## Key Takeaways
- 3–5 short, factual, standalone bullets (with numbers where possible).

<Figure src={img1} width="full" caption="..." credit="Apex Engine" />
{/* TODO: replace placeholder with a real photo in src/assets/blog/ */}

## Section heading
Body... with an internal link like [the Vios catalog page](/models/toyota-vios).

<Split image={img2} side="right">
Pair an image with analysis. Alternate side.
</Split>
{/* TODO: replace placeholder with a real photo in src/assets/blog/ */}

## Closing
...
```

**Rules (AI-Overview priority):**
- **Apply the chosen category's voice + the format's structure.**
- **Answer-first:** open the article and each section with a direct, self-contained answer, then elaborate.
- **Key Takeaways:** a `## Key Takeaways` bullet block right after the intro (3–5 factual, standalone points).
- **FAQ:** 3–6 Q&A pairs in the `faq:` frontmatter (mix English + Tagalog questions). The site renders them as a visible FAQ **and** FAQPage schema automatically.
- **Tags:** include the category's default tags plus specific make/model tags.
- **Internal links:** real existing paths only. Before running, scan
  `apex-engine/src/content/blog`, `…/models`, and `src/data/listings.ts`; link
  `/blog/<id>`, `/models/<id>`, `/listings/<id>`. 2–5 where relevant. Never invent.
- **Images:** one full-width hero + 1–2 supporting `Figure`/`Split`, each followed
  by the `{/* TODO… */}` marker. Use `Gallery` for 3+ angles.
- `pubDate` = today's date. Localize everything for the Philippines.

---

## ✅ Quality checklist (Claude self-checks before returning)

- [ ] Voice matches the chosen **category**; structure matches the chosen **format**
- [ ] Reads like a trusted peer at eye level, not a brand or a salesman
- [ ] At least one concrete South Luzon hook (route, flood point, price, meet)
- [ ] Transparency: at least one "what to inspect / how to verify" moment
- [ ] 2–5 real internal links; zero invented URLs
- [ ] Specific numbers/evidence, zero AI-fluff phrases
- [ ] Valid MDX: frontmatter + imports resolve, components used correctly

---

## 🏁 Run command

> "Run the blog builder with the INPUTS above."

Claude scans the site for link targets, generates the draft, runs the checklist,
and returns the MDX. Save it as `apex-engine/src/content/blog/<slug>.mdx`, swap
the placeholder images, and push.

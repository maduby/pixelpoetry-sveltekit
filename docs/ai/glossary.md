# Glossary

## Platform

| Term | Definition |
|------|------------|
| **Explainer** | A self-contained scrollytelling essay living at `/explainers/<slug>` with its own chapters, sources, terms and image manifest under `src/lib/explainers/<slug>/`. |
| **Active explainer** | The explainer registered in the Svelte context by the currently rendered route. Shared components (Nav, ProgressBar, viz, SourceSheet) read from this context. |
| **Skill** | A Cursor instruction module under `.cursor/skills/<name>/SKILL.md` that auto-loads when the user prompt matches its description. Skills automate recurring authoring tasks on this codebase. |
| **Scrollytelling** | Editorial format where the user scrolls through a long-form narrative while pinned visualisations advance based on scroll position. |
| **ScrollTrigger** | GSAP plugin (free since 2024) that maps scroll position to animation timelines, supports pinning, snapping, and scrubbing. |
| **Pin (scrolly term)** | Holding an element fixed in the viewport while the user continues to scroll, so animations can scrub through. |
| **Scrub** | Tying an animation's progress directly to scroll position (1:1) rather than playing on a trigger. |
| **`@attach` (Svelte 5)** | Replacement for `use:` actions; runs in an effect, supports cleanup, fully reactive. |
| **Runes** | Svelte 5's new reactivity primitives: `$state`, `$derived`, `$effect`, `$props`, `$bindable`. |

## Ultra-Processed essay terms

| Term | Definition |
|------|------------|
| **UPF** | Ultra-processed food. NOVA Group 4: industrial formulations containing ingredients not used in normal kitchens (e.g. modified starches, hydrolysed proteins, emulsifiers, artificial flavours). |
| **NOVA classification** | Four-group food classification developed at the University of São Paulo (Monteiro et al., 2009). Groups 1–4: unprocessed, processed culinary ingredients, processed foods, ultra-processed foods. |
| **Kitchen test** | Van Tulleken's heuristic: if an ingredient on the packet isn't something you'd find in a home kitchen, it's a UPF marker. |
| **GRAS** | Generally Recognised As Safe. US FDA self-certification system since 1997 that lets food companies decide whether their own new additives are safe. |
| **BMJ umbrella review (2024)** | Lane et al., *BMJ* 384:e077310. Pooled analysis of 9.9 million participants linking UPF to 32 adverse health outcomes. The canonical evidence base for this project. |
| **The Lancet UPF Series (2025)** | Three-paper series synthesising the policy + epidemiology case against UPF. |
| **Bliss point** | Term coined by food scientist Howard Moskowitz for the precise fat/sugar/salt mix that maximises consumer "want" without triggering satiation. |
| **Commerciogenic disease** | Van Tulleken's reframing of obesity — a disease manufactured by an unregulated commercial industry, not a personal failing. |
| **Hyper-palatability** | Industrial property of UPF: engineered fat/salt/sugar/texture combinations that override normal fullness signalling. |
| **Class I / Class II evidence** | Evidence-grading scale used in umbrella reviews. Class I = "convincing", Class II = "highly suggestive". |

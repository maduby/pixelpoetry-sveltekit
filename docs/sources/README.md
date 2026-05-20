# Sources

> Drop research material for a new explainer **here-first**, not into `docs/explainers/<slug>/sources/`.

This top-level folder is the **inbox** for raw research before it's been triaged into an explainer.

## Workflow

1. Drop PDFs, articles, screenshots, transcripts, datasets — whatever you've got — anywhere under this folder. Subfolders by topic are fine but not required.
2. When you know which explainer the material belongs to, move it to `docs/explainers/<slug>/sources/`. Create the explainer scaffolding first if it doesn't exist — see the `scaffold-explainer` skill.
3. Run the `source-extraction` skill on the explainer-specific `sources/` folder to produce `docs/explainers/<slug>/facts.md` (structured research compendium) and `docs/explainers/<slug>/scrollytelling-facts.md` (curated beats with hero stats, quotes, and viz suggestions).
4. Use the `story-concept` skill to turn that into a chapter arc.

## Gitignore

PDFs are kept out of git by default (`docs/**/sources/**.pdf` is ignored in `.gitignore`) — they can be large and are often copyrighted. The `.gitkeep` files are tracked so the directory structure survives.

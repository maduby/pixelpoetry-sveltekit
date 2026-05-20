# Longevity — Research Inbox

> Status: **planned** — sources being gathered.

This is the source-drop folder for the upcoming Pixel Poetry explainer on longevity. The plan:

1. Drop primary sources (PDFs, articles, transcripts, datasets, podcast notes) into [`sources/`](./sources/).
2. Run the `source-extraction` skill to produce `facts.md` and `scrollytelling-facts.md` next to this file.
3. Run the `story-concept` skill to draft a chapter arc.
4. Run the `scaffold-explainer` skill (slug: `longevity`) to wire the route, lib folder, image manifest stub, and add the entry to `src/lib/data/explainers.ts`.
5. Iterate using the `add-chapter` and `pick-viz` skills.

## Working title

To be determined — see `meta.ts` once scaffolded.

## Source ideas (placeholder)

- Peter Attia, _Outlive_ (2023)
- The Blue Zones research — Buettner et al.
- The MR-BASE Mendelian randomisation database
- UK Biobank longevity cohorts
- Bryan Johnson / Don't Die — sample of n=1 protocol journalism
- Latest reviews on rapamycin, metformin, GLP-1s, and senolytics
- Government datasets: ONS life-expectancy tables (UK), CDC mortality (US), Global Burden of Disease

_(Replace this list with your actual source set as you drop files in.)_

---
name: build-images
description: Walk through adding new source images to an explainer and regenerating its responsive image manifest via `scripts/build-images.mjs`. Use when the user says "process images", "rebuild image manifest", "add a hero photo", "new image for chapter X", or after a designer drops files into `static/explainers/<slug>/images/`.
---

# Build Images

The image pipeline produces three things for every source image:

1. A short **blurhash** placeholder (decoded to a 32×32 canvas → blurred, used as LQIP).
2. Responsive **WebP variants** at 400w / 800w / 1200w.
3. A typed entry in `src/lib/explainers/<slug>/image-manifest.ts` — referenced by `<ImageChart name="..." />`.

`scripts/build-images.mjs` walks every `static/explainers/<slug>/images/` directory and writes one manifest per essay. Re-run it after adding or replacing originals.

## When to run

- Adding a new hero/inline image to a chapter.
- Replacing or re-cropping an existing image.
- Scaffolding a brand-new explainer with images already on disk.

## Workflow

```
- [ ] 1. Pick the right slug. Drop originals into static/explainers/<slug>/images/
       Supported: .png, .jpg, .jpeg, .webp, .avif
       Filenames become the manifest `name` (so use kebab-case, no spaces).
- [ ] 2. Run `node scripts/build-images.mjs --slug=<slug>` (or omit --slug to process every explainer).
- [ ] 3. Confirm src/lib/explainers/<slug>/image-manifest.ts updated and committed.
- [ ] 4. Reference the image in a chapter step:

       viz: {
         type: 'image',
         name: '<filename-without-extension>',
         alt: '<descriptive alt text>',
         caption: '<optional caption>',
         credit: '<photographer or licence>',
         sourceId: '<optional sourceId>'
       }
- [ ] 5. (Optional) Add a `credit` field directly to the manifest entry if the credit applies wherever the image is used.
```

## Naming conventions

- Use **kebab-case**, no spaces: `upf-supermarket.png`, not `UPF Supermarket.png`.
- Prefix with the slug if helpful for findability: `longevity-bryan-johnson.webp`.
- The manifest entry's `name` is derived from the filename minus the extension. References use this `name` — keep it stable across re-imports.

## Image best practices

- **Source resolution:** at least 1200px on the long edge so the 1200w variant looks crisp on retina.
- **Aspect ratio:** the `ImageChart` defaults to `4/5` (portrait). Crop sources to that ratio or set `aspect: 'auto'` / `aspect: 'square'`.
- **Transparency:** for product shots / logos use `fit: 'contain'` so they aren't cropped; the blurhash placeholder is auto-suppressed for those.
- **Licence:** every image needs a `credit` field. Editorial fair-use is fine for commentary but **must be credited**.

## What the script writes

```ts
// src/lib/explainers/<slug>/image-manifest.ts (auto-generated)
import type { ImageEntry } from '$lib/types/explainer';
export type { ImageEntry } from '$lib/types/explainer';

export const imageManifest: ImageEntry[] = [
  {
    name: '<file>',
    width: 1200,
    height: 1500,
    blurhash: 'LKO2:N…',
    variants: [
      { width: 400,  src: '/explainers/<slug>/processed/<file>-400w.webp' },
      { width: 800,  src: '/explainers/<slug>/processed/<file>-800w.webp' },
      { width: 1200, src: '/explainers/<slug>/processed/<file>-1200w.webp' }
    ]
  }
];
```

## Common pitfalls

- **Editing the manifest by hand.** Don't. Re-run the script.
- **Forgetting to commit the `processed/` output.** The WebP variants must ship in git so Vercel can serve them.
- **Wrong slug.** The script silently skips slugs without an `images/` subdirectory.
- **Bad alt text.** "Image" or empty string. Always describe the picture.

## After this skill

Run `pnpm check` to catch any TS errors that crept in (e.g. a referenced image name that no longer exists in the manifest). Commit the manifest + `processed/` together so deploys are reproducible.

---
name: pick-viz
description: Recommend the right Pixel Poetry chart component for a piece of data, with a ready-to-paste `VizConfig` blob matching the project's typed scrollytelling primitives. Use when the user asks "what chart should I use", "which viz fits this data", "render this as a chart", or describes a dataset they want visualised in a chapter.
---

# Pick Viz

Match a data shape to the right chart component and produce a copy-paste `VizConfig` blob.

## The viz toolbox

| Component | `type` | Best for | Notes |
|-----------|--------|----------|-------|
| `ObsBarChart` | `obs-bar` | Categorical comparison; "before / after" pairs; risk-increase % bars | Horizontal, label on left, value on right. Optional `group` field for paired bars. |
| `ObsTimelineChart` | `obs-timeline` | Time series with 1–4 series | Years on x, value on y; optional `domain` / `valueDomain`. |
| `DonutChart` | `donut` | Share-of-whole (≤6 slices) | Use sparingly; pie/donuts compete poorly with bars for accuracy. |
| `StatCard` | (step.stat) | A single hero number that lands like a punch | Not a chart — used in a step's `stat` field. |
| `ImageChart` | `image` | Editorial photo, product shot, illustration | Image name must exist in the explainer's image-manifest. Always credit + alt. |
| `QuoteBlock` | (step.quote) | A pull quote with attribution | Verbatim text, attribution, optional sourceId. |
| `BubbleChart` | `bubble` | Categorical scatter — rarely used; prefer obs-bar | Legacy; only when you really need bubble-pack. |
| `BarChart` | `bar` | Scroll-driven bar reveal with a year sequence | Animated; prefer `obs-bar` for static editorial charts. |
| `LineChart` | `line` | Multi-series with rich animation | Prefer `obs-timeline` for static editorial charts. |

## Decision tree

```
Is the data a single hero number?           → StatCard (in step.stat)
Is it a verbatim quote?                     → QuoteBlock (in step.quote)
Is it an image, photo or illustration?      → ImageChart (image)
Is it categorical with 2–10 labels?
  - paired before/after?                    → ObsBarChart with `group`
  - just a ranking?                         → ObsBarChart
Is it a share-of-whole (must sum to 100%)?
  - ≤ 6 slices, no fine differences?        → DonutChart
  - many slices or fine differences?        → ObsBarChart (sorted desc)
Is it a time series with years on x?        → ObsTimelineChart
Other?                                       → Reach for ObsBarChart or ObsTimelineChart by default; only use BubbleChart / LineChart / BarChart for animated scroll-driven sequences.
```

## Copy-paste blobs

### ObsBarChart (risk increase example)

```ts
viz: {
  type: 'obs-bar',
  title: 'Mortality risk increase by UPF intake quartile',
  subtitle: 'Hazard ratio vs lowest-quartile baseline',
  unit: '%',
  prefix: '+',
  sourceId: 'lane2024',
  data: [
    { label: 'All-cause mortality', value: 21 },
    { label: 'Cardiovascular disease', value: 50 },
    { label: 'Type 2 diabetes', value: 12 }
  ]
}
```

### ObsBarChart (paired groups)

```ts
viz: {
  type: 'obs-bar',
  title: 'BMI change after switching to a UPF-heavy diet',
  unit: ' kg',
  sourceId: 'hall2019',
  data: [
    { label: 'BMI', value: 23.1, group: 'Before' },
    { label: 'BMI', value: 24.0, group: 'After' }
  ]
}
```

### ObsTimelineChart (multi-series)

```ts
viz: {
  type: 'obs-timeline',
  title: 'Share of UPF in national diet (%)',
  unit: '%',
  domain: [1985, 2025],
  sourceId: 'monteiro2017',
  series: [
    {
      label: 'United Kingdom',
      color: '#f43f5e',
      points: [
        { year: 1990, value: 36 },
        { year: 2010, value: 50 },
        { year: 2023, value: 57 }
      ]
    },
    {
      label: 'Brazil',
      color: '#3b82f6',
      points: [
        { year: 1990, value: 12 },
        { year: 2010, value: 25 },
        { year: 2023, value: 30 }
      ]
    }
  ]
}
```

### DonutChart

```ts
viz: {
  type: 'donut',
  data: [
    { label: 'NOVA 1: Unprocessed', value: 22, color: '#10b981' },
    { label: 'NOVA 2: Culinary ingredients', value: 5, color: '#facc15' },
    { label: 'NOVA 3: Processed', value: 16, color: '#f97316' },
    { label: 'NOVA 4: Ultra-processed', value: 57, color: '#f43f5e' }
  ]
}
```

### ImageChart (editorial photo)

```ts
viz: {
  type: 'image',
  name: 'upf-supermarket',
  alt: 'Aisle of brightly packaged ultra-processed food',
  caption: 'A typical UK supermarket centre aisle.',
  credit: 'Photograph: <photographer> / <agency>.',
  sourceId: 'tulleken2023',
  fit: 'cover',
  aspect: '4/5'
}
```

### StatCard (used in step.stat — not as `viz`)

```ts
{
  id: 'hero-stat',
  text: 'Ultra-processed food now makes up 57% of the British diet.',
  stat: { value: '57', unit: '%', label: 'of the British diet is UPF', context: 'as of 2023', sourceId: 'rauber2018' }
}
```

## Defaults & opinionated picks

- When in doubt → `obs-bar` for comparisons, `obs-timeline` for years.
- One hero chart per chapter. Never two donuts in one essay.
- If the data has more than 8 categorical labels, **drop labels**, don't shrink the bars.
- Always include a `sourceId` for any chart showing numeric data.

## Workflow when asked "what viz?"

```
- [ ] 1. Identify the data shape (categorical / time series / share-of-whole / single number / quote / image).
- [ ] 2. Walk the decision tree.
- [ ] 3. Produce the VizConfig blob (filled with the user's data, or placeholders).
- [ ] 4. Suggest the chapter accent that complements the chart.
- [ ] 5. Print: which Chapter and step the viz belongs in.
```

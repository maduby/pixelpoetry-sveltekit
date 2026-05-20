<script lang="ts">
	/**
	 * <ChartContainer> — shared wrapper for all D3 chart components.
	 *
	 * Uses a fixed 800×500 SVG coordinate space so all child charts can hardcode
	 * D3 scale ranges against those dimensions — CSS `w-full` scales the SVG to
	 * fit any container without breaking any chart's internal coordinate math.
	 */
	import type { Snippet } from 'svelte';

	import { CHART_W, CHART_H } from './chart-constants';

	interface Props {
		label: string;
		children: Snippet;
		class?: string;
	}

	let { label, children, class: className }: Props = $props();
</script>

<div class={className}>
	<svg
		viewBox="0 0 {CHART_W} {CHART_H}"
		role="img"
		aria-label={label}
		class="w-full overflow-visible"
		style="max-height: 420px"
	>
		{@render children()}
	</svg>
</div>
<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		children: import('svelte').Snippet;
		class?: string;
		/** Decorative chapter emoji. Rendered larger than the eyebrow text. */
		emoji?: string;
	}

	let { children, class: className, emoji }: Props = $props();
</script>

<p
	class={cn(
		'inline-flex items-center gap-2.5 font-body text-xs font-bold tracking-[0.18em] text-ink/70 uppercase',
		className
	)}
>
	{#if emoji}
		<!--
			Larger emoji glyph, vertically centred with the small caps.
			`leading-none` + `tracking-normal` stop the global eyebrow
			text-tracking from adding awkward space between the emoji
			and the next character; `aria-hidden` since it's decorative.
		-->
		<span aria-hidden="true" class="text-xl leading-none tracking-normal">{emoji}</span>
	{/if}
	{@render children()}
</p>

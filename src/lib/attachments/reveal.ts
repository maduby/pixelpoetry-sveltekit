import type { Attachment } from 'svelte/attachments';

/**
 * `reveal` attachment — fades an element in from below as it enters the
 * viewport. Lightweight (no GSAP dependency): pure IntersectionObserver
 * + CSS transition. Reduced-motion users see the element instantly.
 *
 * Usage:
 *   <p {@attach reveal()}>…</p>
 *   <p {@attach reveal({ delay: 200, y: 40 })}>…</p>
 */
export interface RevealOptions {
	/** Pixels to translate from before reveal. Default 24. */
	y?: number;
	/** Delay before transitioning in (ms). Default 0. */
	delay?: number;
	/** Reveal threshold (0–1). Default 0.15. */
	threshold?: number;
	/** Reveal only the first time it enters the viewport. Default true. */
	once?: boolean;
}

export function reveal(options: RevealOptions = {}): Attachment {
	return (root) => {
		const element = root as HTMLElement;
		const { y = 24, delay = 0, threshold = 0.15, once = true } = options;
		const prefersReducedMotion =
			typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (prefersReducedMotion) return;

		element.style.opacity = '0';
		element.style.transform = `translate3d(0, ${y}px, 0)`;
		element.style.transition = `opacity 700ms ease-out ${delay}ms, transform 700ms ease-out ${delay}ms`;
		element.style.willChange = 'opacity, transform';

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						element.style.opacity = '1';
						element.style.transform = 'translate3d(0, 0, 0)';
						if (once) observer.disconnect();
					} else if (!once) {
						element.style.opacity = '0';
						element.style.transform = `translate3d(0, ${y}px, 0)`;
					}
				}
			},
			{ threshold }
		);
		observer.observe(element);

		return () => observer.disconnect();
	};
}

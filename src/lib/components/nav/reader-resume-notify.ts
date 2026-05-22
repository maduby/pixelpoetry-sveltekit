import { toast } from 'svelte-sonner';

export function notifyReaderResumePreference(message: string) {
	toast(message, {
		duration: 2200,
		unstyled: true,
		classes: {
			toast:
				'w-fit max-w-[calc(100vw-2rem)] rounded-full border border-ink/10 bg-ink px-4 py-2 text-center text-sm font-bold whitespace-nowrap text-cream shadow-xl shadow-ink/15'
		}
	});
}

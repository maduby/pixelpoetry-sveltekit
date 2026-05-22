import { toast } from 'svelte-sonner';

export function notifyReaderResumePreference(message: string) {
	toast(message, {
		duration: 2200,
		unstyled: true,
		classes: {
			toast:
				'w-fit max-w-full rounded-2xl border border-ink/10 bg-ink px-4 py-2 text-center text-sm font-bold text-balance text-cream shadow-xl shadow-ink/15 sm:rounded-full sm:whitespace-nowrap'
		}
	});
}

import { browser } from '$app/environment';
import type { ActiveExplainer } from '$lib/context/explainer.svelte';
import { posthog } from '$lib/analytics/posthog';

const VERSION = 1;
const STORAGE_PREFIX = 'pixelpoetry:reader-position:v1';
const NUDGES_DISABLED_KEY = 'pixelpoetry:reader-resume-nudges-disabled:v1';
const RESUME_MODE_KEY = 'pixelpoetry:reader-resume-mode:v1';

export type ReaderResumeMode = 'auto' | 'manual' | 'off';

export interface ReaderPosition {
	version: 1;
	explainerSlug: string;
	chapterId: string;
	chapterNumber: number;
	chapterTitle: string;
	stepId?: string;
	stepIndex?: number;
	elementId: string;
	href: string;
	progress: number;
	updatedAt: string;
}

type ReaderPositionDraft = Omit<ReaderPosition, 'version' | 'updatedAt'>;

export const readerPositions = $state<Record<string, ReaderPosition | null>>({});
export const observedReaderPositions = $state<Record<string, ReaderPositionDraft | null>>({});
export const readerResumePreference = $state({
	nudgesDisabled: false,
	mode: 'auto' as ReaderResumeMode,
	lastSavedAt: 0,
	lastSavedSlug: ''
});

let readerResumeModeLoaded = false;

export function readerPositionElementId(chapterId: string, stepId: string): string {
	return `${chapterId}--${stepId}`;
}

export function readerPositionKey(explainerSlug: string): string {
	return `${STORAGE_PREFIX}:${explainerSlug}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function parsePosition(value: unknown): ReaderPosition | null {
	if (!isRecord(value)) return null;
	if (value.version !== VERSION) return null;
	if (typeof value.explainerSlug !== 'string') return null;
	if (typeof value.chapterId !== 'string') return null;
	if (typeof value.chapterNumber !== 'number') return null;
	if (typeof value.chapterTitle !== 'string') return null;
	if (typeof value.elementId !== 'string') return null;
	if (typeof value.href !== 'string') return null;
	if (typeof value.progress !== 'number') return null;
	if (typeof value.updatedAt !== 'string') return null;
	if (value.stepId !== undefined && typeof value.stepId !== 'string') return null;
	if (value.stepIndex !== undefined && typeof value.stepIndex !== 'number') return null;

	return {
		version: VERSION,
		explainerSlug: value.explainerSlug,
		chapterId: value.chapterId,
		chapterNumber: value.chapterNumber,
		chapterTitle: value.chapterTitle,
		stepId: value.stepId,
		stepIndex: value.stepIndex,
		elementId: value.elementId,
		href: value.href,
		progress: value.progress,
		updatedAt: value.updatedAt
	};
}

export function loadReaderPosition(explainerSlug: string): ReaderPosition | null {
	if (!browser) return null;

	try {
		const raw = localStorage.getItem(readerPositionKey(explainerSlug));
		if (!raw) {
			readerPositions[explainerSlug] = null;
			return null;
		}

		const parsed = parsePosition(JSON.parse(raw));
		if (!parsed) {
			localStorage.removeItem(readerPositionKey(explainerSlug));
			readerPositions[explainerSlug] = null;
			return null;
		}

		readerPositions[explainerSlug] = parsed;
		return parsed;
	} catch {
		localStorage.removeItem(readerPositionKey(explainerSlug));
		readerPositions[explainerSlug] = null;
		return null;
	}
}

export function saveReaderPosition(position: ReaderPositionDraft): ReaderPosition | null {
	if (!browser) return null;

	const next: ReaderPosition = {
		...position,
		version: VERSION,
		progress: Math.min(1, Math.max(0, position.progress)),
		updatedAt: new Date().toISOString()
	};

	try {
		localStorage.setItem(readerPositionKey(next.explainerSlug), JSON.stringify(next));
		readerPositions[next.explainerSlug] = next;
		readerResumePreference.lastSavedAt = Date.now();
		readerResumePreference.lastSavedSlug = next.explainerSlug;
		return next;
	} catch {
		return null;
	}
}

export function trackReaderPosition(position: ReaderPositionDraft): ReaderPosition | null {
	observedReaderPositions[position.explainerSlug] = position;
	ensureReaderResumeModeLoaded();
	if (readerResumePreference.mode !== 'auto') return null;
	return saveReaderPosition(position);
}

export function refreshReaderPosition(position: ReaderPosition): ReaderPosition | null {
	return saveReaderPosition({
		explainerSlug: position.explainerSlug,
		chapterId: position.chapterId,
		chapterNumber: position.chapterNumber,
		chapterTitle: position.chapterTitle,
		stepId: position.stepId,
		stepIndex: position.stepIndex,
		elementId: position.elementId,
		href: position.href,
		progress: position.progress
	});
}

export function saveObservedReaderPosition(explainerSlug: string): ReaderPosition | null {
	const observed = observedReaderPositions[explainerSlug];
	if (observed) return saveReaderPosition(observed);

	const saved = readerPositions[explainerSlug];
	if (saved) return refreshReaderPosition(saved);

	return null;
}

export function clearReaderPosition(explainerSlug: string): void {
	if (!browser) return;
	localStorage.removeItem(readerPositionKey(explainerSlug));
	readerPositions[explainerSlug] = null;
}

export function loadReaderResumeNudgesDisabled(): boolean {
	if (!browser) return false;
	const disabled = localStorage.getItem(NUDGES_DISABLED_KEY) === 'true';
	readerResumePreference.nudgesDisabled = disabled;
	return disabled;
}

export function disableReaderResumeNudges(): void {
	if (!browser) return;
	localStorage.setItem(NUDGES_DISABLED_KEY, 'true');
	readerResumePreference.nudgesDisabled = true;
	setReaderResumeMode('off');
}

export function enableReaderResumeNudges(): void {
	if (!browser) return;
	localStorage.removeItem(NUDGES_DISABLED_KEY);
	readerResumePreference.nudgesDisabled = false;
	if (readerResumePreference.mode === 'off') {
		setReaderResumeMode('auto');
	}
}

export function loadReaderResumeMode(): ReaderResumeMode {
	if (!browser) return 'auto';
	const stored = localStorage.getItem(RESUME_MODE_KEY);
	const legacyOff = localStorage.getItem(NUDGES_DISABLED_KEY) === 'true';
	const mode: ReaderResumeMode =
		stored === 'off' || legacyOff ? 'off' : stored === 'manual' ? 'manual' : 'auto';
	readerResumePreference.mode = mode;
	readerResumePreference.nudgesDisabled = mode === 'off';
	readerResumeModeLoaded = true;
	return mode;
}

function ensureReaderResumeModeLoaded(): ReaderResumeMode {
	if (readerResumeModeLoaded) return readerResumePreference.mode;
	return loadReaderResumeMode();
}

export function setReaderResumeMode(mode: ReaderResumeMode): void {
	readerResumePreference.mode = mode;
	readerResumePreference.nudgesDisabled = mode === 'off';
	readerResumeModeLoaded = true;
	if (!browser) return;

	if (mode === 'auto') {
		localStorage.removeItem(RESUME_MODE_KEY);
		localStorage.removeItem(NUDGES_DISABLED_KEY);
		return;
	}

	if (mode === 'manual') {
		localStorage.removeItem(NUDGES_DISABLED_KEY);
	}

	if (mode === 'off') {
		localStorage.setItem(NUDGES_DISABLED_KEY, 'true');
	}

	localStorage.setItem(RESUME_MODE_KEY, mode);
}

export function hasMeaningfulReaderPosition(
	position: ReaderPosition | null | undefined,
	explainer: ActiveExplainer | null | undefined
): position is ReaderPosition {
	if (!position || !explainer) return false;
	if (position.explainerSlug !== explainer.meta.slug) return false;
	const firstChapter = explainer.chapters[0];
	if (!firstChapter) return false;
	return position.chapterId !== firstChapter.id || (position.stepIndex ?? 0) > 0;
}

export function resolveReaderPositionTarget(position: ReaderPosition): HTMLElement | null {
	if (!browser) return null;
	return document.getElementById(position.elementId) ?? document.getElementById(position.chapterId);
}

export function jumpToReaderPosition(position: ReaderPosition, surface: 'toast' | 'nav'): boolean {
	const target = resolveReaderPositionTarget(position);
	if (!target) return false;

	target.scrollIntoView({ behavior: 'smooth', block: 'start' });
	history.replaceState(null, '', `${position.href}#${target.id}`);
	posthog.capture('reader_resume_clicked', {
		surface,
		explainer_slug: position.explainerSlug,
		chapter_id: position.chapterId,
		step_id: position.stepId
	});
	return true;
}

export function restartExplainer(explainer: ActiveExplainer, surface: 'toast' | 'nav'): void {
	clearReaderPosition(explainer.meta.slug);
	const href = explainer.meta.href;
	const onPage = browser && window.location.pathname === href;

	if (onPage) {
		window.scrollTo({ top: 0, behavior: 'smooth' });
		history.replaceState(null, '', href);
	} else if (browser) {
		window.location.href = href;
	}

	posthog.capture('reader_resume_restarted', {
		surface,
		explainer_slug: explainer.meta.slug
	});
}

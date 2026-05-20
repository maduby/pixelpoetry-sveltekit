/**
 * Sheet context — lets any descendant open the combined Source / Term sheet
 * without prop-drilling.
 *
 * Two entry types share one bottom sheet:
 *   openSourceSheet('bmj-2024')  → show a bibliographic source
 *   openTermSheet('nova')        → show an inline term definition
 */
import { setContext } from 'svelte';
import { posthog } from '$lib/analytics/posthog';

const SHEET_KEY = Symbol('source-sheet');

export type SheetPayload =
	| { kind: 'source'; id: string }
	| { kind: 'term'; id: string };

type OpenFn = (payload: SheetPayload) => void;

let _openFn: OpenFn = () => {};

export function initSheetContext(openFn: OpenFn): void {
	_openFn = openFn;
	setContext(SHEET_KEY, true);
}

/** Open a bibliographic source in the bottom sheet. */
export function openSourceSheet(sourceId: string): void {
	posthog.capture('source_sheet_opened', { source_id: sourceId });
	_openFn({ kind: 'source', id: sourceId });
}

/** Open an inline term definition in the bottom sheet. */
export function openTermSheet(termId: string): void {
	posthog.capture('term_sheet_opened', { term_id: termId });
	_openFn({ kind: 'term', id: termId });
}

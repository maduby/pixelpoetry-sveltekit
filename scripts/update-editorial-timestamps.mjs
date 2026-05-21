#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const explainersDir = path.join(root, 'src/lib/explainers');

const args = process.argv.slice(2);
const changedOnly = args.includes('--changed');
const explicitTimestamp = args
	.find((arg) => arg.startsWith('--timestamp='))
	?.slice('--timestamp='.length);
const explicitSlugs = args.filter((arg) => !arg.startsWith('--'));

function formatTimestamp(date = new Date()) {
	const parts = new Intl.DateTimeFormat('en-GB', {
		timeZone: 'Africa/Johannesburg',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
		hour12: true
	}).formatToParts(date);

	const get = (type) => parts.find((part) => part.type === type)?.value ?? '';
	return `${get('day')} ${get('month')} ${get('year')} at ${get('hour')}:${get('minute')}${get('dayPeriod').toLowerCase()} SAST`;
}

function withTimezone(timestamp) {
	return timestamp.includes('SAST') ? timestamp : `${timestamp} SAST`;
}

function allExplainerSlugs() {
	return readdirSync(explainersDir, { withFileTypes: true })
		.filter(
			(entry) => entry.isDirectory() && existsSync(path.join(explainersDir, entry.name, 'meta.ts'))
		)
		.map((entry) => entry.name);
}

function changedExplainerSlugs() {
	const output = execFileSync(
		'git',
		[
			'diff',
			'--name-only',
			'HEAD',
			'--',
			'src/lib/explainers',
			'docs/explainers',
			'static/explainers'
		],
		{ cwd: root, encoding: 'utf8' }
	);

	return [
		...new Set(
			output
				.split('\n')
				.map((line) => line.trim())
				.filter(Boolean)
				.map((file) => {
					const parts = file.split('/');
					if (parts[0] === 'src' && parts[1] === 'lib' && parts[2] === 'explainers')
						return parts[3];
					if (parts[0] === 'docs' && parts[1] === 'explainers') return parts[2];
					if (parts[0] === 'static' && parts[1] === 'explainers') return parts[2];
					return undefined;
				})
				.filter(Boolean)
		)
	];
}

const slugs = explicitSlugs.length
	? explicitSlugs
	: changedOnly
		? changedExplainerSlugs()
		: allExplainerSlugs();

const timestamp = withTimezone(explicitTimestamp ?? formatTimestamp());

for (const slug of slugs) {
	const metaPath = path.join(explainersDir, slug, 'meta.ts');
	if (!existsSync(metaPath)) {
		console.warn(`Skipping ${slug}: no meta.ts found`);
		continue;
	}

	const source = readFileSync(metaPath, 'utf8');
	if (!source.includes('editorial:')) {
		console.warn(`Skipping ${slug}: no editorial block found`);
		continue;
	}

	const updated = source.includes('lastUpdated:')
		? source.replace(/lastUpdated:\s*'[^']*'/, `lastUpdated: '${timestamp}'`)
		: source.replace(
				/(editorial:\s*\{\s*\n\s*title:\s*'[^']*',)/,
				`$1\n\t\tlastUpdated: '${timestamp}',`
			);

	if (updated !== source) {
		writeFileSync(metaPath, updated);
		console.log(`Updated ${path.relative(root, metaPath)} -> ${timestamp}`);
	}
}

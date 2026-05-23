#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { config } from 'dotenv';

config({ path: '.env.local' });
config();

const API_BASE = 'https://console.neon.tech/api/v2';
const args = parseArgs(process.argv.slice(2));
const command = args._[0];

const requiredEnv = ['NEON_API_KEY', 'NEON_PROJECT_ID', 'NEON_DATABASE_NAME', 'NEON_ROLE_NAME'];

main().catch((error) => {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
});

async function main() {
	if (!command || !['verify', 'apply'].includes(command)) {
		printUsage();
		process.exit(1);
	}

	for (const key of requiredEnv) {
		if (!process.env[key]) throw new Error(`Missing ${key}. Add it to .env.local or your shell.`);
	}

	if (command === 'verify') {
		await verifyOnDisposableBranch();
		return;
	}

	await applyToTargetBranch();
}

async function verifyOnDisposableBranch() {
	const parentName = args.parent || process.env.NEON_STAGING_BRANCH || 'staging';
	const parent = await resolveBranch(parentName);
	const stamp = new Date()
		.toISOString()
		.replaceAll(':', '-')
		.replace(/\.\d+Z$/, 'Z');
	const branchName = args.name || `migration-check/${parent.name}/${stamp}`;
	const expiresAt = args.expiresAt || hoursFromNow(24);

	console.log(`Creating disposable Neon branch "${branchName}" from "${parent.name}"...`);
	const created = await neonFetch(`/projects/${projectId()}/branches`, {
		method: 'POST',
		body: JSON.stringify({
			branch: {
				name: branchName,
				parent_id: parent.id,
				expires_at: expiresAt
			},
			endpoints: [{ type: 'read_write' }]
		})
	});

	const branch = created.branch;
	const endpoint =
		created.endpoints?.find((item) => item.type === 'read_write') ?? created.endpoints?.[0];
	const uri = await getConnectionUri(branch.id, endpoint?.id);
	runDrizzleMigrate(uri.connection_uri);

	const report = writeReport({
		mode: 'verify',
		targetBranch: parent.name,
		targetBranchId: parent.id,
		disposableBranch: branch.name,
		disposableBranchId: branch.id,
		expiresAt,
		connectionHost: safeHost(uri.connection_uri)
	});

	console.log(`Verified migrations on disposable branch: ${branch.name}`);
	console.log(`Report: ${report}`);
	console.log('');
	console.log('Next apply step:');
	console.log(
		`  pnpm neon:migrate:apply --target=${parent.name} --verified-branch=${branch.name} --confirm=${parent.name}`
	);
}

async function applyToTargetBranch() {
	const targetName = args.target || process.env.NEON_STAGING_BRANCH || 'staging';
	const verifiedBranchName = args.verifiedBranch || args['verified-branch'];
	const confirm = args.confirm;

	if (!verifiedBranchName) {
		throw new Error('Refusing to apply without --verified-branch=<branch-name-or-id>.');
	}

	const target = await resolveBranch(targetName);
	const verified = await resolveBranch(verifiedBranchName);

	if (verified.parent_id !== target.id) {
		throw new Error(
			`Verified branch "${verified.name}" is not a child of target "${target.name}". Refusing to apply.`
		);
	}

	if (confirm !== target.name && confirm !== target.id) {
		throw new Error(
			`Refusing to apply. Pass --confirm=${target.name} after reviewing the verify report.`
		);
	}

	if (
		(target.name === 'main' || target.name === 'production') &&
		process.env.ALLOW_PRODUCTION_MIGRATION !== 'true'
	) {
		throw new Error(
			`Refusing production migration. Set ALLOW_PRODUCTION_MIGRATION=true and pass --confirm=${target.name}.`
		);
	}

	const uri = await getConnectionUri(target.id);
	runDrizzleMigrate(uri.connection_uri);

	const report = writeReport({
		mode: 'apply',
		targetBranch: target.name,
		targetBranchId: target.id,
		verifiedBranch: verified.name,
		verifiedBranchId: verified.id,
		connectionHost: safeHost(uri.connection_uri)
	});

	console.log(`Applied migrations to Neon branch: ${target.name}`);
	console.log(`Report: ${report}`);
}

async function resolveBranch(nameOrId) {
	const data = await neonFetch(
		`/projects/${projectId()}/branches?search=${encodeURIComponent(nameOrId)}`
	);
	const branch = data.branches?.find((item) => item.id === nameOrId || item.name === nameOrId);
	if (!branch) throw new Error(`Could not find Neon branch "${nameOrId}".`);
	return branch;
}

async function getConnectionUri(branchId, endpointId) {
	const params = new URLSearchParams({
		branch_id: branchId,
		database_name: process.env.NEON_DATABASE_NAME,
		role_name: process.env.NEON_ROLE_NAME
	});
	if (endpointId) params.set('endpoint_id', endpointId);
	return neonFetch(`/projects/${projectId()}/connection_uri?${params.toString()}`);
}

async function neonFetch(path, init = {}) {
	const response = await fetch(`${API_BASE}${path}`, {
		...init,
		headers: {
			accept: 'application/json',
			authorization: `Bearer ${process.env.NEON_API_KEY}`,
			'content-type': 'application/json',
			...(init.headers ?? {})
		}
	});

	const text = await response.text();
	const data = text ? JSON.parse(text) : {};
	if (!response.ok) {
		throw new Error(data.message || data.error || `Neon API failed: ${response.status}`);
	}
	return data;
}

function runDrizzleMigrate(connectionUri) {
	console.log(`Running Drizzle migrations against ${safeHost(connectionUri)}...`);
	const result = spawnSync('pnpm', ['exec', 'drizzle-kit', 'migrate'], {
		stdio: 'inherit',
		env: {
			...process.env,
			DATABASE_URL: connectionUri,
			DATABASE_URL_UNPOOLED: connectionUri
		}
	});

	if (result.status !== 0) {
		throw new Error(`Drizzle migration failed with exit code ${result.status}.`);
	}
}

function writeReport(data) {
	const dir = join(process.cwd(), 'docs/ai/neon-migration-runs');
	mkdirSync(dir, { recursive: true });
	const filename = `${new Date()
		.toISOString()
		.replaceAll(':', '-')
		.replace(/\.\d+Z$/, 'Z')}-${data.mode}-${data.targetBranch}.md`;
	const path = join(dir, filename);
	const body = [
		`# Neon Migration ${data.mode}`,
		'',
		`- Created at: ${new Date().toISOString()}`,
		`- Target branch: ${data.targetBranch} (${data.targetBranchId})`,
		data.disposableBranch
			? `- Disposable branch: ${data.disposableBranch} (${data.disposableBranchId})`
			: `- Verified branch: ${data.verifiedBranch} (${data.verifiedBranchId})`,
		data.expiresAt ? `- Disposable expires at: ${data.expiresAt}` : null,
		`- Connection host: ${data.connectionHost}`,
		'',
		'## Result',
		'',
		`Drizzle migrations completed successfully in ${data.mode} mode.`
	]
		.filter(Boolean)
		.join('\n');
	writeFileSync(path, `${body}\n`);
	return path;
}

function safeHost(connectionUri) {
	try {
		return new URL(connectionUri).host;
	} catch {
		return '[unparseable-host]';
	}
}

function hoursFromNow(hours) {
	return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

function projectId() {
	return process.env.NEON_PROJECT_ID;
}

function parseArgs(argv) {
	const parsed = { _: [] };
	for (const arg of argv) {
		if (!arg.startsWith('--')) {
			parsed._.push(arg);
			continue;
		}
		const [rawKey, ...valueParts] = arg.slice(2).split('=');
		const key = rawKey.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
		parsed[key] = valueParts.length ? valueParts.join('=') : true;
	}
	return parsed;
}

function printUsage() {
	console.log(`
Usage:
  pnpm neon:migrate:verify --parent=staging
  pnpm neon:migrate:apply --target=staging --verified-branch=<branch> --confirm=staging
  ALLOW_PRODUCTION_MIGRATION=true pnpm neon:migrate:apply --target=main --verified-branch=<branch> --confirm=main

Required env:
  NEON_API_KEY
  NEON_PROJECT_ID
  NEON_DATABASE_NAME
  NEON_ROLE_NAME

Optional env:
  NEON_STAGING_BRANCH=staging
`);
}

<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { DropdownMenu } from 'bits-ui';
	import { authClient } from '$lib/auth-client';
	import LogIn from 'lucide-svelte/icons/log-in';
	import LogOut from 'lucide-svelte/icons/log-out';
	import Sparkles from 'lucide-svelte/icons/sparkles';
	import UserCircle from 'lucide-svelte/icons/user-circle';
	import UserPlus from 'lucide-svelte/icons/user-plus';

	type UserSummary = {
		id: string;
		name: string;
		email: string;
		image?: string | null;
	};

	interface Props {
		user?: UserSummary | null;
	}

	let { user = null }: Props = $props();

	const initials = $derived(
		user?.name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase())
			.join('') || user?.email?.[0]?.toUpperCase() || ''
	);

	async function signOut() {
		await authClient.signOut();
		await invalidateAll();
		await goto('/');
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		aria-label={user ? `Account menu for ${user.name}` : 'Account menu'}
		class="group inline-flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-ink/15 bg-cream text-sm font-black text-ink/70 shadow-sm shadow-ink/5 transition-colors hover:border-ink/30 hover:bg-cream-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
	>
		{#if user?.image}
			<img src={user.image} alt="" class="size-full object-cover" referrerpolicy="no-referrer" />
		{:else if initials}
			<span class="grid size-full place-items-center bg-brand-red-deep text-[12px] text-cream">{initials}</span>
		{:else}
			<UserCircle size={20} aria-hidden="true" />
		{/if}
	</DropdownMenu.Trigger>

	<DropdownMenu.Portal>
		<DropdownMenu.Content
			side="bottom"
			align="end"
			sideOffset={10}
			collisionPadding={12}
			preventScroll={false}
			class="z-100 min-w-[220px] rounded-xl border border-ink/10 bg-cream p-2 shadow-xl shadow-ink/10 outline-none"
		>
			{#if user}
				<div class="px-3 py-2">
					<p class="truncate text-sm font-black text-ink">{user.name}</p>
					<p class="mt-0.5 truncate text-xs font-semibold text-ink/45">{user.email}</p>
				</div>
				<DropdownMenu.Separator class="my-1 h-px bg-ink/10" />
				<DropdownMenu.Item
					textValue="Account"
					onSelect={() => goto('/account')}
					class="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-ink/70 outline-none transition-colors data-highlighted:bg-ink/6 data-highlighted:text-ink"
				>
					<UserCircle size={17} aria-hidden="true" class="shrink-0 text-brand-red" />
					Account
				</DropdownMenu.Item>
				<DropdownMenu.Item
					textValue="Member tools"
					onSelect={() => goto('/account')}
					class="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-ink/70 outline-none transition-colors data-highlighted:bg-ink/6 data-highlighted:text-ink"
				>
					<Sparkles size={17} aria-hidden="true" class="shrink-0 text-brand-amber-deep" />
					Member tools
				</DropdownMenu.Item>
				<DropdownMenu.Separator class="my-1 h-px bg-ink/10" />
				<DropdownMenu.Item
					textValue="Sign out"
					onSelect={signOut}
					class="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-ink/60 outline-none transition-colors data-highlighted:bg-brand-red/8 data-highlighted:text-brand-red-deep"
				>
					<LogOut size={17} aria-hidden="true" class="shrink-0" />
					Sign out
				</DropdownMenu.Item>
			{:else}
				<div class="px-3 py-2">
					<p class="text-sm font-black text-ink">Pixel Poetry account</p>
					<p class="mt-0.5 text-xs leading-5 text-ink/45">
						Save your place and unlock member tools as they arrive.
					</p>
				</div>
				<DropdownMenu.Separator class="my-1 h-px bg-ink/10" />
				<DropdownMenu.Item
					textValue="Log in"
					onSelect={() => goto('/login')}
					class="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-ink/70 outline-none transition-colors data-highlighted:bg-ink/6 data-highlighted:text-ink"
				>
					<LogIn size={17} aria-hidden="true" class="shrink-0 text-brand-red" />
					Log in
				</DropdownMenu.Item>
				<DropdownMenu.Item
					textValue="Sign up"
					onSelect={() => goto('/signup')}
					class="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-ink/70 outline-none transition-colors data-highlighted:bg-ink/6 data-highlighted:text-ink"
				>
					<UserPlus size={17} aria-hidden="true" class="shrink-0 text-brand-ocean" />
					Sign up
				</DropdownMenu.Item>
			{/if}
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>

<script lang="ts">
	import '../app.css';
	import { goto } from '$app/navigation';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Plus, HamburgerMenu } from 'svelte-radix';
	// You might also import any UI component for the persistent item
	let { children } = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger class="fixed right-4 top-4 z-50"
		><Button
			variant="default"
			class="flex h-10 w-10 items-center justify-center rounded-full p-0 shadow-lg"
		>
			<HamburgerMenu />
		</Button></DropdownMenu.Trigger
	>
	<DropdownMenu.Content class="m-4">
		<DropdownMenu.Group>
			<DropdownMenu.GroupHeading>Navegación</DropdownMenu.GroupHeading>
			<DropdownMenu.Separator />
			<DropdownMenu.Item
				onclick={() => {
					goto('/map');
				}}>Mapa</DropdownMenu.Item
			>
			<DropdownMenu.Item
				onclick={() => {
					goto('/finder');
				}}>Buscador</DropdownMenu.Item
			>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>

{@render children()}

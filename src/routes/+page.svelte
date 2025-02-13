<script lang="ts">
	import * as Card from '$lib/components/ui/card/index';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';

	import { Plus } from 'svelte-radix';
	import { create_search_store, search_handler } from '$lib/stores/fuel_stations';
	import type { PageData } from './$types';
	import { onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import VirtualList from 'svelte-tiny-virtual-list';

	export let data: PageData;

	let is_mobile = false;

	if (browser) {
		is_mobile = window.matchMedia('(max-width: 786px)').matches;
	}

	function remove_accents(text: string): string {
		return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	}

	const search_stations = data.stations.ListaEESSPrecio.map((station) => ({
		...station,
		search_terms: remove_accents(
			`${station.Rótulo} ${station.Municipio} ${station.Provincia}`
		).toLowerCase(),
		precio_fields: Object.entries(station)
			.filter(([key, value]) => key.includes('Precio') && value.trim() !== '')
			.map(([key, value]) => ({ key, value }))
	}));

	const search_store = create_search_store(search_stations);

	const unsubscribe = search_store.subscribe((model) => search_handler(model));

	$: console.log($search_store.filtered.length)

	$: num_columns = is_mobile ? 1 : 3

	$: item_count = Math.ceil($search_store.filtered.length / num_columns)

	function clear_search() {
		const searchInput = document.getElementById('searchbar') as HTMLInputElement;
		searchInput.value = '';

		$search_store.search = '';
	}

	onDestroy(() => {
		unsubscribe();
	});
</script>

<div class="my-5 gap-4 text-center h-[10vh] max-h-[10vh]">
	<h1 class="text-xl underline">Fuel Tracker</h1>
	<sub class="italic">by toñ</sub>
</div>

{#if browser}
	{#if is_mobile}
		<Drawer.Root>
			<Drawer.Trigger class="fixed bottom-6 right-6 z-50">
				<Button
					variant="default"
					class="flex h-10 w-10 items-center justify-center rounded-full p-0 shadow-lg"
				>
					<Plus />
				</Button>
			</Drawer.Trigger>
			<Drawer.Content>
				<Drawer.Header>
					<Drawer.Title>Filtros de contenido</Drawer.Title>
					<Drawer.Description>
						Aquí podrás buscar por nombre de la estación, municipio, provincia...
					</Drawer.Description>
				</Drawer.Header>
				<div class="my-5 flex w-full flex-row justify-center gap-4 p-4">
					<div class="relative flex w-full flex-row">
						<input
							id="searchbar"
							bind:value={$search_store.search}
							type="text"
							name="search"
							placeholder="Busca por nombre..."
							class="w-full rounded border p-2"
						/>
						<button
							type="button"
							on:click={clear_search}
							class="m-2 text-gray-500 hover:text-gray-800"
						>
							<svg
								width="15"
								height="15"
								viewBox="0 0 15 15"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z"
									fill="currentColor"
									fill-rule="evenodd"
									clip-rule="evenodd"
								></path>
							</svg>
						</button>
					</div>
				</div>
			</Drawer.Content>
		</Drawer.Root>
	{:else}
		<Popover.Root>
			<Popover.Trigger class="fixed bottom-6 right-6 z-50">
				<Button
					variant="default"
					class="flex h-10 w-10 items-center justify-center rounded-full p-0 shadow-lg"
				>
					<Plus />
				</Button>
			</Popover.Trigger>
			<Popover.Content class="m-5 w-auto">
				<div class="sticky top-0 isolate z-10 my-5 flex w-full flex-row justify-center gap-4">
					<div class="relative flex w-auto flex-row">
						<input
							id="searchbar"
							bind:value={$search_store.search}
							type="text"
							name="search"
							placeholder="Busca por nombre..."
							class="w-full rounded border p-2"
						/>
						<button
							type="button"
							on:click={clear_search}
							class="m-2 text-gray-500 hover:text-gray-800"
						>
							<svg
								width="15"
								height="15"
								viewBox="0 0 15 15"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z"
									fill="currentColor"
									fill-rule="evenodd"
									clip-rule="evenodd"
								></path>
							</svg>
						</button>
					</div>
				</div>
			</Popover.Content>
		</Popover.Root>
	{/if}
{/if}

<div class="h-[90vh] max-h-[90vh]">
	<VirtualList
		width="100%"
		height="100%"
		itemCount={item_count}
		itemSize={300}
	>
		<div slot="item" let:index let:style {style}>
			<div class="grid-row bg-gray-300 p-2">
				{#each Array(num_columns) as _, col_index}
					{#if $search_store.filtered[index * num_columns + col_index]}
						<div class="grid-item m-2">
							<Card.Root class="flex h-[300px] flex-col justify-center">
								<Card.Header>
									<Card.Title class="w-full max-w-full break-all">
										<p>{$search_store.filtered[index * num_columns + col_index].Rótulo}</p>
									</Card.Title>
									<Card.Description>
										<sub>
											{$search_store.filtered[index * num_columns + col_index].Dirección},
											{$search_store.filtered[index * num_columns + col_index].Municipio}
										</sub>
									</Card.Description>
								</Card.Header>
								<Card.Content>
									{#each $search_store.filtered[index * num_columns + col_index].precio_fields as precio}
										<p><b>{precio.key}:</b> {precio.value}</p>
									{/each}
								</Card.Content>
								<Card.Footer>
									<p>{$search_store.filtered[index * num_columns + col_index].Horario}</p>
								</Card.Footer>
							</Card.Root>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	</VirtualList>
</div>

<!-- <div class="grid w-full max-w-full gap-4 overflow-auto bg-red-300 p-4 md:grid-cols-3">
	{#each $search_store.filtered as station}
		<Card.Root class="flex w-full max-w-full flex-col justify-between">
			<Card.Header>
				<Card.Title class="w-full max-w-full break-all">
					<p>{station.Rótulo}</p>
				</Card.Title>
				<Card.Description>
					<sub>{station.Dirección}, {station.Municipio}</sub>
				</Card.Description>
			</Card.Header>
			<Card.Content>
				{#each station.precio_fields as precio}
					<p><b>{precio.key}:</b> &nbsp; {precio.value}</p>
				{/each}
			</Card.Content>
			<Card.Footer>
				<p>{station.Horario}</p>
			</Card.Footer>
		</Card.Root>
	{/each}
</div> -->

<!-- {#if loading}
	<div class="flex w-full flex-col items-center gap-4 p-5 text-center">
		<h1>cargando datos, paciencia:</h1>
		<img src="gameplay.gif" alt="" />
	</div>
{:else if stations.length === 0}
	<p>No stations found.</p>
{:else}
	{#if window.matchMedia('(max-width: 768px)').matches}
		<Drawer.Root>
			<Drawer.Trigger class="fixed bottom-6 right-6 z-50">
				<Button
					variant="default"
					class="flex h-10 w-10 items-center justify-center rounded-full p-0 shadow-lg"
				>
					<Plus></Plus>
				</Button>
			</Drawer.Trigger>
			<Drawer.Content>
				<Drawer.Header>
					<Drawer.Title>Filtros de contenido</Drawer.Title>
					<Drawer.Description
						>Aquí podrás buscar por nombre de la estación, municipio, provincia...</Drawer.Description
					>
				</Drawer.Header>
				<div class="sticky top-0 isolate z-10 my-5 flex w-full flex-row justify-center gap-4 p-5">
					<div class="relative w-full">
						<input
							id="searchbar"
							on:input={search_station}
							type="text"
							name="search"
							placeholder="Busca por nombre..."
							class="w-full rounded border p-2"
						/>
						{#if has_input}
							<button
								type="button"
								on:click={clear_search}
								class="m-2 text-gray-500 hover:text-gray-800"
							>
								<svg
									width="15"
									height="15"
									viewBox="0 0 15 15"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									><path
										d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z"
										fill="currentColor"
										fill-rule="evenodd"
										clip-rule="evenodd"
									></path></svg
								>
							</button>
						{/if}
					</div>
				</div>
			</Drawer.Content>
		</Drawer.Root>
	{:else}
		<Popover.Root>
			<Popover.Trigger class="fixed bottom-6 right-6 z-50">
				<Button
					variant="default"
					class="flex h-10 w-10 items-center justify-center rounded-full p-0 shadow-lg"
				>
					<Plus></Plus>
				</Button>
			</Popover.Trigger>
			<Popover.Content class="m-5 w-auto">
				<div class="sticky top-0 isolate z-10 my-5 flex w-full flex-row justify-center gap-4">
					<div class="relative flex w-auto flex-row">
						<input
							id="searchbar"
							on:input={search_station}
							type="text"
							name="search"
							placeholder="Busca por nombre..."
							class="w-full rounded border p-2"
						/>
						{#if has_input}
							<button
								type="button"
								on:click={clear_search}
								class="m-2 text-gray-500 hover:text-gray-800"
							>
								<svg
									width="15"
									height="15"
									viewBox="0 0 15 15"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									><path
										d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z"
										fill="currentColor"
										fill-rule="evenodd"
										clip-rule="evenodd"
									></path></svg
								>
							</button>
						{/if}
					</div>
				</div>
			</Popover.Content>
		</Popover.Root>
	{/if}

	{#if has_input}
		{#each provinces as province}
			{#if filtered_stations.some((station) => station.Provincia === province)}
				<div class="grid w-full max-w-full gap-4 overflow-auto bg-gray-300 p-5 md:grid-cols-3">
					{#each filtered_stations.filter((station) => station.Provincia === province) as station}
						<Card.Root class="flex flex-col justify-between">
							<Card.Header>
								<Card.Title>
									<p>{station.Rótulo}</p>
								</Card.Title>
								<Card.Description>
									<sub>{station.Dirección}, {station.Municipio}</sub>
								</Card.Description>
							</Card.Header>
							<Card.Content>
								{#each getPrecioFields(station) as { key, value }}
									<p><strong>{key.replace('Precio ', '')}:</strong> {value}</p>
								{/each}
							</Card.Content>
							<Card.Footer>
								<p>{station.Horario}</p>
							</Card.Footer>
						</Card.Root>
					{/each}
				</div>
			{/if}
		{/each}
	{:else}
		<Accordion.Root type="single">
			{#each provinces as province}
				<Accordion.Item value={province}>
					<Accordion.Trigger class="mx-2">{province}</Accordion.Trigger>
					<Accordion.Content>
						<div class="grid w-full max-w-full gap-4 overflow-auto bg-gray-300 p-5 md:grid-cols-3">
							{#each (filtered_stations.length > 0 ? filtered_stations : stations).filter((station) => station.Provincia === province) as station}
								<Card.Root class="flex flex-col justify-between">
									<Card.Header>
										<Card.Title>
											<p>{station.Rótulo}</p>
										</Card.Title>
										<Card.Description>
											<sub>{station.Dirección}, {station.Municipio}</sub>
										</Card.Description>
									</Card.Header>
									<Card.Content>
										{#each getPrecioFields(station) as { key, value }}
											<p><strong>{key.replace('Precio ', '')}:</strong> {value}</p>
										{/each}
									</Card.Content>
									<Card.Footer>
										<p>{station.Horario}</p>
									</Card.Footer>
								</Card.Root>
							{/each}
						</div>
					</Accordion.Content>
				</Accordion.Item>
			{/each}
		</Accordion.Root>
	{/if}
{/if}
 -->

<style>
	.grid-row {
		display: grid;
		gap: 1rem;
		grid-template-columns: 1fr;
	}

	@media (min-width: 768px) {
		.grid-row {
			/* 3 columns for medium and larger screens */
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>

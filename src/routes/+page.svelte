<script lang="ts">
	import { goto } from '$app/navigation';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { search_handler, search_store } from '$lib/stores/fuel_stations';
	import { onDestroy } from 'svelte';

	function remove_accents(text: string): string {
		return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	}

	export let data;

	const search_stations = data.stations.ListaEESSPrecio.map((station) => ({
		...station,
		search_terms: remove_accents(
			`${station.Rótulo} ${station.Municipio} ${station.Provincia}`
		).toLowerCase(),
		precio_fields: Object.entries(station)
			.filter(([key, value]) => key.includes('Precio') && value.trim() !== '')
			.map(([key, value]) => ({ key, value }))
	}));

	// Only update the global store if it is empty.
	search_store.update((current) => {
		if (!current.data || current.data.length === 0) {
			return {
				data: search_stations,
				filtered: search_stations,
				search: ''
			};
		}
		return current;
	});
</script>

<div class="my-5 h-auto max-h-[10vh] gap-4 text-center">
	<h1 class="text-xl underline">Fuel Tracker</h1>
	<sub class="italic">by toñ</sub>
</div>

<div class="flex h-[90vh] w-full flex-col items-center justify-center gap-4 p-4 md:flex-row">
	<Card.Root class="flex h-1/2 flex-col items-center justify-center text-center md:w-1/2">
		<Card.Header>
			<Card.Title>Mapa de estaciones</Card.Title>
			<Card.Description>Encuentra estaciones para repostar cerca de tí</Card.Description>
		</Card.Header>
		<Card.Content>
			<Badge
				class="text-md"
				onclick={() => {
					goto('/map');
				}}>Mapa</Badge
			>
		</Card.Content>
	</Card.Root>

	<Card.Root class="flex h-1/2 flex-col items-center justify-center text-center md:w-1/2">
		<Card.Header>
			<Card.Title>Buscador</Card.Title>
			<Card.Description>Obten información sobre una estación concreta</Card.Description>
		</Card.Header>
		<Card.Content>
			<Badge
				class="text-md"
				onclick={() => {
					goto('/finder');
				}}>Buscador</Badge
			>
		</Card.Content>
	</Card.Root>
</div>

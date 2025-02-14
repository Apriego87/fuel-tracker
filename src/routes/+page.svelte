<script lang="ts">
	import { goto } from '$app/navigation';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { search_store } from '$lib/stores/fuel_stations';

	function remove_accents(text: string): string {
		return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	}

	export let data;

	$: if (data && data.stations) {
		// Check if data.stations is a promise:
		if (typeof data.stations.then === 'function') {
			// If it's a promise, wait for it to resolve
			data.stations
				.then((stationsData) => {
					const search_stations = stationsData.ListaEESSPrecio.map((station) => ({
						...station,
						search_terms: remove_accents(
							`${station.Rótulo} ${station.Municipio} ${station.Provincia}`
						).toLowerCase(),
						precio_fields: Object.entries(station)
							.filter(([key, value]) => key.includes('Precio') && value.trim() !== '')
							.map(([key, value]) => ({ key, value }))
					}));
					// Only update the store if it's empty
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
				})
				.catch((error) => {
					console.error('Error resolving stations:', error);
				});
		} else {
			// If data.stations is already resolved
			const search_stations = data.stations.ListaEESSPrecio.map((station) => ({
				...station,
				search_terms: remove_accents(
					`${station.Rótulo} ${station.Municipio} ${station.Provincia}`
				).toLowerCase(),
				precio_fields: Object.entries(station)
					.filter(([key, value]) => key.includes('Precio') && value.trim() !== '')
					.map(([key, value]) => ({ key, value }))
			}));
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
		}
	}
</script>

<div class="my-5 h-auto max-h-[10vh] gap-4 text-center">
	<h1 class="text-xl underline">Fuel Tracker</h1>
	<sub class="italic">by toñ</sub>
</div>

{#await data.stations}
	<!-- Loading state: display two skeleton "cards" -->
	<div class="flex h-[90vh] w-full flex-col items-center justify-center gap-4 p-4 md:flex-row">
		<!-- Skeleton for Mapa Card -->
		<div class="flex h-1/2 w-full flex-col items-center justify-center rounded border p-4 md:w-1/2">
			<Skeleton class="mb-2 h-6 w-3/4 rounded-full" />
			<!-- Card Title placeholder -->
			<Skeleton class="mb-4 h-4 w-1/2 rounded-full" />
			<!-- Card Description placeholder -->
			<Skeleton class="mb-2 h-10 w-full rounded-full" />
			<!-- Card Content placeholder -->
			<Skeleton class="h-10 w-full rounded-full" />
			<!-- Button placeholder -->
		</div>
		<!-- Skeleton for Buscador Card -->
		<div class="flex h-1/2 w-full flex-col items-center justify-center rounded border p-4 md:w-1/2">
			<Skeleton class="mb-2 h-6 w-3/4 rounded-full" />
			<Skeleton class="mb-4 h-4 w-1/2 rounded-full" />
			<Skeleton class="mb-2 h-10 w-full rounded-full" />
			<Skeleton class="h-10 w-full rounded-full" />
		</div>
	</div>
{:then}
	<div class="flex h-[90vh] w-full flex-col items-center justify-center gap-4 p-4 md:flex-row">
		<Card.Root class="flex h-1/2 flex-col items-center justify-center text-center md:w-1/2">
			<Card.Header>
				<Card.Title>Mapa de estaciones</Card.Title>
				<Card.Description>Encuentra estaciones para repostar cerca de tí</Card.Description>
			</Card.Header>
			<Card.Content>
				<Badge
					class="text-md hover:cursor-pointer"
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
					class="text-md hover:cursor-pointer"
					onclick={() => {
						goto('/finder');
					}}>Buscador</Badge
				>
			</Card.Content>
		</Card.Root>
	</div>
{:catch error}
	<p>ha habido un error: {error.message}</p>
{/await}

<script lang="ts">
	import * as Card from '$lib/components/ui/card/index';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Accordion from '$lib/components/ui/accordion/index.js';

	// Reactive stores
	let stations: any[] = [];
	let provinces: any[] = [];
	let loading = true;

	async function fetchStations() {
		try {
			const res = await fetch(
				'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres'
			);

			if (!res.ok) {
				throw new Error('Failed to fetch stations');
			}

			const json_data = await res.json();

			// Extract stations from API response
			stations = Object.values(json_data.ListaEESSPrecio || json_data);

			// Extract unique provinces
			provinces = [...new Set(stations.map((station) => station.Provincia))].sort((a, b) =>
				a.localeCompare(b)
			);
		} catch (error) {
			console.error(error);
		} finally {
			loading = false; // Mark loading as finished
		}
	}

	// Run fetchStations() on mount
	fetchStations();

	function capitalize(text: string) {
		return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
	}

	const getPrecioFields = (station: { [key: string]: any }) => {
		return Object.entries(station)
			.filter(([key, value]) => key.includes('Precio') && value.trim() !== '')
			.map(([key, value]) => ({ key, value }));
	};
</script>

<div class="mt-5 gap-4 text-center">
	<h1 class="text-xl underline">Fuel Tracker</h1>
	<sub class="italic">by toñ</sub>
</div>

{#if loading}
	<div class="w-full text-center gap-4 p-5">
		<h1>cargando datos, entreténte mientras:</h1>
		<img src="/gameplay.gif" alt="Loading..." class="mx-auto max-w-full" />
	</div>
{:else if stations.length === 0}
	<p>No stations found.</p>
{:else}
	<Accordion.Root type="single">
		{#each provinces as province}
			<Accordion.Item value={province}>
				<Accordion.Trigger class="mx-2">{province}</Accordion.Trigger>
				<Accordion.Content>
					<div class="grid w-full max-w-full gap-4 overflow-auto bg-gray-300 p-5 md:grid-cols-3">
						{#each stations.filter((station) => station.Provincia === province) as station}
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

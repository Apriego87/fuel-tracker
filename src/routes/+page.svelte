<script lang="ts">
	import * as Card from '$lib/components/ui/card/index';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';

	// Reactive stores
	let stations: any[] = [];
	let provinces: any[] = [];
	let loading = true;

	// Debounce variables
	let debounceTimeout: any;

	async function fetch_stations() {
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
	fetch_stations();

	let has_input = false;

	let filtered_stations: any[] = []; // To hold the filtered results

	// Function to search and store results in the 'test' variable with debounce
	function search_station() {
		// Clear the previous debounce timeout to reset the delay
		clearTimeout(debounceTimeout);

		let input = (document.getElementById('searchbar') as HTMLInputElement).value;

		input = input.toLowerCase();

		// Set a new timeout to execute the filtering after the user stops typing
		debounceTimeout = setTimeout(() => {
			// Clear out previous search results
			filtered_stations = [];

			// If the input is not empty, filter the stations
			if (input) {
				has_input = true; // Set has_input to true if there is input
				// Loop through stations and filter based on the search query
				for (let i = 0; i < stations.length; i++) {
					let obj = stations[i];

					// If the Rótulo, Provincia, or Municipio contains the search input, add the object to 'test'
					if (
						obj.Rótulo.toLowerCase().includes(input) ||
						obj.Provincia.toLowerCase().includes(input) ||
						obj.Municipio.toLowerCase().includes(input)
					) {
						filtered_stations = [...filtered_stations, obj]; // Adding to test (reactively)
					}
				}
			} else {
				// If the search is empty, reset to the full stations array and set has_input to false
				filtered_stations = stations;
				has_input = false; // Set has_input to false when search bar is empty
			}
		}, 300); // 300 milliseconds delay
	}

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
	<div class="w-full gap-4 p-5 text-center">
		<h1>cargando datos, paciencia:</h1>
	</div>
{:else if stations.length === 0}
	<p>No stations found.</p>
{:else}
	<div class="sticky top-0 isolate z-10 my-5 flex w-full flex-row justify-center gap-4">
		<input
			id="searchbar"
			on:input={search_station}
			type="text"
			name="search"
			placeholder="Busca por nombre..."
			class="rounded border p-2"
		/>
	</div>
	{#if has_input}
		{#each provinces as province}
			{#if filtered_stations.some((station) => station.Provincia === province)}
				<!-- Check if there's any station for this province in 'test' -->
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

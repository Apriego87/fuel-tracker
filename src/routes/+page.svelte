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

			// Add a new property `searchProps` to each station combining 'Rótulo', 'Municipio', and 'Provincia'
			stations = stations.map((station) => ({
				...station,
				searchProps: `${station.Rótulo} ${station.Municipio} ${station.Provincia}`.toLowerCase()
			}));

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

		// Convert input to lowercase and split it into words
		let searchTerms = input.toLowerCase().split(/\s+/).filter(Boolean); // Split on spaces and remove empty terms

		// Set a new timeout to execute the filtering after the user stops typing
		debounceTimeout = setTimeout(() => {
			// Clear out previous search results
			filtered_stations = [];

			// If the input is not empty, filter the stations
			if (searchTerms.length > 0) {
				has_input = true; // Set has_input to true if there is input
				// Loop through stations and filter based on the 'searchProps' property
				for (let i = 0; i < stations.length; i++) {
					let obj = stations[i];

					// Check if all search terms are included in searchProps
					if (searchTerms.every((term) => obj.searchProps.includes(term))) {
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

	// Function to clear the search bar and reset results
	function clear_search() {
		const searchInput = document.getElementById('searchbar') as HTMLInputElement;
		searchInput.value = ''; // Clear the input field
		filtered_stations = []; // Clear filtered stations
		has_input = false; // Set has_input to false
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
		<div class="relative">
			<input
				id="searchbar"
				on:input={search_station}
				type="text"
				name="search"
				placeholder="Busca por nombre..."
				class="rounded border p-2"
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

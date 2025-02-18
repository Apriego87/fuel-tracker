<script lang="ts">
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card/index';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import Select from 'svelte-select';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { ChevronDown } from 'svelte-radix';
	import Searchbar from '$lib/components/custom/searchbar/searchbar.svelte';
	import { search_store } from '$lib/stores/fuel_stations';
	import VirtualList from 'svelte-tiny-virtual-list';

	let provinces = [
		'ALBACETE',
		'ALICANTE',
		'ALMERÍA',
		'ARABA/ÁLAVA',
		'ASTURIAS',
		'ÁVILA',
		'BADAJOZ',
		'BALEARS (ILLES)',
		'BARCELONA',
		'BIZKAIA',
		'BURGOS',
		'CÁCERES',
		'CÁDIZ',
		'CANTABRIA',
		'CASTELLÓN / CASTELLÓ',
		'CEUTA',
		'CIUDAD REAL',
		'CÓRDOBA',
		'CORUÑA (A)',
		'CUENCA',
		'GIPUZKOA',
		'GIRONA',
		'GRANADA',
		'GUADALAJARA',
		'HUELVA',
		'HUESCA',
		'JAÉN',
		'LEÓN',
		'LLEIDA',
		'LUGO',
		'MADRID',
		'MÁLAGA',
		'MELILLA',
		'MURCIA',
		'NAVARRA',
		'OURENSE',
		'PALENCIA',
		'PALMAS (LAS)',
		'PONTEVEDRA',
		'RIOJA (LA)',
		'SALAMANCA',
		'SANTA CRUZ DE TENERIFE',
		'SEGOVIA',
		'SEVILLA',
		'SORIA',
		'TARRAGONA',
		'TERUEL',
		'TOLEDO',
		'VALENCIA / VALÈNCIA',
		'VALLADOLID',
		'ZAMORA',
		'ZARAGOZA'
	];

	let fuels = [
		'Biodiesel',
		'Bioetanol',
		'Gas Natural Comprimido',
		'Gas Natural Licuado',
		'Gases Licuados del Petróleo',
		'Gasoleo A',
		'Gasoleo B',
		'Gasoleo Premium',
		'Gasolina 95 E5',
		'Gasolina 95 E5 premium',
		'Gasolina 95 E10',
		'Gasolina 98 E5',
		'Gasolina 98 E10',
		'Hidrogeno'
	];

	let open_popover = $state(false);

	let selected_province = $state('');

	let selected_fuel = $state('');

	let is_mobile = $state(false);

	function isMobile() {
	  const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
	  return regex.test(navigator.userAgent);
	}

	$effect(() => {
		// Retrieve current filter values
		const province_filter = selected_province ? selected_province.value : '';
		const fuel_filter = selected_fuel ? selected_fuel.value : '';

		// Close popover if any filter is applied
		if (selected_fuel || selected_province) {
			open_popover = false;
		}

		// Helper function to get the price for a given fuel
		function getPrice(station, fuelKey) {
			const field = station.precio_fields.find((field) =>
				field.key.toLowerCase().includes(fuelKey.toLowerCase())
			);
			return field ? parseFloat(field.value.replace(',', '.')) : Infinity;
		}

		// Update the store with combined filtering and optional sorting.
		search_store.update((s) => {
			const newFiltered = s.data.filter((station) => {
				// Province filter:
				const provinceMatch = province_filter
					? station.Provincia.toLowerCase().includes(province_filter.toLowerCase())
					: true;
				// Search term filter:
				const searchMatch = station.search_terms.toLowerCase().includes(s.search.toLowerCase());
				// Fuel filter:
				const fuelMatch = fuel_filter
					? station.precio_fields.some(
							(field) =>
								field.key.toLowerCase().includes(fuel_filter.toLowerCase()) ||
								(typeof field.value === 'string' &&
									field.value.toLowerCase().includes(fuel_filter.toLowerCase()))
						)
					: true;
				return provinceMatch && searchMatch && fuelMatch;
			});

			// If a fuel filter is selected, sort by that fuel's price.
			if (fuel_filter) {
				newFiltered.sort((a, b) => {
					return getPrice(a, fuel_filter) - getPrice(b, fuel_filter);
				});
			}

			return {
				...s,
				selected_province: province_filter,
				selected_fuel: fuel_filter,
				filtered: newFiltered
			};
		});
	});

	onMount(() => {
		// Set initial value
		function updateIsMobile() {
			is_mobile = isMobile();
		}
		updateIsMobile();
		
		// Optionally, update on resize if needed
		window.addEventListener('resize', updateIsMobile);
		return () => window.removeEventListener('resize', updateIsMobile);
	});

	let num_columns = $derived(is_mobile ? 1 : 3);

	let stations_by_province = $derived(
		provinces.reduce((acc, province) => {
			const filtered = $search_store.filtered.filter((station) => station.Provincia === province);
			if (filtered.length > 0) {
				acc[province] = filtered;
			}
			return acc;
		}, {})
	);

	let province_count = $derived(Object.keys(stations_by_province));
</script>

<div class="bold flex h-[20vh] flex-col items-center justify-center gap-4">
	<h1 class="text-3xl font-bold">Buscador de estaciones</h1>
	<div class="flex w-full flex-row gap-4 px-2">
		<div class="w-full">
			<Searchbar />
		</div>
		<div class="w-auto">
			<Popover.Root
				open={open_popover}
				onOpenChange={() => {
					open_popover = true;
				}}
			>
				<Popover.Trigger>
					<Button class="flex h-10 w-10 items-center justify-center rounded-full p-0 shadow-lg">
						<ChevronDown />
					</Button>
				</Popover.Trigger>
				<Popover.Content class="w-screen p-0 md:mx-5 md:w-[30vw]">
					<Card.Root>
						<Card.Header>
							<Card.Title><p>Filtros</p></Card.Title>
							<Card.Description>
								<p>Al seleccionar un combustible, los resultados se ordenarán por precio.</p>
							</Card.Description>
						</Card.Header>
						<Card.Content>
							<div class="flex h-full w-full flex-col gap-4">
								<div class="flex w-full flex-col gap-4">
									<Label for="province">Provincia</Label>
									<Select
										items={provinces}
										searchable={false}
										bind:value={selected_province}
										placeholder="Selecciona provincia..."
									/>
								</div>
								<div class="flex w-full flex-col gap-4">
									<Label for="province">Combustible</Label>
									<Select
										items={fuels}
										searchable={false}
										bind:value={selected_fuel}
										placeholder="Selecciona combustible..."
									/>
								</div>
							</div>
						</Card.Content>
						<Card.Footer>
							<Button
								class="h-[30px]"
								onclick={() => {
									selected_fuel = null;
									selected_province = null;
									open_popover = false;
								}}>Borrar filtros</Button
							>
						</Card.Footer>
					</Card.Root>
				</Popover.Content>
			</Popover.Root>
		</div>
	</div>
</div>

<Accordion.Root
	type="single"
	value={province_count.length < provinces.length / 2 ? province_count[0] : ''}
>
	{#each Object.entries(stations_by_province) as [province, province_stations]}
		<Accordion.Item value={province}>
			<Accordion.Trigger class="mx-2">{province}</Accordion.Trigger>
			<Accordion.Content>
				<div
					class="h-[72vh]"
				>
					<VirtualList
						width="100%"
						height="100%"
						itemCount={Math.ceil(province_stations.length / num_columns)}
						itemSize={350}
					>
						<div slot="item" let:index let:style {style}>
							<div class="grid-row bg-gray-300 p-2">
								{#each Array(num_columns) as _, col_index}
									{#if province_stations[index * num_columns + col_index]}
										<div class="grid-item m-2">
											<Card.Root class="flex h-[350px] flex-col justify-center">
												<Card.Header>
													<Card.Title class="w-full max-w-full break-all">
														<p>{province_stations[index * num_columns + col_index].Rótulo}</p>
													</Card.Title>
													<Card.Description>
														<sub>
															{province_stations[index * num_columns + col_index].Dirección},
															{province_stations[index * num_columns + col_index].Municipio}
														</sub>
													</Card.Description>
												</Card.Header>
												<Card.Content>
													{#each province_stations[index * num_columns + col_index].precio_fields as precio}
														<p><b>{precio.key}:</b> {precio.value}€</p>
													{/each}
												</Card.Content>
												<Card.Footer>
													<p>{province_stations[index * num_columns + col_index].Horario}</p>
												</Card.Footer>
											</Card.Root>
										</div>
									{/if}
								{/each}
							</div>
						</div>
					</VirtualList>
				</div>
			</Accordion.Content>
		</Accordion.Item>
	{/each}
</Accordion.Root>

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

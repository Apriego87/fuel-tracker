<script lang="ts">
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card/index';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { MagnifyingGlass } from 'svelte-radix';
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

	let is_mobile = false;

	onMount(() => {
		if ($search_store.data.length == 0) {
			window.location.href = '/';
		}
		is_mobile = window.matchMedia('(max-width: 786px)').matches;
	});

	// Reactive declarations for grid layout
	$: num_columns = is_mobile ? 1 : 3;
	$: item_count = Math.ceil($search_store.filtered.length / num_columns);

	function clear_search() {
		const searchInput = document.getElementById('searchbar') as HTMLInputElement;
		if (searchInput) searchInput.value = '';
		search_store.update((s) => ({
			...s,
			search: '',
			filtered: s.data
		}));
	}

	function remove_accents(text: string): string {
		return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	}

	$: stations_by_province = provinces.reduce((acc, province) => {
		const filtered = $search_store.filtered.filter((station) => station.Provincia === province);
		if (filtered.length > 0) {
			acc[province] = filtered;
		}
		return acc;
	}, {});

	$: province_count = Object.keys(stations_by_province);
</script>

<div class="bold flex h-[10vh] flex-col items-center justify-center text-3xl">
	<h1>Buscador</h1>
</div>

{#if is_mobile}
	<Drawer.Root>
		<Drawer.Trigger class="fixed bottom-6 right-6 z-50">
			<Button
				variant="default"
				class="flex h-10 w-10 items-center justify-center rounded-full p-0 shadow-lg"
			>
				<MagnifyingGlass />
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
						on:input={(e) => {
							const value = (e.target as HTMLInputElement).value.toLowerCase();
							// Update the store with a new object so Svelte detects the change.
							search_store.update((s) => ({
								...s,
								search: value,
								filtered: s.data.filter((item) => item.search_terms.toLowerCase().includes(value))
							}));
						}}
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
				<MagnifyingGlass />
			</Button>
		</Popover.Trigger>
		<Popover.Content class="m-5 w-auto p-0">
			<Card.Root class="flex flex-col items-center justify-center text-center">
				<Card.Header>
					<Card.Title>Búsqueda por nombre</Card.Title>
					<Card.Description
						>Introduce el nombre de la estación, la localidad o la provincia</Card.Description
					>
				</Card.Header>
				<Card.Content>
					<div class="sticky top-0 isolate z-10 my-5 flex w-full flex-row justify-center gap-4">
						<div class="relative flex w-auto flex-row">
							<input
								id="searchbar"
								bind:value={$search_store.search}
								type="text"
								name="search"
								placeholder="Busca por nombre..."
								class="w-full rounded border p-2"
								on:input={(e) => {
									const value = (e.target as HTMLInputElement).value.toLowerCase();
									// Update the store with a new object so Svelte detects the change.
									search_store.update((s) => ({
										...s,
										search: value,
										filtered: s.data.filter((item) =>
											item.search_terms.toLowerCase().includes(value)
										)
									}));
								}}
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
				</Card.Content>
			</Card.Root>
		</Popover.Content>
	</Popover.Root>
{/if}

<Accordion.Root
	type="single"
	value={province_count.length < provinces.length / 2 ? province_count[0] : ''}
>
	{#each Object.entries(stations_by_province) as [province, province_stations]}
		<Accordion.Item value={province}>
			<Accordion.Trigger class="mx-2">{province}</Accordion.Trigger>
			<Accordion.Content>
				<div class="h-[80vh] max-h-[80vh]">
					<VirtualList width="100%" height="100%" itemCount={item_count} itemSize={350}>
						<div slot="item" let:index let:style {style}>
							<div class="grid-row bg-gray-300 p-2">
								{#each Array(num_columns) as _, col_index}
									{#if $search_store.filtered[index * num_columns + col_index]}
										<div class="grid-item m-2">
											<Card.Root class="flex h-[350px] flex-col justify-center">
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

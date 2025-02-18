<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { search_store } from '$lib/stores/fuel_stations';
</script>

<div class="flex w-full flex-row">
	<Input
		id="searchbar"
		bind:value={$search_store.search}
		type="search"
		name="search"
		placeholder="Introduce el nombre de la estación, municipio, provincia..."
		class="w-full rounded border p-2"
		oninput={(e) => {
			const value = (e.target as HTMLInputElement).value.toLowerCase();
			search_store.update((s) => ({
				...s,
				search: value,
				filtered: s.data.filter(
					(item) =>
						item.search_terms.toLowerCase().includes(value) &&
						(s.selected_province != ''
							? item.Provincia.toLowerCase().includes(s.selected_province.toLowerCase())
							: true) &&
						(s.selected_fuel != ''
							? item.precio_fields.some(
									(field) =>
										field.key.toLowerCase().includes(s.selected_fuel.toLowerCase()) ||
										(typeof field.value === 'string' &&
											field.value.toLowerCase().includes(s.selected_fuel.toLowerCase()))
								)
							: true)
				)
			}));
		}}
	/>
</div>

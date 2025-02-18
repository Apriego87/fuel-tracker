import { writable } from "svelte/store";

export interface SearchStoreModel<T extends Record<PropertyKey, any>> {
	data: T[];
	filtered: T[];
	search: string;
	selected_province: string;
	selected_fuel: string;
}

export const create_search_store = <T extends Record<PropertyKey, any>>(data: T[]) => {
	const { subscribe, set, update } = writable<SearchStoreModel<T>>({
		data,
		filtered: data,
		search: '',
		selected_province: '',
		selected_fuel: ''
	});

	return {
		subscribe,
		set,
		update
	};
};

export const search_handler = <T extends Record<PropertyKey, any>>(store: SearchStoreModel<T>) => {
	const search_term = store.search.toLowerCase() || '';
	const province_filter = store.selected_province.toLowerCase() || '';
	const fuel_filter = store.selected_fuel.toLowerCase() || '';

	store.filtered = store.data.filter((item) => {
		// Check if the search term matches
		const matchesSearch = item.search_terms.toLowerCase().includes(search_term);

		// Check if the province matches (if a province filter is set)
		const matchesProvince = province_filter
			? item.Provincia.toLowerCase().includes(province_filter)
			: true;

		// Check if the fuel filter matches (if a fuel filter is set).
		// Assumes item.precio_fields is an array of objects with keys like "key" and "value".
		const matchesFuel = fuel_filter
			? item.precio_fields.some((field) => {
				const key = field.key.toLowerCase();
				const value = typeof field.value === 'string' ? field.value.toLowerCase() : '';
				return key.includes(fuel_filter) || value.includes(fuel_filter);
			})
			: true;

		return matchesSearch && matchesProvince && matchesFuel;
	});
};


// Create and export a global instance.
// Initially empty; it will be populated on the root page.
export const search_store = create_search_store([]);

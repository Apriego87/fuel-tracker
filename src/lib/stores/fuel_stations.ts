import { writable } from "svelte/store";

export interface SearchStoreModel<T extends Record<PropertyKey, any>> {
	data: T[];
	filtered: T[];
	search: string;
}

export const create_search_store = <T extends Record<PropertyKey, any>>(data: T[]) => {
	const { subscribe, set, update } = writable<SearchStoreModel<T>>({
		data,
		filtered: data,
		search: ''
	});

	return {
		subscribe,
		set,
		update
	};
};

export const search_handler = <T extends Record<PropertyKey, any>>(store: SearchStoreModel<T>) => {
	const search_term = store.search.toLowerCase() || '';
	// Update the filtered array based on the search term.
	store.filtered = store.data.filter((item) => {
		return item.search_terms.toLowerCase().includes(search_term);
	});
};

// Create and export a global instance.
// Initially empty; it will be populated on the root page.
export const search_store = create_search_store([]);

import { writable } from "svelte/store"

export const create_search_store = (data) => {
	const { subscribe, set, update } = writable({
		data,
		filtered: data,
		search: ''
	})

	return {
		subscribe,
		set,
		update
	}
}

export const search_handler = (store) => {
	const search_term = store.search.toLowerCase() || ''


	store.filtered = store.data.filter((item) => {
		return item.search_terms.toLowerCase().includes(search_term)
	})
}
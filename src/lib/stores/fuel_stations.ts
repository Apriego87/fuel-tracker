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
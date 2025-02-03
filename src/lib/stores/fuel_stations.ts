import { readable, writable } from 'svelte/store';

interface Station {
	[key: string]: any;
}

export const fuel_stations = readable<{ stations: Station[]; provinces: string[]; loading: boolean }>(
	{ stations: [], provinces: [], loading: true },
	(set) => {
		async function fetchStations() {
			try {
				const res = await fetch(
					'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres'
				);

				if (!res.ok) throw new Error('Failed to fetch stations');

				const json_data = await res.json();
				const stations = Object.values(json_data.ListaEESSPrecio || json_data);

				console.log(stations);

				const provinces = [...new Set(stations.map((station) => station.Provincia))].sort((a, b) =>
					a.localeCompare(b)
				);

				set({ stations, provinces, loading: false });
			} catch (error) {
				console.error(error);
				set({ stations: [], provinces: [], loading: false });
			}
		}

		fetchStations();

		// No cleanup needed
		return () => {};
	}
);

// Create a writable store for filtered stations
export const filtered_stations = writable<Station[]>([]);

export const filterStations = (searchTerm: string) => {
	fuel_stations.update((state) => {
		const filtered = state.stations.filter((station) =>
			station.Rótulo.toLowerCase().includes(searchTerm.toLowerCase())
		);
		filtered_stations.set(filtered);
		return state;
	});
};

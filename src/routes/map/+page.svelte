<script lang="ts">
	import { onMount } from 'svelte';
	import { search_store } from '$lib/stores/fuel_stations';
	import { Button } from '$lib/components/ui/button/index.js';
	import { goto } from '$app/navigation';

	let map;
	let L; // We'll assign the Leaflet module here dynamically
	$: stations = $search_store.data;

	// Dynamically load Leaflet and plugins on mount
	async function initLeaflet() {
		const leaflet = await import('leaflet');
		L = leaflet.default;
		// Import CSS for Leaflet and marker cluster
		await import('leaflet/dist/leaflet.css');
		await import('leaflet.markercluster');
		await import('leaflet.markercluster/dist/MarkerCluster.css');
		await import('leaflet.markercluster/dist/MarkerCluster.Default.css');

		// Configure default icon URLs after L is defined
		delete L.Icon.Default.prototype._getIconUrl;
		L.Icon.Default.mergeOptions({
			iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
			iconUrl: '/leaflet/images/marker-icon.png',
			shadowUrl: '/leaflet/images/marker-shadow.png'
		});
	}

	function initMap(lat: number, lng: number) {
		map = L.map('map').setView([lat, lng], 13);
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '© OpenStreetMap contributors'
		}).addTo(map);

		const markers = L.markerClusterGroup();

		stations.forEach((station) => {
			// Convert coordinates: replace comma with dot if necessary
			const station_lat = parseFloat(station.Latitud.replace(',', '.'));
			const station_long = parseFloat(station['Longitud (WGS84)'].replace(',', '.'));
			if (!isNaN(station_lat) && !isNaN(station_long)) {
				const pricesHtml = station.precio_fields
					.map((field) => `<span><strong>${field.key}:</strong> ${field.value}€</span> <br/>`)
					.join('');
				const popupContent =
					`
          <div>
            <h3><strong>${station.Rótulo}</strong></h3>
            <p><strong>Dirección:</strong> ${station.Dirección}</p>
			` +
					pricesHtml +
					`
            <p><strong>Horario:</strong> ${station.Horario}</p>
			<a target="_blank" href="http://maps.google.com/?q=${parseFloat(station.Latitud.replace(',', '.'))},${parseFloat(station['Longitud (WGS84)'].replace(',', '.'))}"><p>Abrir en Maps</p></a>
          </div>
        `;
				const marker = L.marker([station_lat, station_long]).bindPopup(popupContent);
				markers.addLayer(marker);
			}
		});

		map.addLayer(markers);
	}

	onMount(async () => {
		await initLeaflet();

		if (stations.length == 0) {
			window.location.href = '/';
		}

		// Ask for geolocation, then initialize the map
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const { latitude, longitude } = position.coords;
					initMap(latitude, longitude);
				},
				(error) => {
					initMap(40.416775, -3.70379);
				}
			);
		} else {
			initMap(40.416775, -3.70379);
		}
	});
</script>

<div class="bold flex h-[10vh] flex-col items-center justify-center text-2xl">
	<h1 class="text-3xl font-bold">Mapa de estaciones</h1>
</div>

<div id="map" class="z-0 h-[90vh] w-full"></div>

<script lang="ts">
	import { onMount } from 'svelte';
	import { search_store } from '$lib/stores/fuel_stations';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { goto } from '$app/navigation';

	let map;
	let L; // We'll assign the Leaflet module here dynamically
	$: stations = $search_store.data;

	// Dynamically load Leaflet and plugins on mount
	async function initLeaflet() {
		const leaflet = await import('leaflet');
		L = leaflet.default;
		// Import CSS (these side effects don't need to be assigned)
		await import('leaflet/dist/leaflet.css');
		await import('leaflet.markercluster');
		await import('leaflet.markercluster/dist/MarkerCluster.css');
		await import('leaflet.markercluster/dist/MarkerCluster.Default.css');
	}

	function initMap(lat: number, lng: number) {
		map = L.map('map').setView([lat, lng], 13);
		var Esri_WorldImagery = L.tileLayer(
			'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
			{
				attribution:
					'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
			}
		).addTo(map);

		const markers = L.markerClusterGroup();

		stations.forEach((station) => {
			// Convert coordinates: replace comma with dot if necessary
			const station_lat = parseFloat(station.Latitud.replace(',', '.'));
			const station_long = parseFloat(station['Longitud (WGS84)'].replace(',', '.'));
			if (!isNaN(station_lat) && !isNaN(station_long)) {
				// Build an HTML string for the popup
				const popupContent = `
      <div>
        <h3><strong>${station.Rótulo}</strong></h3>
        <p><strong>Dirección:</strong> ${station.Dirección}</p>
        <p><strong>Horario:</strong> ${station.Horario}</p>
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

		// Ask for geolocation, then initialize the map
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const { latitude, longitude } = position.coords;
					initMap(latitude, longitude);
				},
				(error) => {
					console.error('Error getting location:', error);
					// Use a fallback default location (e.g., Madrid)
					initMap(40.416775, -3.70379);
				}
			);
		} else {
			initMap(40.416775, -3.70379);
		}
	});
</script>

<div class="bold flex h-[10vh] flex-col items-center justify-center text-2xl">
	<h1>Mapa de estaciones</h1>
</div>

<div id="map" class="z-0 h-[90vh] w-full"></div>

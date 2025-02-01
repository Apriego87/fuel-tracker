import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
    const res = await fetch('/estaciones.json');

    if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
    }

    // Stream the JSON
    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let result = '';

    if (reader) {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            result += decoder.decode(value, { stream: true });
        }
    }

    // Parse the response
    const jsonData = JSON.parse(result);

    console.log(jsonData)
    // Assuming jsonData contains a key with the array, like `estaciones`
    const stations = jsonData.ListaEESSPrecio || []; // Fallback if the key doesn't exist

    // Extract unique provinces
    const provinces = [
        ...new Set(stations.map((item) => item.Provincia))
    ];

    return { item: stations, provinces };
};




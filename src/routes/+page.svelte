<script lang="ts">
	import type { PageProps } from './$types';

	import * as Card from '$lib/components/ui/card/index';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Accordion from '$lib/components/ui/accordion/index.js';

	let { data }: PageProps = $props();

	function capitalize(text) {
		return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
	}

	const getPrecioFields = (station: { [key: string]: any }) => {
		return Object.entries(station)
			.filter(([key, value]) => key.includes('Precio') && value.trim() !== '')
			.map(([key, value]) => ({ key, value }));
	};
</script>

<div class="gap-4 text-center mt-5">
	<h1 class="text-xl underline">Fuel Tracker</h1>
	<sub class="italic">by toñ</sub>
</div>
<Accordion.Root type="single">
	{#each data.provinces as province, index}
		<Accordion.Item value={province}>
			<Accordion.Trigger class="mx-2">{province}</Accordion.Trigger>
			<Accordion.Content>
				<div class="grid w-full max-w-full gap-4 overflow-auto bg-gray-300 p-5 md:grid-cols-3">
					{#each data.item.filter((station) => station.Provincia === province) as station}
						<Card.Root class="flex flex-col justify-between">
							<Card.Header>
								<Card.Title>
									<p>{station.Rótulo}</p>
								</Card.Title>
								<Card.Description>
									<sub>{station.Dirección}, {station.Municipio}</sub>
								</Card.Description>
							</Card.Header>
							<Card.Content>
								{#each getPrecioFields(station) as { key, value }}
									<p><strong>{key.replace('Precio ', '')}:</strong> {value}</p>
								{/each}
							</Card.Content>
							<Card.Footer>
								<p>{station.Horario}</p>
							</Card.Footer>
						</Card.Root>
					{/each}
				</div>
			</Accordion.Content>
		</Accordion.Item>
	{/each}
</Accordion.Root>

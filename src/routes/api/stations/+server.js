import { json } from "@sveltejs/kit";

export async function GET() {
    const res = await fetch(
        'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres'
    );

    const data = await res.json()

    return {
        data: await data
    }
}
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    let { question } = await request.json();
    

    return json({ message: 'Hello from the AI server!' });
};
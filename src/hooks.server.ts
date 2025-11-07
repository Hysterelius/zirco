// from https://github.com/better-auth/examples/blob/main/svelte-kit-example/src/hooks.server.ts

import { auth } from '$lib/auth';
import { redirect, type Handle, type HandleServerError } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';

export const handle: Handle = async ({ event, resolve }) => {
	if (event.route.id?.startsWith('/(protected)/')) {
		const session = await auth.api.getSession({
			headers: event.request.headers
		});

		if (session) {
			event.locals.session = session?.session;
			event.locals.user = session?.user;

			return svelteKitHandler({ event, resolve, auth, building });
		} else {
			redirect(307, '/login');
		}
	} else if (event.route.id?.startsWith('/(unauthed)/')) {
		const session = await auth.api.getSession({
			headers: event.request.headers
		});

		if (session) {
			event.locals.session = session?.session;
			event.locals.user = session?.user;
			redirect(307, '/dashboard');
		} else {
			return svelteKitHandler({ event, resolve, auth, building });
		}
	} else {
		return svelteKitHandler({ event, resolve, auth, building });
	}
};

export const handleError: HandleServerError = ({ error }) => {
	// 1. Log the entire error object to the server's console
	console.error('SvelteKit Server Error:', error);

	// 2. Return a safe, non-sensitive message to the client
	return {
		message: 'Internal Server Error'
	};
};

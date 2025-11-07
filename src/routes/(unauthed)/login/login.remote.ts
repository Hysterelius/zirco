// login the user

import { form, getRequestEvent } from '$app/server';
import { auth } from '$lib/auth';
import { loginSchema } from './schema';

export const loginUser = form(loginSchema, async (data) => {
	try {
		const res = await auth.api.signInEmail({
			body: {
				email: data.email,
				password: data.password
			},
			headers: getRequestEvent().request.headers
		});

		console.log('Login successful:', res);
	} catch (e) {
		console.error('Login error:', e);
		throw new Error('Login failed');
	}
});

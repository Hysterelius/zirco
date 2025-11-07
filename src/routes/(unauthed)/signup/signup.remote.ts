// login the user

import { form } from '$app/server';
import { auth } from '$lib/auth';
import { redirect } from '@sveltejs/kit';
import { signupSchema } from './schema';

export const signupUser = form(signupSchema, async (data) => {
	try {
		await auth.api.signUpEmail({
			body: {
				email: data.email,
				password: data.password,
				name: data.name
			}
		});

		redirect(307, '/dashboard');
	} catch (e) {
		console.error('Signup error:', e);
		throw new Error('Signup failed');
	}
});

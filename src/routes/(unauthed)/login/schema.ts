// login schema

import { type } from 'arktype';

export const loginSchema = type({
	email: 'string.email',
	password: '8 <= string  <= 128'
});

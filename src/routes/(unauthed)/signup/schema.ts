import { loginSchema } from '../login/schema';

export const signupSchema = loginSchema.merge({
	name: '2 <= string <= 100'
});

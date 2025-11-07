<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let { class: className, ...restProps }: HTMLAttributes<HTMLFormElement> = $props();
	import StreamlineLogosGoogleLogoSolid from 'virtual:icons/streamline-logos/google-logo-solid';
	import { signupUser } from '../../routes/signup/signup.remote';
</script>

<form
	class={cn('flex flex-col gap-6', className)}
	{...restProps}
	{...signupUser}
	onfocusout={() => signupUser.validate()}
	novalidate
>
	<!-- no validate prevents the ugly validation messages from showing on mount -->
	<Field.Group>
		<div class="flex flex-col items-center gap-1 text-center">
			<h1 class="text-2xl font-bold">Create your account</h1>
			<p class="text-sm text-balance text-muted-foreground">
				Fill in the form below to create your account
			</p>
		</div>
		<Field.Field>
			<Field.Label for="name">Full Name</Field.Label>
			<Input id="name" placeholder="John Doe" required {...signupUser.fields.name.as('text')} />
			{#each signupUser.fields.name.issues() as issue}
				<Field.Error>{issue.message}</Field.Error>
			{/each}
		</Field.Field>

		<Field.Field>
			<Field.Label for="email">Email</Field.Label>
			<Input
				id="email"
				placeholder="m@example.com"
				required
				{...signupUser.fields.email.as('email')}
			/>
			<Field.Description>
				We'll use this to contact you. We will not share your email with anyone else.
			</Field.Description>
			{#each signupUser.fields.email.issues() as issue}
				<Field.Error>{issue.message}</Field.Error>
			{/each}
		</Field.Field>
		<Field.Field>
			<Field.Label for="password">Password</Field.Label>
			<Input
				id="password"
				required
				autocomplete="new-password"
				{...signupUser.fields.password.as('password')}
			/>
			<Field.Description>Must be at least 8 characters long.</Field.Description>
			{#each signupUser.fields.password.issues() as issue}
				<Field.Error>{issue.message}</Field.Error>
			{/each}
		</Field.Field>
		<Field.Field>
			<Field.Label for="confirm-password">Confirm Password</Field.Label>
			<Input id="confirm-password" type="password" required />
			<Field.Description>Please confirm your password.</Field.Description>
		</Field.Field>
		<Field.Field>
			<Button type="submit">Create Account</Button>
		</Field.Field>
		<Field.Separator>Or continue with</Field.Separator>
		<Field.Field>
			<Button variant="outline" type="button">
				<StreamlineLogosGoogleLogoSolid class="mr-2 size-5" />
				Sign up with Google
			</Button>
			<Field.Description class="px-6 text-center">
				Already have an account? <a href="/signup">Sign in</a>
			</Field.Description>
		</Field.Field>
	</Field.Group>
</form>

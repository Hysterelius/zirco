<script lang="ts">
	import { addDashboardData, loadDashboardData } from './data.remote';
	import { FieldGroup, FieldLabel, FieldDescription } from '$lib/components/ui/field/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	// load data
	const data = $derived(await loadDashboardData());
</script>

<svelte:head>
	<title>Dashboard</title>
	<meta name="description" content="User dashboard page" />
</svelte:head>

<h1>Dashboard!</h1>

<ul>
	{#each data.timesheets as timesheet}
		<li>
			Date: {timesheet.date}, Start Time: {timesheet.startTime}, End Time: {timesheet.endTime},
			Adjustments: {timesheet.adjustments ?? 0}
		</li>
	{/each}
</ul>

<form {...addDashboardData} onfocusout={() => addDashboardData.validate()} novalidate>
	<FieldGroup>
		<Field.Field>
			<FieldLabel for="date">Date</FieldLabel>
			<Input
				id="date"
				placeholder="YYYY-MM-DD"
				required
				{...addDashboardData.fields.date.as('date')}
			/>
			{#each addDashboardData.fields.date.issues() as issue}
				<Field.Error>{issue.message}</Field.Error>
			{/each}
		</Field.Field>
		<Field.Field>
			<div class="flex items-center">
				<FieldLabel for="startTime">Start Time</FieldLabel>
			</div>
			<Input id="startTime" required {...addDashboardData.fields.startTime.as('time')} />
			{#each addDashboardData.fields.startTime.issues() as issue}
				<Field.Error>{issue.message}</Field.Error>
			{/each}
		</Field.Field>
		<Field.Field>
			<div class="flex items-center">
				<FieldLabel for="endTime">End Time</FieldLabel>
			</div>
			<Input id="endTime" required {...addDashboardData.fields.endTime.as('time')} />
			{#each addDashboardData.fields.endTime.issues() as issue}
				<Field.Error>{issue.message}</Field.Error>
			{/each}
		</Field.Field>
		<Field.Field>
			<div class="flex items-center">
				<FieldLabel for="adjustments">Adjustments</FieldLabel>
			</div>
			<Input id="adjustments" {...addDashboardData.fields.adjustments.as('number')} />
			{#each addDashboardData.fields.adjustments.issues() as issue}
				<Field.Error>{issue.message}</Field.Error>
			{/each}
		</Field.Field>

		<Field.Field>
			<Button type="submit" class="w-full">Submit</Button>
		</Field.Field>
	</FieldGroup>
</form>

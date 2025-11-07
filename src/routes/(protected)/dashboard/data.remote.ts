// remote functions for the dashboard data

import { form, query } from '$app/server';
import { getAuthSession } from '$lib/server/auth.remote';
import { db } from '$lib/server/db';
import { timesheet } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { type } from 'arktype';
import type { Timesheet } from './types';

// seed timesheets

function seedTimesheets(user: string): Omit<Timesheet, 'id'>[] {
	return [
		{
			userId: user,
			date: new Date('2024-06-01'),
			startTime: '09:00',
			endTime: '17:00',
			adjustments: 0
		},
		{
			userId: user,
			date: new Date('2024-06-02'),
			startTime: '09:15',
			endTime: '17:15',
			adjustments: 0.5
		},
		{
			userId: user,
			date: new Date('2024-06-03'),
			startTime: '08:45',
			endTime: '16:45',
			adjustments: -0.25
		}
	];
}

export const loadDashboardData = query(async () => {
	// get auth session

	const session = await getAuthSession();

	const user = session?.user.id ?? null;

	if (!user) {
		return error(403, 'Not authorized');
	}

	const result = await db.query.timesheet.findMany({
		where: (timesheet, { eq }) => eq(timesheet.userId, user)
	});

	if (result.length === 0) {
		const new_vals = seedTimesheets(user);

		await db.insert(timesheet).values(new_vals);

		// re-fetch after seeding
		return {
			timesheets: new_vals
		};
	}

	return {
		timesheets: result
	};
});

const insertTimesheetSchema = type({
	date: 'string.date.iso.parse',
	startTime: /\d{2}:\d{2}/,
	endTime: /\d{2}:\d{2}/,
	adjustments: 'number?'
});

export const addDashboardData = form(insertTimesheetSchema, async (data) => {
	const session = await getAuthSession();

	const user = session?.user.id ?? null;

	if (!user) {
		return error(403, 'Not authorized');
	}

	await db.insert(timesheet).values({
		...data,
		userId: user
	});

	await loadDashboardData().refresh();
});

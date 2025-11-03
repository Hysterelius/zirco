// remote functions for the dashboard data

import { form, query } from "$app/server";
import { getAuthSession } from "$lib/server/auth.remote";
import { db } from "$lib/server/db";
import { timesheet } from "$lib/server/db/schema";
import { error } from "@sveltejs/kit";
import { type } from "arktype";


export const loadDashboardData = query(async () => {
    // get auth session

    const session = await getAuthSession();

    const user = session?.user.id ?? null;

    if (!user) {
        return error(403, "Not authorized");   
    }

    const result = db.query.timesheet.findMany({
        where: (timesheet, { eq }) => eq(timesheet.userId, user)
    });

    return {
        timesheets: result
    };
})



const insertTimesheetSchema = type({
    date: "string.date.iso.parse",
    "startTime": /\d{2}:\d{2}/,
    "endTime": /\d{2}:\d{2}/,
    "adjustments?": "number"
});

export const addDashboardData = form(insertTimesheetSchema, async (data) => {
    const session = await getAuthSession();

    const user = session?.user.id ?? null;

    if (!user) {
        return error(403, "Not authorized");   
    }

    await db.insert(timesheet).values({
        ...data,
        userId: user
    });

    await loadDashboardData().refresh();
})
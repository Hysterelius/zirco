import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { user } from '.';

export const timesheet = sqliteTable('timesheet', {
	id: text('id')
		.primaryKey()
		.notNull()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	date: integer('date', { mode: 'timestamp_ms' }),
	// hoursWorked: integer("hours_worked").notNull(),
	startTime: text('start_time').notNull(),
	endTime: text('end_time').notNull(),
	adjustments: integer('adjustments')
});

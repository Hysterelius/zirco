// timesheet type

export type Timesheet = {
	id: string;
	userId: string;
	date: Date;
	startTime: string;
	endTime: string;
	adjustments: number;
};

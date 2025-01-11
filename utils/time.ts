// Creates the main time utility functions

// Short date dd/mm/yy

export const shortDate = new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    timeZone: "UTC",
});

// 24-hour time hh:mm
export const time24 = new Intl.DateTimeFormat("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
});

// 12-hour time hh:mm AM/PM
export const time12 = new Intl.DateTimeFormat("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
});
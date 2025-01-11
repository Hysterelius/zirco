import { defineStore } from "pinia";
import { computed } from "vue";

export enum BreakCategory {
  Lunch = "Lunch",
  Transport = "Transport",
  Personal = "Personal",
  Other = "Other",
}

export enum EntryState {
  Draft = "Draft",
  Active = "Active",
  Sent = "Sent",
}

export interface Break {
  category: BreakCategory;
  start_time: Date;
  end_time: Date;
}

interface EntryStatus {
  state: EntryState;
  entry_in_id?: string[];
}

interface Calculations {
  totalHours: number;
  totalBreakTime: number;
  breaks: boolean;
  netHours: number;
}

export interface Entry {
  id: string;
  item: string;
  date: Date;
  start_time: Date;
  end_time: Date;
  breaks?: Break[];
  status: EntryStatus;
  calcs: Calculations;
  actual?: boolean | Times;
}

interface Times {
  start_times: Date;
  end_times: Date;
}

export interface MiniEntry {
  id?: string;
  item: string;
  date: Date;
  start_time: Date;
  end_time: Date;
  breaks?: Break[];
  status?: EntryStatus;
  calcs?: Calculations;
  actual?: boolean | Times;
}

export const useEntryData = defineStore("entryData", () => {
  const entries = useLocalStorage("entries", [] as Entry[]);

  // When loading from local storage, take the strings and remake the dates
  entries.value.forEach((entry) => {
    entry.date = new Date(entry.date);
    entry.start_time = new Date(entry.start_time);
    entry.end_time = new Date(entry.end_time);

    if (entry.breaks) {
      entry.breaks.forEach((b) => {
        b.start_time = new Date(b.start_time);
        b.end_time = new Date(b.end_time);
      });
    }
  });

  // sort entries by date
  entries.value.sort((a, b) => {
    const aDate = new Date(a.date);
    const bDate = new Date(b.date);

    // if either date is invalid, return error
    if (isNaN(aDate.getTime()) || isNaN(bDate.getTime())) {
      throw new Error("Invalid date");
    }

    if (aDate < bDate) return -1;
    if (aDate > bDate) return 1;
    return 0;
  });

  function addEntry(entry: Entry) {
    entries.value.push(entry);
  }

  function removeEntry(entry: Entry) {
    console.log(entry.id);
    const index = entries.value.findIndex((i) => i.id === entry.id);
    if (index !== -1) {
      entries.value.splice(index, 1);
    }
  }

  function removeEntries(entrys: Entry[]) {
    entrys.forEach((entry) => {
      const index = entries.value.findIndex((i) => i.id === entry.id);
      if (index !== -1) {
        entries.value.splice(index, 1);
      }
    });
  }

  function updateEntries(entrys: Entry[]) {
    entries.value = entrys;
  }

  function editEntry(entry: Entry) {
    const index = entries.value.findIndex((i) => i.id === entry.id);
    entries.value[index] = entry;
  }

  function sortEntries() {
    entries.value.sort((a, b) => {
      const aDate = new Date(a.date);
      const bDate = new Date(b.date);

      // if either date is invalid, return error
      if (isNaN(aDate.getTime()) || isNaN(bDate.getTime())) {
        throw new Error("Invalid date");
      }

      if (aDate < bDate) return -1;
      if (aDate > bDate) return 1;
      return 0;
    });
  }

  const activeEntries = computed(() => {
    return entries.value
      .filter((entry) => entry.status?.state === EntryState.Active)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  const sentEntries = computed(() => {
    return entries.value
      .filter((entry) => entry.status?.state === EntryState.Sent)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  const sentEntriesFY = computed(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    let startDate;
    let endDate;

    if (month < 6) {
      startDate = new Date(year - 1, 6, 1);
      endDate = new Date(year, 6, 1);
    } else {
      startDate = new Date(year, 6, 1);
      endDate = new Date(year + 1, 6, 1);
    }

    return entries.value
      .filter((entry) => entry.status?.state === EntryState.Sent)
      .filter(
        (entry) =>
          new Date(entry.date) >= startDate && new Date(entry.date) < endDate
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  function entriesFY(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    let startDate;
    let endDate;
    if (month < 6) {
      startDate = new Date(year - 1, 6, 1);
      endDate = new Date(year, 6, 1);
    } else {
      startDate = new Date(year, 6, 1);
      endDate = new Date(year + 1, 6, 1);
    }

    return entries.value
      .filter(
        (entry) =>
          new Date(entry.date) >= startDate && new Date(entry.date) < endDate
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  const entriesSorted = computed(() => {
    return entries.value.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  });

  return {
    entries,
    addEntry,
    removeEntry,
    removeEntries,
    updateEntries,
    editEntry,
    sortEntries,
    activeEntries,
    sentEntries,
    sentEntriesFY,
    entriesFY,
    entriesSorted,
  };
});

export function doCalculations(item: MiniEntry): Calculations {
  const start = new Date(item.start_time);
  const end = new Date(item.end_time);

  let totalHours = (end.getTime() - start.getTime()) / 1000 / 60 / 60;
  totalHours = Math.round(totalHours * 100) / 100;

  // if (totalHours < 0 || isNaN(totalHours) || totalHours > 24) {
  //   throw new Error("Invalid time entry");
  // }

  let totalBreakTime = 0;
  if (item.breaks && (item.calcs?.breaks === undefined || item.calcs?.breaks)) {
    item.breaks.forEach((b) => {
      const bStart = new Date(b.start_time);
      const bEnd = new Date(b.end_time);

      totalBreakTime += (bEnd.getTime() - bStart.getTime()) / 1000 / 60 / 60;
    });
  } else if (item.breaks && !item.calcs?.breaks) {
    // delete item.breaks;
    item.breaks = undefined;
  }

  totalBreakTime = Math.round(totalBreakTime * 100) / 100;

  const breaks = item.breaks && item.breaks.length > 0 ? true : false;

  const netHours = totalHours - totalBreakTime;

  return {
    totalHours,
    totalBreakTime,
    breaks,
    netHours,
  };
}

export function breakIcons(category: BreakCategory | string): string {
  if (typeof category === "string") {
    category = category as BreakCategory;
  }

  switch (category) {
    case BreakCategory.Lunch:
      return "tabler:soup";
    case BreakCategory.Transport:
      return "tabler:bus";
    case BreakCategory.Personal:
      return "tabler:fingerprint";
    case BreakCategory.Other:
      return "tabler:clubs";
    default:
      return "tabler:question-mark";
  }
}

/**
 * Normalises the start and end times of each entry in the array to the nearest specified number of minutes.
 *
 * @param {number} minutes_normalised - The number of minutes to which the start and end times should be normalised.
 * @param {Entry[]} entries - An array of entries, each containing start and end times to be normalised.
 *
 * @remarks
 * This function adjusts the start time of each entry to the nearest lower multiple of `minutes_normalised`
 * and the end time to the nearest higher multiple of `minutes_normalised`.
 * It also stores the original start and end times in the `actual` property of each entry.
 */
export function normaliseHours(
  minutes_normalised: number,
  entries: Entry[] | Entry
) {
  // for each entry in the array, normalise the start and end times to the nearest x minutes

  // return error if minutes_normalised is not a positive integer or above 60
  if (
    minutes_normalised <= 0 ||
    !Number.isInteger(minutes_normalised) ||
    minutes_normalised > 60
  ) {
    throw new Error("Invalid number of minutes");
  }

  if (!Array.isArray(entries)) {
    entries = [entries];
  }

  entries.forEach((entry) => {
    const start_mins = entry.start_time.getMinutes();
    const end_mins = entry.end_time.getMinutes();

    const start_diff = start_mins % minutes_normalised;
    const end_diff = end_mins % minutes_normalised;

    entry.actual = {
      start_times: entry.start_time,
      end_times: entry.end_time,
    };

    if (start_diff !== 0) {
      if (start_diff < minutes_normalised / 2) {
        entry.start_time.setMinutes(start_mins - start_diff);
      } else {
        entry.start_time.setMinutes(
          start_mins + (minutes_normalised - start_diff)
        );
      }
    }

    if (end_diff !== 0) {
      if (end_diff < minutes_normalised / 2) {
        entry.end_time.setMinutes(end_mins - end_diff);
      } else {
        entry.end_time.setMinutes(end_mins + (minutes_normalised - end_diff));
      }
    }

    // recalculate the total hours and break time
    entry.calcs = doCalculations(entry);
  });
}

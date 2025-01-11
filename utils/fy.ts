import { EntryState } from "../stores/entries"; // Adjust the import path as necessary

export function filterEntriesByFinancialYear(entries: Entry[], date: Date) {
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

  return entries
    .filter((entry) => entry.status.state === EntryState.Sent)
    .filter(
      (entry) =>
        new Date(entry.date) >= startDate && new Date(entry.date) < endDate
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

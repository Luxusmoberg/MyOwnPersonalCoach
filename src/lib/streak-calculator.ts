import type { Checkin } from "@/types/checkin";

export function calculateStreak(checkins: Checkin[]): {
  current: number;
  longest: number;
} {
  if (checkins.length === 0) return { current: 0, longest: 0 };

  // Get unique dates sorted descending
  const dates = [
    ...new Set(checkins.map((c) => c.date.split("T")[0])),
  ].sort((a, b) => b.localeCompare(a));

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000)
    .toISOString()
    .split("T")[0];

  // Current streak: count consecutive days going backwards from today/yesterday
  let current = 0;
  const startDate = dates[0] === today || dates[0] === yesterday ? dates[0] : null;

  if (startDate) {
    let checkDate = new Date(startDate);
    for (const dateStr of dates) {
      const expected = checkDate.toISOString().split("T")[0];
      if (dateStr === expected) {
        current++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (dateStr < expected) {
        break;
      }
    }
  }

  // Longest streak: scan all dates
  let longest = 0;
  let tempStreak = 0;
  const sortedDates = [...new Set(checkins.map((c) => c.date.split("T")[0]))]
    .sort((a, b) => a.localeCompare(b));

  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diffDays =
        (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    longest = Math.max(longest, tempStreak);
  }

  return { current, longest };
}


import { useMemo } from "react";
import { addHours, subHours, parseISO } from "date-fns";

export function useLiveTimingWindow() {
  // GP Canadá 2025: 15/jun/2025 15:00 Brasil — UTC "2025-06-15T18:00:00Z"
  const raceStart = parseISO("2025-06-15T18:00:00Z");
  const raceEnd = addHours(raceStart, 2);
  const oneHourBefore = subHours(raceStart, 1);
  const now = new Date();
  return useMemo(() => now >= oneHourBefore && now <= raceEnd, [now, oneHourBefore, raceEnd]);
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function startOfWeek(date = new Date()) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  const day = result.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diffToMonday);
  return result;
}

export function weekDateOptions(date = new Date()) {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, index) => {
    const item = new Date(start.getTime() + index * DAY_MS);
    return {
      value: item.toISOString(),
      label: item.toLocaleDateString("en", {
        weekday: "long",
        month: "short",
        day: "numeric"
      })
    };
  });
}


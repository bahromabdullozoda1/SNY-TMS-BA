export function getWeekDays(startDate = new Date()) {
  const date = new Date(startDate);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);

  const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
  return Array.from({ length: 7 }).map((_, index) => {
    const current = new Date(date);
    current.setDate(date.getDate() + index);
    return {
      key: current.toISOString().slice(0, 10),
      label: formatter.format(current),
      shortDay: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][index]
    };
  });
}

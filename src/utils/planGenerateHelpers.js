/**
 * Build start_dt (ISO) and inclusive end_dt for POST .../workout-plans/:id/generate/
 * Backend uses only the calendar date from start_dt; workout times come from plan links.
 */
export function combineLocalDateTimeToISO(dateStr, timeStr) {
  if (!dateStr?.trim()) return null;
  const t = timeStr?.trim() || "12:00";
  const d = new Date(`${dateStr}T${t}:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** YYYY-MM-DD in local timezone */
export function toLocalDateInputValue(d) {
  const z = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

export function formatDateToYYYYMMDD(date) {
  if (!date || Number.isNaN(date.getTime())) return null;
  return toLocalDateInputValue(date);
}

/** Default: today (local) → ISO anchor noon, end = today + 14 days inclusive. */
export function defaultPlanGeneratePayload() {
  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 14);
  const startDate = toLocalDateInputValue(start);
  const endDate = toLocalDateInputValue(end);
  const start_dt = combineLocalDateTimeToISO(startDate, "12:00");
  return { start_dt, end_dt: endDate };
}

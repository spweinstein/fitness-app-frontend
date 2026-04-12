/**
 * Parse weight value to decimal (for API)
 */
export const parseWeight = (weightValue) => {
  if (weightValue === "" || weightValue === null || weightValue === undefined) {
    return null;
  }
  const num = parseFloat(weightValue);
  return isNaN(num) ? null : num;
};

/**
 * Parse numeric field to integer (for API)
 */
export const parseNumericField = (value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }
  const num = parseInt(String(value).trim(), 10);
  return isNaN(num) ? null : num;
};

/**
 * Convert ISO datetime string to datetime-local format
 */
export const toDateTimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (num) => String(num).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hour}:${minute}`;
};

/**
 * Convert datetime-local value to ISO string
 */
export const toIsoStringOrNull = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

/** RPE 1–10 only; empty or slider "unset" (0) → null for API */
export const parseRpeField = (value) => {
  const n = parseNumericField(value);
  if (n == null || n < 1) return null;
  return n;
};

/**
 * Prepare item data for API submission
 */
export const prepareItemData = (item, index) => ({
  id: item.id,
  exercise: item.exercise,
  sets: parseNumericField(item.sets),
  reps: parseNumericField(item.reps),
  weight: parseWeight(item.weight),
  weight_unit: item.weight_unit || "lb",
  distance: parseNumericField(item.distance),
  distance_unit: item.distance_unit || "km",
  duration: parseNumericField(item.duration),
  rpe: parseRpeField(item.rpe),
  notes: item.notes || "",
  order: index,
});

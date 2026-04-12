/** Keys that are not per-field validation messages. */
const META_KEYS = new Set(["detail", "non_field_errors", "errors"]);

function stringifyErrorItem(item) {
  if (item == null) return "";
  if (typeof item === "string") return item;
  if (typeof item === "number" || typeof item === "boolean") return String(item);
  if (typeof item === "object") {
    if (typeof item.detail === "string") return item.detail;
    if (typeof item.message === "string") return item.message;
  }
  return "";
}

function formatErrorsArray(errors) {
  if (!Array.isArray(errors) || !errors.length) return "";
  return errors.map(stringifyErrorItem).filter(Boolean).join(" ");
}

/** Combine summary `detail` with `errors` without repeating identical text (409 conflicts). */
function mergeDetailWithErrors(summary, errors) {
  const base =
    typeof summary === "string" ? summary.trim() : String(summary ?? "").trim();
  if (!base) {
    return formatErrorsArray(errors);
  }
  if (!Array.isArray(errors) || !errors.length) {
    return base;
  }
  const extra = errors
    .map((item) => stringifyErrorItem(item).trim())
    .filter(Boolean)
    .filter((msg) => msg !== base);
  const unique = [...new Set(extra)];
  return unique.length ? `${base} ${unique.join(" ")}` : base;
}

/**
 * Flatten DRF `detail` when it is not a plain string (e.g. list of ErrorDetail,
 * or a nested object from a custom APIException).
 */
function flattenDetail(detail) {
  if (detail == null) return "";
  if (typeof detail === "string") return detail.trim();
  if (Array.isArray(detail)) {
    const parts = detail.map(stringifyErrorItem).filter(Boolean);
    return [...new Set(parts)].join(" ");
  }
  if (typeof detail === "object") {
    if (typeof detail.detail === "string" && detail.detail.trim()) {
      return mergeDetailWithErrors(detail.detail, detail.errors);
    }
    const parts = [];
    if (detail.detail != null && detail.detail !== detail) {
      const inner = flattenDetail(detail.detail);
      if (inner) parts.push(inner);
    }
    if (Array.isArray(detail.errors)) {
      const e = formatErrorsArray(detail.errors);
      if (e) parts.push(e);
    }
    for (const k of ["message", "error"]) {
      if (typeof detail[k] === "string" && detail[k].trim()) {
        parts.push(detail[k].trim());
      }
    }
    return [...new Set(parts)].join(" ");
  }
  return "";
}

function collectFieldMessages(data) {
  if (!data || typeof data !== "object") return "";
  const msgs = [];
  for (const [key, val] of Object.entries(data)) {
    if (META_KEYS.has(key)) continue;
    if (typeof val === "string" && val.trim()) msgs.push(val.trim());
    else if (Array.isArray(val)) {
      const s = formatErrorsArray(val);
      if (s) msgs.push(s);
    } else if (val && typeof val === "object") {
      const nested = collectFieldMessages(val);
      if (nested) msgs.push(nested);
    }
  }
  return msgs.join(" ");
}

/** Extract a user-visible message from an axios-style API error. */
export function apiErrorMessage(error, fallback) {
  const d = error?.response?.data;

  if (d == null) {
    return error?.message || fallback;
  }

  if (typeof d === "string" && d.trim()) {
    return d.trim();
  }

  if (typeof d !== "object") {
    return error?.message || fallback;
  }

  // 409 schedule/generate conflict: { detail: "…", errors: [ … ] }
  if (typeof d.detail === "string" && d.detail.trim()) {
    return mergeDetailWithErrors(d.detail, d.errors);
  }

  // DRF often nests custom APIException dicts: { detail: { detail: "…", errors: [ … ] } }
  if (
    d.detail != null &&
    typeof d.detail === "object" &&
    !Array.isArray(d.detail) &&
    typeof d.detail.detail === "string" &&
    d.detail.detail.trim()
  ) {
    return mergeDetailWithErrors(d.detail.detail, d.detail.errors);
  }

  const fromDetail = flattenDetail(d.detail);
  if (fromDetail) return fromDetail;

  const fromErrors = formatErrorsArray(d.errors);
  if (fromErrors) return fromErrors;

  if (Array.isArray(d.non_field_errors) && d.non_field_errors.length) {
    const s = formatErrorsArray(d.non_field_errors);
    if (s) return s;
  }

  const fields = collectFieldMessages(d);
  if (fields) return fields;

  return error?.message || fallback;
}

import { z } from "zod";
import { INITIAL_ITEM } from "@/src/features/training/forms/exercise-form-fields/ExerciseFormFields.jsx";
import { prepareItemData } from "@/src/utils/formHelpers.js";

/** One row in the form (strings from inputs; optional server id). */
export const templateExerciseRowSchema = z.object({
  id: z.any().optional(),
  exercise: z.union([z.string(), z.number()]).optional(),
  sets: z.any().optional(),
  reps: z.any().optional(),
  weight: z.any().optional(),
  weight_unit: z.string().optional(),
  distance: z.any().optional(),
  distance_unit: z.string().optional(),
  duration: z.any().optional(),
  rpe: z.any().optional(),
  notes: z.string().optional(),
  order: z.number().optional(),
});

export const workoutTemplateSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  // Match API: description may be blank; avoid rejecting legacy rows on load/save.
  description: z.string().trim(),
  // Form keeps string/number from inputs or API; empty or non-numeric is OK here — toApiShape sends null when not finite.
  duration: z.preprocess(
    (val) => (val === null || val === undefined ? "" : val),
    z.union([z.string(), z.number()]),
  ).transform((val) => (val === "" ? "" : String(val))),
  items: z.array(templateExerciseRowSchema),
});

function mapApiItemsToFormItems(items) {
  if (!items?.length) return [{ ...INITIAL_ITEM, order: 0 }];
  return items.map((item, index) => ({
    id: item.id,
    exercise:
      typeof item.exercise === "object"
        ? (item.exercise?.id ?? "")
        : (item.exercise ?? ""),
    sets: item.sets ?? "",
    reps: item.reps ?? "",
    weight: item.weight ?? "",
    weight_unit: item.weight_unit || "lb",
    distance: item.distance ?? "",
    distance_unit: item.distance_unit || "km",
    duration: item.duration ?? "",
    rpe: item.rpe ?? "",
    notes: item.notes || "",
    order: item.order ?? index,
  }));
}

export function defaultsFromProps(defaultValues) {
  const base = !defaultValues
    ? { title: "", description: "", duration: "" }
    : {
        title: defaultValues.title ?? "",
        description: defaultValues.description ?? "",
        duration:
          defaultValues.duration == null ? "" : String(defaultValues.duration),
      };
  return {
    ...base,
    items: mapApiItemsToFormItems(defaultValues?.items),
  };
}

export function toApiShape(data) {
  const durationRaw = data.duration;
  const durationNum =
    durationRaw === "" || durationRaw == null ? null : Number(durationRaw);

  const items = (data.items ?? [])
    .filter(
      (row) =>
        row.exercise !== "" &&
        row.exercise != null &&
        String(row.exercise).trim() !== "",
    )
    .map((row, index) => prepareItemData(row, index));

  return {
    title: data.title.trim(),
    description: data.description.trim() || null,
    duration: Number.isFinite(durationNum) ? durationNum : null,
    items,
  };
}

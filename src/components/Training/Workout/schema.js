import { z } from "zod";
import { INITIAL_ITEM } from "../../shared/ExerciseFormFields/ExerciseFormFields.jsx";
import {
  prepareItemData,
  toDateTimeLocal,
  toIsoStringOrNull,
} from "../../../utils/formHelpers.js";
import { templateExerciseRowSchema } from "../WorkoutTemplate/schema.js";

export const workoutSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),
    start_dt: z.string().trim().min(1, "Start is required"),
    end_dt: z.string().trim().min(1, "End is required"),
    status: z.enum(["planned", "completed", "skipped", "canceled"]),
    notes: z.string().optional(),
    items: z.array(templateExerciseRowSchema),
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.start_dt);
    const end = new Date(data.end_dt);
    if (Number.isNaN(start.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid start date",
        path: ["start_dt"],
      });
    }
    if (Number.isNaN(end.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid end date",
        path: ["end_dt"],
      });
    }
    if (
      !Number.isNaN(start.getTime()) &&
      !Number.isNaN(end.getTime()) &&
      end < start
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End must be on or after start",
        path: ["end_dt"],
      });
    }
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

export function workoutDefaultsFromProps(defaultValues) {
  const now = new Date();
  const end = new Date(now.getTime() + 60 * 60 * 1000);
  return {
    title: defaultValues?.title ?? "",
    start_dt: defaultValues?.start_dt
      ? toDateTimeLocal(defaultValues.start_dt)
      : toDateTimeLocal(now),
    end_dt: defaultValues?.end_dt
      ? toDateTimeLocal(defaultValues.end_dt)
      : toDateTimeLocal(end),
    status: defaultValues?.status ?? "planned",
    notes: defaultValues?.notes ?? "",
    items: mapApiItemsToFormItems(defaultValues?.items),
  };
}

export function workoutToApiShape(data) {
  const start = toIsoStringOrNull(data.start_dt);
  const end = toIsoStringOrNull(data.end_dt);
  const items = (data.items ?? [])
    .filter(
      (row) =>
        row.exercise !== "" &&
        row.exercise != null &&
        String(row.exercise).trim() !== "",
    )
    .map((row, index) => prepareItemData(row, index));

  const result = {
    title: data.title.trim(),
    start_dt: start,
    end_dt: end,
    status: data.status,
    notes: (data.notes ?? "").trim() || "",
    items,
  };

  if (start == null) delete result.start_dt;
  if (end == null) delete result.end_dt;
  return result;
}

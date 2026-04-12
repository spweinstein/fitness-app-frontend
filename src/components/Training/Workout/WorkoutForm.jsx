import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  workoutSchema,
  workoutDefaultsFromProps,
  workoutToApiShape,
} from "./schema.js";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/src/components/shared/LoadingSpinner/LoadingSpinner.jsx";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ExerciseFieldGroup from "../ExerciseFieldGroup/ExerciseFieldGroup.jsx";

const STATUS_OPTIONS = [
  { value: "planned", label: "Planned" },
  { value: "completed", label: "Completed" },
  { value: "skipped", label: "Skipped" },
  { value: "canceled", label: "Canceled" },
];

export default function WorkoutForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Save",
  heading = "Workout",
  error: externalError = "",
  isSubmitting = false,
  exercises = [],
}) {
  const form = useForm({
    resolver: zodResolver(workoutSchema),
    defaultValues: workoutDefaultsFromProps(defaultValues),
  });

  const { register, handleSubmit, reset, formState, control } = form;
  const { errors } = formState;
  const status = useWatch({ control, name: "status" });
  const isCompleted = status && status.toLowerCase() === "completed";

  useEffect(() => {
    reset(workoutDefaultsFromProps(defaultValues));
  }, [defaultValues, reset]);

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(workoutToApiShape(data)))}
      className="mx-auto w-full max-w-3xl space-y-3 px-2 py-1"
    >
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{heading}</h1>
        <p className="text-muted-foreground mt-0.5 text-xs leading-snug">
          Schedule, status, and exercises.
        </p>
      </div>

      {(externalError || "").trim() ? (
        <p
          className="text-destructive text-sm"
          role="alert"
          id="workout-instance-error"
        >
          {externalError}
        </p>
      ) : null}

      <div className="space-y-1.5">
        <Label
          htmlFor="workout-instance-title"
          className="text-muted-foreground text-xs"
        >
          Title
        </Label>
        <Input
          id="workout-instance-title"
          autoComplete="off"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.title)}
          className="h-8"
          aria-describedby={
            errors.title?.message ? "workout-instance-title-error" : undefined
          }
          {...register("title")}
        />
        {errors.title?.message ? (
          <p
            className="text-destructive text-xs"
            id="workout-instance-title-error"
          >
            {errors.title.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label
            htmlFor="workout-instance-start"
            className="text-muted-foreground text-xs"
          >
            Start
          </Label>
          <Input
            id="workout-instance-start"
            type="datetime-local"
            disabled={isSubmitting}
            className="h-8"
            aria-invalid={Boolean(errors.start_dt)}
            aria-describedby={
              errors.start_dt?.message
                ? "workout-instance-start-error"
                : undefined
            }
            {...register("start_dt")}
          />
          {errors.start_dt?.message ? (
            <p
              className="text-destructive text-xs"
              id="workout-instance-start-error"
            >
              {errors.start_dt.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="workout-instance-end"
            className="text-muted-foreground text-xs"
          >
            End
          </Label>
          <Input
            id="workout-instance-end"
            type="datetime-local"
            disabled={isSubmitting}
            className="h-8"
            aria-invalid={Boolean(errors.end_dt)}
            aria-describedby={
              errors.end_dt?.message ? "workout-instance-end-error" : undefined
            }
            {...register("end_dt")}
          />
          {errors.end_dt?.message ? (
            <p
              className="text-destructive text-xs"
              id="workout-instance-end-error"
            >
              {errors.end_dt.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="workout-instance-status"
          className="text-muted-foreground text-xs"
        >
          Status
        </Label>
        <select
          id="workout-instance-status"
          className="border-input bg-background h-8 w-full max-w-xs rounded-md border px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.status)}
          {...register("status")}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {errors.status?.message ? (
          <p className="text-destructive text-xs">{errors.status.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="workout-instance-notes"
          className="text-muted-foreground text-xs"
        >
          Notes
        </Label>
        <Textarea
          id="workout-instance-notes"
          rows={2}
          disabled={isSubmitting}
          className="min-h-0 py-2"
          {...register("notes")}
        />
      </div>

      <ExerciseFieldGroup
        control={control}
        register={register}
        exercises={exercises}
        disabled={isSubmitting}
        notesFieldIdPrefix="workout-item-notes"
        isCompleted={isCompleted}
      />

      <div className="sticky bottom-0 z-10 -mx-2 mt-2 border-t border-border/80 bg-background py-3 backdrop-blur-sm supports-backdrop-filter:bg-background/95">
        <div className="flex flex-wrap gap-2 px-2">
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? (
              <LoadingSpinner
                variant="inline"
                size="sm"
                message="Saving…"
                ariaLive="off"
              />
            ) : (
              submitLabel
            )}
          </Button>
          {onCancel ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={onCancel}
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </div>
    </form>
  );
}

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  workoutTemplateSchema,
  defaultsFromProps,
  toApiShape,
} from "@/src/features/training/workout-template/schema.js";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/src/shared/feedback/LoadingSpinner.jsx";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ExerciseFieldGroup from "@/src/features/training/exercise-field-group/ExerciseFieldGroup.jsx";

/**
 * Shared template fields (training hub). RHF + zod.
 * Scrolls in the middle; actions stay pinned at the bottom when height is constrained (e.g. modal).
 */
export default function WorkoutTemplateForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Save",
  heading = "Template",
  error: externalError = "",
  isSubmitting = false,
  exercises = [],
}) {
  const form = useForm({
    resolver: zodResolver(workoutTemplateSchema),
    defaultValues: defaultsFromProps(defaultValues),
  });

  const { register, handleSubmit, reset, formState, control } = form;
  const { errors } = formState;

  useEffect(() => {
    reset(defaultsFromProps(defaultValues));
  }, [defaultValues, reset]);

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(toApiShape(data)))}
      className="mx-auto w-full max-w-3xl space-y-3 px-2 py-1"
    >
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{heading}</h1>
        <p className="text-muted-foreground mt-0.5 text-xs leading-snug">
          Template details and exercises.
        </p>
      </div>

      {(externalError || "").trim() ? (
        <p
          className="text-destructive text-sm"
          role="alert"
          id="workout-template-error"
        >
          {externalError}
        </p>
      ) : null}

      <div className="space-y-1.5">
        <Label
          htmlFor="workout-template-title"
          className="text-muted-foreground text-xs"
        >
          Title
        </Label>
        <Input
          id="workout-template-title"
          autoComplete="off"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.title)}
          className="h-8"
          aria-describedby={
            errors.title?.message ? "workout-template-title-error" : undefined
          }
          required={true}
          {...register("title")}
        />
        {errors.title?.message ? (
          <p
            className="text-destructive text-xs"
            id="workout-template-title-error"
          >
            {errors.title.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="workout-template-description"
          className="text-muted-foreground text-xs"
        >
          Description
        </Label>
        <Textarea
          id="workout-template-description"
          rows={2}
          disabled={isSubmitting}
          className="min-h-0 py-2"
          aria-invalid={Boolean(errors.description)}
          aria-describedby={
            errors.description?.message
              ? "workout-template-description-error"
              : undefined
          }
          {...register("description")}
        />
        {errors.description?.message ? (
          <p
            className="text-destructive text-xs"
            id="workout-template-description-error"
          >
            {errors.description.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="workout-template-duration"
          className="text-muted-foreground text-xs"
        >
          Duration (minutes)
        </Label>
        <Input
          id="workout-template-duration"
          type="number"
          min={0}
          disabled={isSubmitting}
          className="h-8"
          aria-invalid={Boolean(errors.duration)}
          aria-describedby={
            errors.duration?.message
              ? "workout-template-duration-error"
              : undefined
          }
          {...register("duration")}
        />
        {errors.duration?.message ? (
          <p
            className="text-destructive text-xs"
            id="workout-template-duration-error"
          >
            {errors.duration.message}
          </p>
        ) : null}
      </div>

      <ExerciseFieldGroup
        control={control}
        register={register}
        exercises={exercises}
        disabled={isSubmitting}
        isCompleted={false}
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

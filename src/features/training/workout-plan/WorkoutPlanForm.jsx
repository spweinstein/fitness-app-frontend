import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  workoutPlanSchema,
  planDefaultsFromProps,
  planToApiShape,
  linkTemplateIdFromApi,
} from "@/src/features/training/workout-plan/schema.js";
import { getTemplates } from "@/src/services/templateService.js";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/src/shared/feedback/LoadingSpinner.jsx";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import PlanTemplateLinkFieldGroup from "@/src/features/training/workout-plan/PlanTemplateLinkFieldGroup.jsx";

export default function WorkoutPlanForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Save",
  heading = "Workout plan",
  error: externalError = "",
  isSubmitting = false,
  /** `all` includes public templates so linked rows always match a dropdown option. */
  templateScope = "all",
}) {
  const [templates, setTemplates] = useState([]);
  const [templatesError, setTemplatesError] = useState("");

  const form = useForm({
    resolver: zodResolver(workoutPlanSchema),
    defaultValues: planDefaultsFromProps(defaultValues),
  });

  const { register, handleSubmit, reset, formState, control } = form;
  const { errors } = formState;

  useEffect(() => {
    let cancelled = false;
    setTemplatesError("");
    (async () => {
      try {
        const data = await getTemplates(templateScope);
        if (!cancelled) setTemplates(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) {
          setTemplates([]);
          setTemplatesError("Could not load templates for this plan.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [templateScope]);

  /** Ensure each linked template id has an <option> (e.g. public templates not in user scope). */
  const templatesForSelect = useMemo(() => {
    const byId = new Map();
    for (const t of templates) {
      if (t?.id != null) byId.set(Number(t.id), t);
    }
    const rawLinks = defaultValues?.template_links;
    if (!Array.isArray(rawLinks)) return templates;
    for (const link of rawLinks) {
      const sid = linkTemplateIdFromApi(link);
      if (!sid) continue;
      const id = Number(sid);
      if (Number.isNaN(id) || byId.has(id)) continue;
      const det = link.template_detail;
      if (det?.id != null) {
        byId.set(Number(det.id), {
          id: det.id,
          title: det.title,
          name: det.name,
          user: det.user,
        });
      }
    }
    return Array.from(byId.values());
  }, [templates, defaultValues?.template_links]);

  useEffect(() => {
    reset(planDefaultsFromProps(defaultValues));
  }, [defaultValues, reset]);

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(planToApiShape(data)))}
      className="mx-auto w-full max-w-3xl space-y-3 px-2 py-1"
    >
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{heading}</h1>
        <p className="text-muted-foreground mt-0.5 text-xs leading-snug">
          Ordered templates (and rest days) with a time of day for each. Use
          Generate to place them on your calendar for a date range.
        </p>
      </div>

      {(externalError || "").trim() ? (
        <p
          className="text-destructive text-sm"
          role="alert"
          id="workout-plan-error"
        >
          {externalError}
        </p>
      ) : null}

      {templatesError ? (
        <p className="text-destructive text-sm" role="alert">
          {templatesError}
        </p>
      ) : null}

      <div className="space-y-1.5">
        <Label
          htmlFor="workout-plan-title"
          className="text-muted-foreground text-xs"
        >
          Title
        </Label>
        <Input
          id="workout-plan-title"
          autoComplete="off"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.title)}
          className="h-8"
          {...register("title")}
        />
        {errors.title?.message ? (
          <p className="text-destructive text-xs">{errors.title.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="workout-plan-description"
          className="text-muted-foreground text-xs"
        >
          Description
        </Label>
        <Textarea
          id="workout-plan-description"
          disabled={isSubmitting}
          rows={3}
          className="min-h-[4rem] resize-y text-sm"
          placeholder="Optional"
          {...register("description")}
        />
      </div>

      <div className="flex items-center gap-2">
        <Controller
          name="is_public"
          control={control}
          render={({ field }) => (
            <input
              id="workout-plan-public"
              type="checkbox"
              className="border-input size-4 rounded border"
              disabled={isSubmitting}
              checked={Boolean(field.value)}
              onChange={(e) => field.onChange(e.target.checked)}
              onBlur={field.onBlur}
              ref={field.ref}
            />
          )}
        />
        <Label htmlFor="workout-plan-public" className="text-sm font-normal">
          Public plan (others can view and generate from it)
        </Label>
      </div>

      <PlanTemplateLinkFieldGroup
        control={control}
        register={register}
        templates={templatesForSelect}
        disabled={isSubmitting}
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

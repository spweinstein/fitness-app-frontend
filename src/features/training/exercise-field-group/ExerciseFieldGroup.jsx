import { Controller, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { INITIAL_ITEM } from "@/src/features/training/forms/exercise-form-fields/ExerciseFormFields.jsx";

const selectClass =
  "border-input bg-background h-8 min-h-8 w-full rounded-md border px-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50";

/** Planned / template (future) vs completed workout (past) — same copy for templates & non-completed workouts */
const FIELD_PLACEHOLDERS = {
  planned: {
    exercise: "Choose exercise",
    weight: "How much weight do you plan to use?",
    sets: "How many sets do you plan to do?",
    reps: "How many reps per set do you plan?",
    distance: "How far do you plan to go?",
    duration: "How long do you plan (seconds)?",
    notes: "Optional notes for this exercise",
  },
  completed: {
    exercise: "Which exercise did you do?",
    weight: "How much weight did you use?",
    sets: "How many sets did you do?",
    reps: "How many reps per set did you do?",
    distance: "How far did you go?",
    duration: "How long did you go (seconds)?",
    notes: "Notes from this exercise",
  },
};

export default function ExerciseFieldGroup({
  control,
  register,
  exercises = [],
  disabled,
  notesFieldIdPrefix = "workout-template-item-notes",
  /**
   * Completed workouts: show RPE + past-tense placeholders. Planned workouts & templates: future placeholders, hidden RPE.
   */
  isCompleted = false,
}) {
  const ph = isCompleted ? FIELD_PLACEHOLDERS.completed : FIELD_PLACEHOLDERS.planned;
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "items",
    keyName: "_fieldId",
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-base">Exercises</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => append({ ...INITIAL_ITEM, order: fields.length })}
        >
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      <ul className="space-y-2">
        {fields.map((field, index) => (
          <li
            key={field._fieldId}
            className="flex gap-2 rounded-md border border-border/80 bg-muted/10 p-2"
          >
            <div className="min-w-0 flex-1">
              {!isCompleted ? (
                <input type="hidden" {...register(`items.${index}.rpe`)} />
              ) : null}
              <div className="grid w-full min-w-0 grid-cols-[1.5fr_0.5fr_1fr_1fr] gap-x-2 gap-y-2">
                <div className="col-span-4 min-w-0 space-y-1">
                  <Label className="text-muted-foreground text-xs">
                    Exercise
                  </Label>
                  <select
                    className={selectClass}
                    disabled={disabled}
                    id={`exercise-select-${index}`}
                    {...register(`items.${index}.exercise`)}
                  >
                    <option value="">{ph.exercise}</option>
                    {exercises.map((ex) => (
                      <option key={ex.id} value={String(ex.id)}>
                        {ex.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="min-w-0 space-y-1">
                  <Label className="text-muted-foreground text-xs">
                    Weight
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    className="h-8 w-full min-w-0"
                    disabled={disabled}
                    placeholder={ph.weight}
                    {...register(`items.${index}.weight`)}
                  />
                </div>
                <div className="min-w-0 space-y-1">
                  <Label className="text-muted-foreground text-xs">Unit</Label>
                  <select
                    className={selectClass}
                    disabled={disabled}
                    aria-label="Weight unit"
                    {...register(`items.${index}.weight_unit`)}
                  >
                    <option value="lb">lb</option>
                    <option value="kg">kg</option>
                  </select>
                </div>
                <div className="min-w-0 space-y-1">
                  <Label className="text-muted-foreground text-xs">Sets</Label>
                  <Input
                    type="number"
                    min={0}
                    className="h-8 w-full min-w-0"
                    disabled={disabled}
                    placeholder={ph.sets}
                    {...register(`items.${index}.sets`)}
                  />
                </div>
                <div className="min-w-0 space-y-1">
                  <Label className="text-muted-foreground text-xs">Reps</Label>
                  <Input
                    type="number"
                    min={0}
                    className="h-8 w-full min-w-0"
                    disabled={disabled}
                    placeholder={ph.reps}
                    {...register(`items.${index}.reps`)}
                  />
                </div>

                <div className="min-w-0 space-y-1">
                  <Label className="text-muted-foreground text-xs">
                    Distance
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    className="h-8 w-full min-w-0"
                    disabled={disabled}
                    placeholder={ph.distance}
                    {...register(`items.${index}.distance`)}
                  />
                </div>
                <div className="min-w-0 space-y-1">
                  <Label className="text-muted-foreground text-xs">Unit</Label>
                  <select
                    className={selectClass}
                    disabled={disabled}
                    aria-label="Distance unit"
                    {...register(`items.${index}.distance_unit`)}
                  >
                    <option value="km">km</option>
                    <option value="mi">mi</option>
                  </select>
                </div>
                <div className="col-span-2 min-w-0 space-y-1">
                  <Label className="text-muted-foreground text-xs">
                    Duration (sec)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    className="h-8 w-full min-w-0"
                    disabled={disabled}
                    placeholder={ph.duration}
                    {...register(`items.${index}.duration`)}
                  />
                </div>

                {isCompleted ? (
                  <div className="col-span-4 space-y-2 rounded-md border border-border/60 bg-muted/10 px-3 py-2.5">
                    <Controller
                      control={control}
                      name={`items.${index}.rpe`}
                      render={({ field }) => {
                        const parsed = parseInt(String(field.value ?? "").trim(), 10);
                        const hasValue =
                          field.value !== "" &&
                          field.value != null &&
                          !Number.isNaN(parsed) &&
                          parsed >= 1 &&
                          parsed <= 10;
                        const sliderPos = hasValue ? parsed : 0;
                        return (
                          <>
                            <div className="flex items-center justify-between gap-2">
                              <Label className="text-muted-foreground text-xs">
                                RPE (1–10)
                              </Label>
                              <span className="text-muted-foreground text-xs tabular-nums">
                                {hasValue ? parsed : "Not set"}
                              </span>
                            </div>
                            <Slider
                              min={0}
                              max={10}
                              step={1}
                              disabled={disabled}
                              value={[sliderPos]}
                              onValueChange={(vals) => {
                                const x = vals[0];
                                field.onChange(x === 0 ? "" : String(x));
                              }}
                              aria-label="Rate of perceived exertion, 0 for not set, 1 to 10"
                            />
                            <p className="text-muted-foreground text-[10px] leading-tight">
                              Slide from 0 (not set) to log how hard this set felt.
                            </p>
                          </>
                        );
                      }}
                    />
                  </div>
                ) : null}

                <div className="col-span-4 min-w-0 space-y-1">
                  <Label
                    className="text-muted-foreground text-xs"
                    htmlFor={`${notesFieldIdPrefix}-${index}`}
                  >
                    Notes
                  </Label>
                  <Textarea
                    id={`${notesFieldIdPrefix}-${index}`}
                    rows={2}
                    disabled={disabled}
                    className="min-h-0 py-2 text-sm"
                    placeholder={ph.notes}
                    {...register(`items.${index}.notes`)}
                  />
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col justify-start gap-1 pt-6 sm:pt-7">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={disabled || index === 0}
                aria-label="Move up"
                onClick={() => move(index, index - 1)}
              >
                <ChevronUp className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={disabled || index === fields.length - 1}
                aria-label="Move down"
                onClick={() => move(index, index + 1)}
              >
                <ChevronDown className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-destructive"
                disabled={disabled}
                aria-label="Remove"
                onClick={() => remove(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

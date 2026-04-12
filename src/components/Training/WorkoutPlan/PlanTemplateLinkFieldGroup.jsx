import { useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

const selectClass =
  "border-input bg-background h-8 min-h-8 w-full rounded-md border px-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50";

const INITIAL_LINK = { template: "", time: "09:00", order: 0 };

export default function PlanTemplateLinkFieldGroup({
  control,
  register,
  templates = [],
  disabled,
}) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "template_links",
    keyName: "_fieldId",
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-base">Templates in this plan</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() =>
            append({ ...INITIAL_LINK, order: fields.length })
          }
        >
          <Plus className="size-4" />
          Add template
        </Button>
      </div>

      <ul className="space-y-2">
        {fields.map((field, index) => (
          <li
            key={field._fieldId}
            className="flex gap-2 rounded-md border border-border/80 bg-muted/10 p-2"
          >
            <div className="min-w-0 flex-1">
              <div className="grid w-full min-w-0 grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">
                    Workout template
                  </Label>
                  <select
                    className={selectClass}
                    disabled={disabled}
                    id={`plan-link-template-${index}`}
                    {...register(`template_links.${index}.template`)}
                  >
                    <option value="">—</option>
                    {templates.map((t) => (
                      <option key={t.id} value={String(t.id)}>
                        {String(t.title ?? t.name ?? "Untitled").trim() ||
                          "Untitled"}
                        {t.is_rest_placeholder ? " (Rest day)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1 sm:max-w-[9rem]">
                  <Label className="text-muted-foreground text-xs">
                    Time of day
                  </Label>
                  <Input
                    type="time"
                    step={60}
                    className="h-8"
                    disabled={disabled}
                    {...register(`template_links.${index}.time`)}
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

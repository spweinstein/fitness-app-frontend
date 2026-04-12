import { useEffect, useState } from "react";
import { getTemplate } from "@/src/services/templateService.js";
import { DialogFooter } from "@/components/ui/dialog";
import LoadingSpinner from "@/src/shared/feedback/LoadingSpinner.jsx";

function createExerciseBlurb(item) {
  let ret = "";
  if (item.sets && item.sets > 0) {
    ret += item.sets;
    if (item.reps && item.reps > 0) ret += " x " + item.reps;
    if (item.weight && item.weight_unit)
      ret += " @ " + item.weight + " " + item.weight_unit;
  }
  if (item.distance)
    ret += (ret ? " • " : "") + item.distance + item.distance_unit;
  if (item.duration) ret += (ret ? " • " : "") + item.duration + "s";
  return ret || "No prescription specified";
}

export default function WorkoutTemplateRead({ templateId }) {
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (templateId == null) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getTemplate(templateId);
        if (!cancelled) setTemplate(data);
      } catch {
        if (!cancelled) setError("Could not load template.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [templateId]);

  if (loading)
    return (
      <LoadingSpinner
        message="Loading…"
        className="py-2"
        messageClassName="text-sm"
      />
    );
  if (error)
    return (
      <p className="text-destructive text-sm py-2" role="alert">
        {error}
      </p>
    );
  if (!template)
    return (
      <p className="text-muted-foreground text-sm py-2">Template not found.</p>
    );

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold">{template.title}</h1>
        <p className="text-sm text-muted-foreground">
          {template.duration != null && template.duration !== ""
            ? template.duration + " min"
            : "No duration specified"}
        </p>
        {template.description ? (
          <p className="text-sm text-muted-foreground">
            {template.description}
          </p>
        ) : null}
        <p className="text-sm text-muted-foreground">
          {template.items?.length || 0} exercise
          {template.items?.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="max-h-[min(50vh,20rem)] overflow-y-auto pr-1 -mr-1">
        {(!template.items || template.items.length === 0) && (
          <p className="text-muted-foreground text-sm">
            No exercises in this template yet.
          </p>
        )}
        <ol className="list-none space-y-2 p-0 m-0">
          {template.items?.map((item, index) => (
            <li
              key={item.id ?? index}
              className="rounded-lg border border-border/80 bg-muted/20 px-3 py-2"
            >
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-muted-foreground text-xs font-medium tabular-nums">
                  #{index + 1}
                </span>
                <span className="font-medium">
                  {item.exercise_detail?.name || "Exercise"}
                </span>
              </div>
              <p className="mt-1 text-sm text-foreground/90">
                {createExerciseBlurb(item)}
              </p>
              {item.notes ? (
                <p className="mt-1 border-t border-border/60 pt-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/80">Notes:</span>{" "}
                  {item.notes}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </div>

      <DialogFooter className="gap-2 sm:gap-2">
        {/* <Button variant="outline" size="sm" asChild>
          <Link to={`/templates/${template.id}`}>Full page</Link>
        </Button> */}
      </DialogFooter>
    </>
  );
}

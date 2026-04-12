import { useEffect, useState } from "react";
import { getWorkout } from "@/src/services/workoutService.js";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
} from "@/components/ui/popover";
import { Eye, Pencil, Trash2 } from "lucide-react";
import LoadingSpinner from "@/src/components/shared/LoadingSpinner/LoadingSpinner.jsx";

const STATUS_LABEL = {
  planned: "Planned",
  completed: "Completed",
  skipped: "Skipped",
  canceled: "Canceled",
};

function formatRange(startISO, endISO) {
  if (!startISO) return "";
  const s = new Date(startISO);
  const e = endISO ? new Date(endISO) : null;
  const opts = { dateStyle: "short", timeStyle: "short" };
  if (e && !Number.isNaN(e.getTime())) {
    return `${s.toLocaleString(undefined, opts)} – ${e.toLocaleString(undefined, opts)}`;
  }
  return s.toLocaleString(undefined, opts);
}

export default function WorkoutSummaryPopover({
  open,
  onOpenChange,
  anchorPosition,
  workoutId,
  onViewDetails,
  onEdit,
  onRequestDelete,
}) {
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || workoutId == null) {
      setWorkout(null);
      setError("");
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getWorkout(workoutId);
        if (!cancelled) setWorkout(data);
      } catch {
        if (!cancelled) setError("Could not load workout.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, workoutId]);

  const { x = 0, y = 0 } = anchorPosition ?? {};

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor asChild>
        <div
          className="pointer-events-none fixed size-0"
          style={{ left: x, top: y }}
          aria-hidden
        />
      </PopoverAnchor>
      <PopoverContent
        className="w-80 gap-3"
        align="start"
        side="bottom"
        sideOffset={4}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {loading ? (
          <LoadingSpinner
            message="Loading…"
            messageClassName="text-sm"
            size="sm"
          />
        ) : error ? (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        ) : workout ? (
          <>
            <PopoverHeader className="gap-0.5">
              <PopoverTitle className="line-clamp-2">
                {workout.title || "Workout"}
              </PopoverTitle>
              <PopoverDescription className="text-xs leading-snug">
                {formatRange(workout.start_dt, workout.end_dt)}
              </PopoverDescription>
              <p className="text-muted-foreground text-xs">
                {STATUS_LABEL[workout.status] ?? workout.status}
                {workout.items?.length != null
                  ? ` · ${workout.items.length} exercise${workout.items.length === 1 ? "" : "s"}`
                  : null}
              </p>
            </PopoverHeader>
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="justify-start"
                onClick={() => {
                  onOpenChange(false);
                  onViewDetails?.(workout);
                }}
              >
                <Eye className="mr-2 size-4 shrink-0" />
                View details
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="justify-start"
                onClick={() => {
                  onOpenChange(false);
                  onEdit?.(workout);
                }}
              >
                <Pencil className="mr-2 size-4 shrink-0" />
                Edit
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="justify-start"
                onClick={() => {
                  onOpenChange(false);
                  onRequestDelete?.(workout);
                }}
              >
                <Trash2 className="mr-2 size-4 shrink-0" />
                Delete
              </Button>
            </div>
          </>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

import { useEffect, useMemo, useState } from "react";
import { getWorkout, updateWorkout } from "@/src/services/workoutService.js";
import WorkoutForm from "./WorkoutForm.jsx";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/src/components/shared/LoadingSpinner/LoadingSpinner.jsx";

export default function WorkoutEdit({
  workoutId,
  exercises,
  onClose,
  onSave,
}) {
  const [workout, setWorkout] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError("");
      try {
        const data = await getWorkout(workoutId);
        if (!cancelled) setWorkout(data);
      } catch {
        if (!cancelled) setLoadError("Could not load workout.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [workoutId]);

  const defaultValues = useMemo(() => {
    if (!workout) return null;
    return {
      title: workout.title,
      start_dt: workout.start_dt,
      end_dt: workout.end_dt,
      status: workout.status,
      notes: workout.notes,
      items: workout.items,
    };
  }, [workout]);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const saved = await updateWorkout(workoutId, data);
      onSave?.(saved);
      onClose?.();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        "Could not update workout. Try again.";
      setSubmitError(
        typeof msg === "string" ? msg : "Could not update workout.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <LoadingSpinner
          message="Loading…"
          variant="centered"
          orientation="vertical"
          messageClassName="text-sm"
        />
      </div>
    );
  }

  if (loadError || !workout) {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-4 py-8">
        <p className="text-destructive text-sm" role="alert">
          {loadError || "Workout not found."}
        </p>
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <WorkoutForm
      defaultValues={defaultValues}
      heading="Edit workout"
      submitLabel="Save changes"
      onSubmit={handleSubmit}
      onCancel={onClose}
      error={submitError}
      isSubmitting={isSubmitting}
      exercises={exercises}
    />
  );
}

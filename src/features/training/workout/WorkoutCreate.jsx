import { useMemo, useState } from "react";
import { createWorkout } from "@/src/services/workoutService.js";
import WorkoutForm from "@/src/features/training/workout/WorkoutForm.jsx";

export default function WorkoutCreate({ onClose, onSave, exercises }) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = useMemo(() => ({}), []);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    setError("");
    try {
      const saved = await createWorkout(data);
      onSave?.(saved);
      onClose?.();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        "Could not create workout. Try again.";
      setError(typeof msg === "string" ? msg : "Could not create workout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <WorkoutForm
      defaultValues={defaultValues}
      heading="New workout"
      submitLabel="Create workout"
      onSubmit={handleSubmit}
      onCancel={onClose}
      error={error}
      isSubmitting={isSubmitting}
      exercises={exercises}
    />
  );
}

import { useMemo, useState } from "react";
import { createPlan } from "@/src/services/planService.js";
import WorkoutPlanForm from "@/src/features/training/workout-plan/WorkoutPlanForm.jsx";

export default function WorkoutPlanCreate({ onClose, onSave, templateScope }) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = useMemo(() => null, []);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    setError("");
    try {
      const saved = await createPlan(data);
      onSave?.(saved);
      onClose?.();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        (typeof err.response?.data === "object"
          ? JSON.stringify(err.response.data)
          : null) ||
        "Could not create plan. Try again.";
      setError(typeof msg === "string" ? msg : "Could not create plan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <WorkoutPlanForm
      defaultValues={defaultValues}
      heading="New workout plan"
      submitLabel="Create plan"
      templateScope={templateScope}
      onSubmit={handleSubmit}
      onCancel={onClose}
      error={error}
      isSubmitting={isSubmitting}
    />
  );
}

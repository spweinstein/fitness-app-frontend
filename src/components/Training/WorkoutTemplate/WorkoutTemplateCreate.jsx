import { useContext, useMemo, useState } from "react";
import { createTemplate } from "@/src/services/templateService.js";
import { UserContext } from "@/src/contexts/UserContext.jsx";
import WorkoutTemplateForm from "./WorkoutTemplateForm.jsx";

export default function WorkoutTemplateCreate({ onClose, onSave, exercises }) {
  const { user } = useContext(UserContext);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = useMemo(
    () => ({ title: "", description: "", duration: "" }),
    [],
  );

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    setError("");
    try {
      const payload = {
        ...data,
        user: user?.id ?? user?.user_id,
      };
      await createTemplate(payload);
      onSave();
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        "Could not create template. Try again.";
      setError(typeof msg === "string" ? msg : "Could not create template.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <WorkoutTemplateForm
      defaultValues={defaultValues}
      heading="New workout template"
      submitLabel="Create template"
      onSubmit={handleSubmit}
      onCancel={onClose}
      error={error}
      isSubmitting={isSubmitting}
      exercises={exercises}
    />
  );
}

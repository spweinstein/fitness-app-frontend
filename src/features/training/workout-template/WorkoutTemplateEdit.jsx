import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { getTemplate, updateTemplate } from "@/src/services/templateService.js";
import { UserContext } from "@/src/app/UserContext.jsx";
import WorkoutTemplateForm from "@/src/features/training/workout-template/WorkoutTemplateForm.jsx";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/src/shared/feedback/LoadingSpinner.jsx";

export default function WorkoutTemplateEdit({
  templateId,
  exercises,
  onClose,
  onSave,
}) {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [template, setTemplate] = useState(null);
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
        const data = await getTemplate(templateId);
        if (!cancelled) setTemplate(data);
      } catch {
        if (!cancelled) setLoadError("Could not load template.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [templateId]);

  const defaultValues = useMemo(() => {
    if (!template) return null;
    return {
      title: template.title,
      description: template.description,
      duration: template.duration,
      items: template.items,
    };
  }, [template]);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const payload = {
        ...data,
        user: user?.id ?? user?.user_id,
      };
      const saved = await updateTemplate(templateId, payload);
      onSave?.(saved);
      onClose?.();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        "Could not update template. Try again.";
      setSubmitError(
        typeof msg === "string" ? msg : "Could not update template.",
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

  if (loadError || !template) {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-4 py-8">
        <p className="text-destructive text-sm" role="alert">
          {loadError || "Template not found."}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/training")}
        >
          Back to training
        </Button>
      </div>
    );
  }

  return (
    <WorkoutTemplateForm
      defaultValues={defaultValues}
      heading="Edit workout template"
      submitLabel="Save changes"
      onSubmit={handleSubmit}
      onCancel={onClose}
      error={submitError}
      isSubmitting={isSubmitting}
      exercises={exercises}
    />
  );
}

import { useState, useEffect } from "react";
import { ExerciseFormFields, INITIAL_ITEM, InputField, SelectField, TextAreaField } from "@/src/features/training/forms/exercise-form-fields";
import LoadingSpinner from "@/src/shared/feedback/LoadingSpinner.jsx";
import { prepareItemData, toDateTimeLocal, toIsoStringOrNull } from "@/src/utils/formHelpers.js";

/**
 * Unified WorkoutForm component that works for both Templates and Workouts
 * 
 * @param {Object} props
 * @param {'template' | 'workout'} props.mode - Form mode
 * @param {string|number} props.entityId - Entity ID for edit mode (optional)
 * @param {boolean} props.isEditMode - Whether in edit mode
 * @param {Function} props.loadEntity - Function to load entity data (returns Promise)
 * @param {Function} props.onSubmit - Function to handle form submission (data) => Promise
 * @param {Function} props.onCancel - Function to handle cancel
 * @param {string} props.title - Form title
 * @param {string} props.submitLabel - Submit button label
 * @param {Array} props.exercises - List of exercises
 */
const WorkoutForm = ({
  mode,
  entityId,
  isEditMode,
  loadEntity,
  onSubmit,
  onCancel,
  title,
  submitLabel,
  exercises = [],
}) => {
  // Initialize form data based on mode
  const getInitialFormData = () => {
    if (mode === "template") {
      return {
        title: "",
        description: "",
        duration: "",
        items: [{ ...INITIAL_ITEM, order: 0 }],
      };
    } else {
      return {
        title: "",
        start_dt: "",
        end_dt: "",
        status: "planned",
        notes: "",
        items: [{ ...INITIAL_ITEM, order: 0 }],
      };
    }
  };

  const [formData, setFormData] = useState(getInitialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load entity data in edit mode
  useEffect(() => {
    if (!isEditMode || !loadEntity) return;

    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const entity = await loadEntity(entityId);
        
        if (mode === "template") {
          setFormData({
            title: entity.title || "",
            description: entity.description || "",
            duration: entity.duration || "",
            items: (entity.items || []).map((item, index) => ({
              ...item,
              exercise:
                typeof item.exercise === "object"
                  ? item.exercise.id
                  : item.exercise,
              sets: item.sets ?? "",
              reps: item.reps ?? "",
              weight: item.weight ?? "",
              weight_unit: item.weight_unit || "lb",
              distance: item.distance ?? "",
              distance_unit: item.distance_unit || "km",
              duration: item.duration ?? "",
              rpe: item.rpe ?? "",
              notes: item.notes || "",
              order: item.order ?? index,
            })),
          });
        } else {
          setFormData({
            title: entity.title || "",
            start_dt: toDateTimeLocal(entity.start_dt),
            end_dt: toDateTimeLocal(entity.end_dt),
            status: entity.status || "planned",
            notes: entity.notes || "",
            items: (entity.items || []).map((item, index) => ({
              ...item,
              exercise:
                typeof item.exercise === "object"
                  ? item.exercise.id
                  : item.exercise,
              sets: item.sets ?? "",
              reps: item.reps ?? "",
              weight: item.weight ?? "",
              weight_unit: item.weight_unit || "lb",
              distance: item.distance ?? "",
              distance_unit: item.distance_unit || "km",
              duration: item.duration ?? "",
              rpe: item.rpe ?? "",
              notes: item.notes || "",
              order: item.order ?? index,
            })),
          });
        }
      } catch (err) {
        setError(
          mode === "template"
            ? "Error loading template. Please try again."
            : "Error loading workout. Please try again."
        );
        console.error("Error loading entity:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [entityId, isEditMode, loadEntity, mode]);

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { ...INITIAL_ITEM, order: prev.items.length },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleMoveItem = (index, direction) => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.items.length) return;

    setFormData((prev) => {
      const updated = [...prev.items];
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      // Update order fields
      updated[index].order = index;
      updated[newIndex].order = newIndex;
      return { ...prev, items: updated };
    });
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Prepare items data using shared helper
      const itemsData = formData.items
        .filter((item) => item.exercise !== "")
        .map((item, index) => prepareItemData(item, index));

        const baseData = {
          ...formData,
          items: itemsData,
        };
    
        const submitData =
          mode === "workout"
            ? {
                ...baseData,
                start_dt: toIsoStringOrNull(formData.start_dt),
                end_dt: toIsoStringOrNull(formData.end_dt),
              }
            : baseData;

      await onSubmit(submitData, entityId);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        `Error saving ${mode}. Please try again.`
      );
      console.error(`Error saving ${mode}:`, err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 1rem" }}>
        <LoadingSpinner
          message="Loading…"
          variant="centered"
          orientation="vertical"
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 1rem" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "24px" }}>
        {title}
      </h1>

      {error && (
        <div
          style={{
            backgroundColor: "#fee",
            border: "1px solid #fcc",
            color: "#c33",
            padding: "12px 16px",
            borderRadius: "4px",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Entity-specific information section */}
        <section
          style={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            border: "1px solid #ddd",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              marginBottom: "16px",
              paddingBottom: "8px",
              borderBottom: "2px solid #eee",
            }}
          >
            {mode === "template" ? "Template Information" : "Workout Information"}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <InputField
              label={mode === "template" ? "Template Name" : "Workout Title"}
              name="title"
              value={formData.title}
              onChange={(e) => handleFormChange("title", e.target.value)}
              required
            />

            {mode === "template" ? (
              <>
                <TextAreaField
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                  rows="3"
                />
                <InputField
                  label="Duration (minutes)"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleFormChange("duration", e.target.value)}
                  required
                  min="1"
                />
              </>
            ) : (
              <>
                <div className="date-grid">
                  <InputField
                    label="Start Date & Time"
                    name="start_dt"
                    type="datetime-local"
                    value={formData.start_dt}
                    onChange={(e) => handleFormChange("start_dt", e.target.value)}
                    required
                  />
                  <InputField
                    label="End Date & Time"
                    name="end_dt"
                    type="datetime-local"
                    value={formData.end_dt}
                    onChange={(e) => handleFormChange("end_dt", e.target.value)}
                    required
                  />
                </div>

                <SelectField
                  label="Status"
                  value={formData.status}
                  onChange={(e) => handleFormChange("status", e.target.value)}
                  options={[
                    { id: "planned", name: "Planned" },
                    { id: "completed", name: "Completed" },
                    { id: "skipped", name: "Skipped" },
                    { id: "canceled", name: "Canceled" },
                  ]}
                />

                <TextAreaField
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={(e) => handleFormChange("notes", e.target.value)}
                  rows="3"
                />
              </>
            )}
          </div>
        </section>

        {/* Exercises section - shared for both modes */}
        <ExerciseFormFields
          items={formData.items}
          exercises={exercises}
          onItemChange={handleItemChange}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          onMoveItem={handleMoveItem}
          showReorderButtons={true}
        />

        {/* Action buttons */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            justifyContent: "flex-end",
            paddingTop: "16px",
            borderTop: "1px solid #eee",
            marginTop: "24px",
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "10px 20px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              backgroundColor: "#fff",
              color: "#333",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f5f5f5";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#fff";
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 20px",
              backgroundColor: loading ? "#ccc" : "#2196F3",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = "#1976D2";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = "#2196F3";
              }
            }}
          >
            {loading ? (
              <LoadingSpinner
                variant="inline"
                size="sm"
                message="Saving…"
                ariaLive="off"
                className="text-white [&_span]:text-white"
                messageClassName="!text-white text-sm"
              />
            ) : (
              submitLabel
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkoutForm;

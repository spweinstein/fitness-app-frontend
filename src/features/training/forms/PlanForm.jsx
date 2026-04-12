import { useState, useEffect } from "react";
import TemplateFormFields, { INITIAL_TEMPLATE_LINK } from "@/src/features/training/forms/template-form-fields/TemplateFormFields";
import LoadingSpinner from "@/src/shared/feedback/LoadingSpinner.jsx";
import InputField from "@/src/features/training/forms/template-form-fields/InputField";
/**
 * PlanForm component for creating and editing workout plans
 * Based on WorkoutForm but manages templates instead of exercises
 * 
 * @param {Object} props
 * @param {string|number} props.planId - Plan ID for edit mode (optional)
 * @param {boolean} props.isEditMode - Whether in edit mode
 * @param {Function} props.loadPlan - Function to load plan data (returns Promise)
 * @param {Function} props.onSubmit - Function to handle form submission (data) => Promise
 * @param {Function} props.onCancel - Function to handle cancel
 * @param {Array} props.templates - List of available templates
 * @param {Object} props.user - Current user object
 */
const PlanForm = ({
  planId,
  isEditMode,
  loadPlan,
  onSubmit,
  onCancel,
  templates = [],
}) => {
  const getInitialFormData = () => ({
    title: "",
    description: "",
    is_public: false,
    template_links: [{ ...INITIAL_TEMPLATE_LINK, order: 0 }],
  });

  const [formData, setFormData] = useState(getInitialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load plan data in edit mode
  useEffect(() => {
    if (!isEditMode || !loadPlan) return;

    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const plan = await loadPlan(planId);
        
        const sortedLinks = (plan.template_links || []).sort((a, b) => 
          (a.order ?? 0) - (b.order ?? 0)
        );

        setFormData({
          title: plan.title || "",
          description: plan.description || "",
          is_public: Boolean(plan.is_public),
          template_links: sortedLinks.length > 0 
            ? sortedLinks.map((link) => ({
                id: link.id,
                template: typeof link.template === "object" 
                  ? link.template.id 
                  : link.template,
                time: link.time || "18:00:00",
                order: link.order ?? 0,
              }))
            : [{ ...INITIAL_TEMPLATE_LINK, order: 0 }],
        });
      } catch (err) {
        setError("Error loading plan. Please try again.");
        console.error("Error loading plan:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [planId, isEditMode, loadPlan]);

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        template_links: prev.template_links.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      };
      return updated;
    });
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      template_links: [
        ...prev.template_links,
        {
          ...INITIAL_TEMPLATE_LINK,
          time: "18:00:00",
          order: prev.template_links.length,
        },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      template_links: prev.template_links.filter((_, i) => i !== index),
    }));
  };

  const handleMoveItem = (index, direction) => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.template_links.length) return;

    setFormData((prev) => {
      const updated = [...prev.template_links];
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      updated[index].order = index;
      updated[newIndex].order = newIndex;
      return { ...prev, template_links: updated };
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
        const template_links = formData.template_links
            .filter((link) => link.template !== "" && link.template != null)
            .map((link, index) => ({
            id: link.id,
            template: Number(link.template),
            order: index,
            time: link.time || "18:00:00",
            }));
    
        const baseData = {
            title: formData.title,
            description: formData.description || "",
            is_public: formData.is_public,
            template_links,
        };
    
        await onSubmit(baseData, planId);
        } catch (err) {
        setError(
            err.response?.data?.detail ||
            err.response?.data?.non_field_errors?.[0] ||
            err.message ||
            "Error saving plan. Please try again."
        );
        console.error("Error saving plan:", err);
        } finally {
        setLoading(false);
        }
    };

  if (loading && isEditMode) {
    return (
      <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
        <LoadingSpinner
          message="Loading plan…"
          variant="centered"
          orientation="vertical"
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "24px" }}>
        {isEditMode ? "Edit Plan" : "Create Plan"}
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
        {/* Plan Information section */}
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
            Plan Information
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <InputField
              label="Plan Title"
              name="title"
              value={formData.title}
              onChange={(e) => handleFormChange("title", e.target.value)}
              required
            />

            <label
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
              }}
            >
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>
                Description
              </span>
              <textarea
                name="description"
                value={formData.description}
                onChange={(e) => handleFormChange("description", e.target.value)}
                rows={3}
                placeholder="Optional"
                style={{
                  width: "100%",
                  padding: "0.5rem 0.65rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                }}
              />
            </label>

            <label
              style={{
                display: "flex",
                gap: "0.5rem",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <input
                type="checkbox"
                checked={formData.is_public}
                onChange={(e) => handleFormChange("is_public", e.target.checked)}
              />
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>
                Make plan public
              </span>
            </label>
          </div>
        </section>

        {/* Templates section */}
        <TemplateFormFields
          items={formData.template_links}
          templates={templates}
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
                message={isEditMode ? "Saving…" : "Creating…"}
                ariaLive="off"
                className="text-white [&_span]:text-white"
                messageClassName="!text-white text-sm"
              />
            ) : isEditMode ? (
              "Save Plan"
            ) : (
              "Create Plan"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlanForm;

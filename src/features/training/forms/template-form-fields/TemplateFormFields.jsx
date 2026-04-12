import TemplateCard from "@/src/features/training/forms/template-form-fields/TemplateCard";

const INITIAL_TEMPLATE_LINK = {
  template: "",
  time: "18:00:00",
};

/**
 * TemplateFormFields - Reusable component for managing template links in a plan
 * Similar to ExerciseFormFields but for templates
 */
const TemplateFormFields = ({
  items,
  templates,
  onItemChange,
  onAddItem,
  onRemoveItem,
  onMoveItem,
  showReorderButtons = true,
}) => {
  return (
    <section style={{ marginBottom: "24px" }}>
      <h2
        style={{
          fontSize: "20px",
          fontWeight: "600",
          marginBottom: "16px",
          paddingBottom: "8px",
          borderBottom: "2px solid #eee",
        }}
      >
        Templates
      </h2>
      {items.length === 0 ? (
        <p style={{ color: "#666", fontStyle: "italic", marginBottom: "16px" }}>
          No templates added yet. Click "Add Template" to get started.
        </p>
      ) : (
        items.map((item, index) => (
          <TemplateCard
            key={item.id || `new-template-${index}`}
            item={item}
            index={index}
            templates={templates}
            onChange={onItemChange}
            onRemove={onRemoveItem}
            onMove={onMoveItem}
            isFirst={index === 0}
            isLast={index === items.length - 1}
            showReorderButtons={showReorderButtons}
          />
        ))
      )}
      <button
        type="button"
        onClick={onAddItem}
        style={{
          width: "100%",
          padding: "12px",
          border: "2px dashed #ccc",
          borderRadius: "8px",
          backgroundColor: "#fafafa",
          color: "#666",
          fontSize: "16px",
          fontWeight: "500",
          cursor: "pointer",
          marginTop: "8px",
        }}
        onMouseEnter={(e) => {
          e.target.style.borderColor = "#2196F3";
          e.target.style.color = "#2196F3";
          e.target.style.backgroundColor = "#e3f2fd";
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = "#ccc";
          e.target.style.color = "#666";
          e.target.style.backgroundColor = "#fafafa";
        }}
      >
        + Add Template
      </button>
    </section>
  );
};

export default TemplateFormFields;
export { INITIAL_TEMPLATE_LINK };

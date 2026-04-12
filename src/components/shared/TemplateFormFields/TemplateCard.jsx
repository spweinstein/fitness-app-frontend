import InputField from "./InputField";
import SelectField from "../ExerciseFormFields/SelectField";

const TemplateCard = ({
  item,
  index,
  templates,
  onChange,
  onRemove,
  onMove,
  isFirst,
  isLast,
  showReorderButtons = true,
}) => {
  // Get template name for display
  const selectedTemplate = templates.find(t => t.id === Number(item.template));

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "8px",
        border: "1px solid #ddd",
        padding: "24px",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#333" }}>
          Template {index + 1}
        </h3>
        <div style={{ display: "flex", gap: "8px" }}>
          {showReorderButtons && (
            <>
              <button
                type="button"
                onClick={() => onMove(index, "up")}
                disabled={isFirst}
                style={{
                  padding: "6px 12px",
                  fontSize: "14px",
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  cursor: isFirst ? "not-allowed" : "pointer",
                  opacity: isFirst ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isFirst) {
                    e.target.style.backgroundColor = "#e0e0e0";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isFirst) {
                    e.target.style.backgroundColor = "#f5f5f5";
                  }
                }}
                title="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => onMove(index, "down")}
                disabled={isLast}
                style={{
                  padding: "6px 12px",
                  fontSize: "14px",
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  cursor: isLast ? "not-allowed" : "pointer",
                  opacity: isLast ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isLast) {
                    e.target.style.backgroundColor = "#e0e0e0";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLast) {
                    e.target.style.backgroundColor = "#f5f5f5";
                  }
                }}
                title="Move down"
              >
                ↓
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => onRemove(index)}
            style={{
              padding: "6px 12px",
              fontSize: "14px",
              backgroundColor: "#fee",
              border: "1px solid #fcc",
              borderRadius: "4px",
              color: "#c33",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#fdd";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#fee";
            }}
            title="Remove template"
          >
            Remove
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <SelectField
        label="Template"
        value={item.template || ""}
        onChange={(e) => onChange(index, "template", e.target.value)}
        options={templates.map(t => ({
            id: t.id,
            name: `${t.title}${t.description ? ` - ${t.description}` : ''}`
        }))}
        required
        />

        {selectedTemplate && (
          <div style={{ 
            padding: "12px", 
            backgroundColor: "#f9f9f9", 
            borderRadius: "4px",
            fontSize: "14px",
            color: "#666"
          }}>
            <strong>Duration:</strong> {selectedTemplate.duration} minutes
          </div>
        )}

        <InputField
          label="Time"
          name={`time-${index}`}
          type="time"
          value={item.time ? item.time.slice(0, 5) : ""}
          onChange={(e) => {
            const timeValue = e.target.value.length === 5 
              ? `${e.target.value}:00` 
              : e.target.value;
            onChange(index, "time", timeValue);
          }}
          required
        />
      </div>
    </div>
  );
};

export default TemplateCard;

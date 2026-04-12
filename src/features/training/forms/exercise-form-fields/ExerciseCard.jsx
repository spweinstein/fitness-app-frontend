import InputField from "@/src/features/training/forms/exercise-form-fields/InputField";
import TextAreaField from "@/src/features/training/forms/exercise-form-fields/TextAreaField";
import SelectField from "@/src/features/training/forms/exercise-form-fields/SelectField";

const ExerciseCard = ({
  item,
  index,
  exercises,
  onChange,
  onRemove,
  onMove,
  isFirst,
  isLast,
  showReorderButtons = true,
}) => (
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
        Exercise {index + 1}
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
          title="Remove exercise"
        >
          Remove
        </button>
      </div>
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <SelectField
        label="Exercise"
        value={item.exercise}
        onChange={(e) => onChange(index, "exercise", e.target.value)}
        options={exercises}
        required
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <InputField
          label="Sets"
          name={`sets-${index}`}
          type="number"
          value={item.sets}
          onChange={(e) => onChange(index, "sets", e.target.value)}
          min="0"
        />
        <InputField
          label="Reps"
          name={`reps-${index}`}
          type="number"
          value={item.reps}
          onChange={(e) => onChange(index, "reps", e.target.value)}
          min="0"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
        <InputField
          label="Weight"
          name={`weight-${index}`}
          type="number"
          value={item.weight}
          onChange={(e) => onChange(index, "weight", e.target.value)}
          min="0"
          step="any"
        />
        <SelectField
          label="Unit"
          value={item.weight_unit}
          onChange={(e) => onChange(index, "weight_unit", e.target.value)}
          options={[
            { id: "lb", name: "lb" },
            { id: "kg", name: "kg" },
          ]}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
        <InputField
          label="Distance"
          name={`distance-${index}`}
          type="number"
          value={item.distance}
          onChange={(e) => onChange(index, "distance", e.target.value)}
          min="0"
        />
        <SelectField
          label="Unit"
          value={item.distance_unit}
          onChange={(e) => onChange(index, "distance_unit", e.target.value)}
          options={[
            { id: "km", name: "km" },
            { id: "mi", name: "mi" },
          ]}
        />
      </div>

      <InputField
        label="Duration (seconds)"
        name={`duration-${index}`}
        type="number"
        value={item.duration}
        onChange={(e) => onChange(index, "duration", e.target.value)}
        min="0"
      />

      <InputField
        label="RPE (1-10)"
        name={`rpe-${index}`}
        type="number"
        value={item.rpe}
        onChange={(e) => onChange(index, "rpe", e.target.value)}
        min="1"
        max="10"
      />

      <TextAreaField
        label="Notes"
        name={`notes-${index}`}
        value={item.notes}
        onChange={(e) => onChange(index, "notes", e.target.value)}
        rows="2"
      />
    </div>
  </div>
);

export default ExerciseCard;

import ExerciseCard from "./ExerciseCard";

const INITIAL_ITEM = {
  exercise: "",
  sets: "",
  reps: "",
  weight: "",
  weight_unit: "lb",
  distance: "",
  distance_unit: "km",
  duration: "",
  rpe: "",
  notes: "",
};

/**
 * ExerciseFormFields - Reusable component for managing exercise items
 * Used in both WorkoutForm and TemplateBuilder
 */
const ExerciseFormFields = ({
  items,
  exercises,
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
        Exercises
      </h2>
      {items.map((item, index) => (
        <ExerciseCard
          key={item.id || `new-item-${index}`}
          item={item}
          index={index}
          exercises={exercises}
          onChange={onItemChange}
          onRemove={onRemoveItem}
          onMove={onMoveItem}
          isFirst={index === 0}
          isLast={index === items.length - 1}
          showReorderButtons={showReorderButtons}
        />
      ))}
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
        + Add Exercise
      </button>
    </section>
  );
};

export default ExerciseFormFields;
export { INITIAL_ITEM };

import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getExercises } from "../../services/exerciseService";
import "./ExerciseLibrary.css";
import LoadingSpinner from "../shared/LoadingSpinner/LoadingSpinner.jsx";

const ExerciseLibrary = ({ embedded = false }) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadExercises = async () => {
      setLoading(true);
      setError("");

      try {
        const exerciseData = await getExercises();
        setExercises(Array.isArray(exerciseData) ? exerciseData : []);
      } catch {
        setError("Could not load exercise library.");
      } finally {
        setLoading(false);
      }
    };

    loadExercises();
  }, []);

  if (loading)
    return (
      <LoadingSpinner
        message="Loading exercise library…"
        variant="centered"
        orientation="vertical"
      />
    );
  if (error) return <p style={{ color: "crimson" }}>{error}</p>;

  return (
    <div className="exercise-lib">
      <div>
        {!embedded ? <h2>Exercise Library</h2> : null}
        {!embedded && exercises.length > 0 ? (
          <p className="exercise-lib-subtitle">
            Browse movements to plug into your plans and workouts.
          </p>
        ) : null}
        {embedded && exercises.length > 0 ? (
          <p className="text-muted-foreground mb-3 text-sm">
            Admin-curated movements to plug into your plans and workouts.
          </p>
        ) : null}

        {exercises.length > 0 && (
          <p className="exercise-lib-count">
            {exercises.length} exercise{exercises.length === 1 ? "" : "s"}
          </p>
        )}

        {exercises.length === 0 ? (
          <p className="exercise-lib-empty">No exercises yet.</p>
        ) : (
          <ul>
            {exercises.map((exercise) => (
              <li key={exercise.id}>
                <Link to={`/exercises/${exercise.id}`}>{exercise.name}</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ExerciseLibrary;
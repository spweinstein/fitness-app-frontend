import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { getExerciseById } from "@/src/services/exerciseService";
import "./ExerciseDetail.css";
import LoadingSpinner from "@/src/shared/feedback/LoadingSpinner.jsx";

const ExerciseDetail = () => {
  const { exerciseId } = useParams();
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExercise = async () => {
      setLoading(true);
      setError("");

      try {
        const exerciseData = await getExerciseById(exerciseId);
        setExercise(exerciseData);
      } catch {
        setError("Could not load exercise details.");
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [exerciseId]);

  if (loading)
    return (
      <LoadingSpinner
        message="Loading exercise…"
        variant="centered"
        orientation="vertical"
      />
    );
  if (error) return <p style={{ color: "crimson" }}>{error}</p>;
  if (!exercise) return <p>Exercise not found.</p>;

  return (
    <div className="exercise-page">
      <Link to="/exercises" className="back-btn">
        ← Back to Exercise Library
      </Link>

      <div className="exercise-header">
        <h1>{exercise.name}</h1>

        <div className="exercise-tags">
          <span className="tag">{exercise.exercise_type || "N/A"}</span>
          <span className="tag">{exercise.equipment || "Bodyweight"}</span>
        </div>
      </div>

      <div className="video-card">
        {exercise.video_url ? (
          <iframe
            src={exercise.video_url}
            title={exercise.name}
            allowFullScreen
          />
        ) : (
          <p>No video available</p>
        )}
      </div>

      <div className="details-card">
        <h3>Exercise Details</h3>
        <p><strong>Equipment:</strong> {exercise.equipment || "None"}</p>
        <p><strong>Type:</strong> {exercise.exercise_type || "N/A"}</p>
      </div>

      <div className="instructions-card">
        <h3>Instructions</h3>
        <p>{exercise.instructions || "No instructions provided."}</p>
      </div>
    </div>
  );
};

export default ExerciseDetail;

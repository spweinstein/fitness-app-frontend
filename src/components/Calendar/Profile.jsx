import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../contexts/UserContext";
import {
  getProfile,
  updateHeight,
  getWeightLogs,
  createWeightLog,
} from "../../services/profileServices.js";
import "./Profile.css";

const Profile = () => {
  const { user } = useContext(UserContext);

  const [height, setHeight] = useState(null);
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [editingHeight, setEditingHeight] = useState(false);

  const [weight, setWeight] = useState("");
  const [date, setDate] = useState("");

  const [weightLogs, setWeightLogs] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const profile = await getProfile(user.id);
      setHeight(profile.height);

      if (profile.height) {
        setFeet(Math.floor(profile.height / 12));
        setInches(profile.height % 12);
      }

      const logs = await getWeightLogs(user.id);
      setWeightLogs(logs);
    };

    if (user) loadData();
  }, [user]);

  const handleHeightSubmit = async (e) => {
    e.preventDefault();

    const totalInches = Number(feet) * 12 + Number(inches);

    const updated = await updateHeight(user.id, totalInches);
    setHeight(updated.height);
    setEditingHeight(false);
  };

  const handleWeightSubmit = async (e) => {
    e.preventDefault();

    const newEntry = await createWeightLog({
      user: user?.id,
      weight,
      date,
    });

    setWeightLogs((prev) => [...prev, newEntry]);
    setWeight("");
    setDate("");
  };

  const latestWeight =
    weightLogs.length > 0 ? weightLogs[weightLogs.length - 1] : null;

  const formattedHeight = height
    ? `${Math.floor(height / 12)}'${height % 12}"`
    : "Not set";

  return (
    <div className="profile-page">
      <div className="profile-card">
        {/* LEFT COLUMN: user + height */}
        <div className="profile-left">
          <header className="profile-header">
            <div className="profile-avatar">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="profile-user-meta">
              <div className="profile-username">{user?.username}</div>
              <div className="profile-subtitle">Your training profile</div>
            </div>
          </header>

          <section className="profile-section">
            <div className="profile-section-title">Height</div>

            {height && !editingHeight && (
              <div className="height-display">
                <div>
                  <div className="height-value">{formattedHeight}</div>
                  <div className="height-label">Current height</div>
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditingHeight(true)}
                >
                  Edit
                </button>
              </div>
            )}

            {(!height || editingHeight) && (
              <form onSubmit={handleHeightSubmit}>
                <div className="profile-form-grid">
                  <div className="profile-form-group">
                    <label className="profile-label">Feet</label>
                    <input
                      type="number"
                      min="0"
                      className="profile-input"
                      value={feet}
                      onChange={(e) => setFeet(e.target.value)}
                    />
                  </div>

                  <div className="profile-form-group">
                    <label className="profile-label">Inches</label>
                    <input
                      type="number"
                      min="0"
                      max="11"
                      className="profile-input"
                      value={inches}
                      onChange={(e) => setInches(e.target.value)}
                    />
                  </div>
                </div>

                <div className="profile-actions">
                  {height && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setEditingHeight(false)}
                    >
                      Cancel
                    </button>
                  )}
                  <button type="submit" className="btn-primary">
                    Save height
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: weight + history */}
        <div className="profile-right">
          <section className="current-weight-card">
            <div className="profile-section-title">Current weight</div>

            {latestWeight ? (
              <>
                <div className="current-weight-main">
                  <span className="value">{latestWeight.weight}</span>
                  <span className="unit">lbs</span>
                </div>
                <div className="current-weight-sub">
                  As of {latestWeight.date}
                </div>
              </>
            ) : (
              <div className="profile-empty">No weight logged yet.</div>
            )}
          </section>

          <section className="weight-history-card">
            <div className="profile-section-title">Log weight</div>

            <form onSubmit={handleWeightSubmit}>
              <div className="profile-form-grid">
                <div className="profile-form-group">
                  <label className="profile-label">Weight (lbs)</label>
                  <input
                    type="number"
                    className="profile-input"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>

                <div className="profile-form-group">
                  <label className="profile-label">Date</label>
                  <input
                    type="date"
                    className="profile-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="profile-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!weight || !date}
                >
                  Save weight
                </button>
              </div>
            </form>

            {weightLogs.length > 0 && (
              <>
                <div
                  className="profile-section-title"
                  style={{ marginTop: 16 }}
                >
                  History
                </div>
                <div className="weight-history-list">
                  {weightLogs.map((entry) => (
                    <div key={entry.id} className="weight-history-item">
                      <span>{entry.weight} lbs</span>
                      <span className="weight-history-date">
                        {entry.date}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;

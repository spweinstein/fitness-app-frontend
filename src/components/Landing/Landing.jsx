import { Link } from "react-router";
import "./Landing.css";

import { useContext } from "react";
import { UserContext } from "../../contexts/UserContext.jsx";

const Landing = () => {
  const { user } = useContext(UserContext);

  return (
    <div className="landing-page">
      <main className="landing-content">
        <span className="brand-tag">The Future of Fitness</span>

        <h1>
          Health is <br />
          <span>Wealth.</span>
        </h1>

        <p>
          The Modern way to track your workouts, manage your diet, and build a
          body that lasts a lifetime.
        </p>

        <div className="cta-group">
          {/* Link to Sign Up */}
          {user ? (
            <>
              <Link to="/profile" className="btn btn-primary">
                Profile
              </Link>
              <Link to="/explore" className="btn btn-primary">
                Explore
              </Link>
              <Link to="/training" className="btn btn-primary">
                Training
              </Link>
            </>
          ) : (
            <>
              <Link to="/sign-up" className="btn btn-primary">
                Get Started
              </Link>

              {/* Link to Sign In */}
              <Link to="/sign-in" className="btn btn-secondary">
                Sign In
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Landing;

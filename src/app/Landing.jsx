import { Link } from "react-router";
import "./Landing.css";

import { useContext } from "react";
import { UserContext } from "@/src/app/UserContext.jsx";

const Landing = () => {
  const { user } = useContext(UserContext);

  return (
    <div className="landing-page">
      <section
        className="landing-hero"
        aria-labelledby="landing-heading"
      >
        <div className="landing-content">
          <span className="brand-tag">The Future of Fitness</span>

          <h1 id="landing-heading">
            Health is <br />
            <span>Wealth.</span>
          </h1>

          <p>
            The Modern way to track/plan your workouts and build a
            body that lasts a lifetime.
          </p>

          <div className="cta-group">
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

                <Link to="/sign-in" className="btn btn-secondary">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;

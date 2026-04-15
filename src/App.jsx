import { lazy, Suspense, useContext } from "react";
import { Navigate, Route, Routes, useSearchParams } from "react-router";
import { UserContext } from "@/src/app/UserContext.jsx";
import "./App.css";
import NavBar from "@/src/app/NavBar.jsx";
import SignUpForm from "@/src/features/auth/SignUpForm.jsx";
import SignInForm from "@/src/features/auth/SignInForm.jsx";
import Landing from "@/src/app/Landing.jsx";
import AppLayout from "@/src/shared/layout/AppLayout.jsx";
import LoadingSpinner from "@/src/shared/feedback/LoadingSpinner.jsx";
import { parseTabParam } from "@/src/features/training/explore/exploreListUtils.js";

/** Redirects legacy `/explore?tab=…` query-param URLs to path-based `/explore/:tab`. */
function ExploreIndexRedirect() {
  const [searchParams] = useSearchParams();
  const rawTab = searchParams.get("tab");
  if (rawTab != null && rawTab !== "") {
    const tab = parseTabParam(rawTab);
    const next = new URLSearchParams();
    const page = searchParams.get("page");
    if (page) next.set("page", page);
    const qs = next.toString();
    return <Navigate to={`/explore/${tab}${qs ? `?${qs}` : ""}`} replace />;
  }
  return <Navigate to="/explore/exercises" replace />;
}

const ExerciseDetail = lazy(
  () => import("@/src/features/exercises/ExerciseDetail.jsx"),
);
const ExerciseLibrary = lazy(
  () => import("@/src/features/exercises/ExerciseLibrary.jsx"),
);
const Profile = lazy(() => import("@/src/features/profile/Profile.jsx"));
const Explore = lazy(() => import("@/src/features/training/explore/Explore.jsx"));
const TrainingPage = lazy(
  () => import("@/src/features/training/TrainingPage.jsx"),
);

const App = () => {
  const { user, loading } = useContext(UserContext);
  if (loading) {
    return <LoadingSpinner variant="fullscreen" message="Loading…" size="lg" />;
  }
  return (
    <>
      <NavBar />
      <Suspense
        fallback={
          <LoadingSpinner variant="fullscreen" message="Loading…" size="lg" />
        }
      >
        <Routes>
          <Route
            path="/sign-up"
            element={user ? <Navigate to="/" /> : <SignUpForm />}
          />
          <Route
            path="/sign-in"
            element={user ? <Navigate to="/" /> : <SignInForm />}
          />

          {/* Main Entry Point */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Landing />} />
            {user && (
              <>
                <Route path="profile" element={<Profile />} />
                <Route path="exercises" element={<ExerciseLibrary />} />
                <Route
                  path="exercises/:exerciseId"
                  element={<ExerciseDetail />}
                />
                <Route path="explore/:tab" element={<Explore />} />
                <Route path="explore" element={<ExploreIndexRedirect />} />
                <Route path="training" element={<TrainingPage />} />
                <Route path="workouts" element={<TrainingPage />} />
              </>
            )}
          </Route>

          {/* CATCH-ALL: Redirects unknown URLs to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;

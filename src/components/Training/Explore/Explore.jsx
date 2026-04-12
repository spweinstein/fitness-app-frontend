import { useCallback, useMemo } from "react";
import {
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExerciseLibrary from "@/src/components/ExerciseLibrary/ExerciseLibrary.jsx";
import WorkoutPlanList from "@/src/components/Training/WorkoutPlan/WorkoutPlanList.jsx";
import WorkoutTemplateList from "@/src/components/Training/WorkoutTemplate/WorkoutTemplateList.jsx";
import {
  parsePageParam,
  parseTabParam,
  VALID_EXPLORE_TABS,
} from "@/src/components/Training/Explore/exploreListUtils.js";

/** Redirects `/explore` and legacy `/explore?tab=…&page=…` to path-based URLs. */
export function ExploreIndexRedirect() {
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

export default function Explore() {
  const { tab: tabSegment } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = useMemo(
    () => parsePageParam(searchParams.get("page")),
    [searchParams],
  );

  const handleTabChange = useCallback(
    (value) => {
      navigate(`/explore/${value}`, { replace: true });
    },
    [navigate],
  );

  const handlePageChange = useCallback(
    (nextPage) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("page", String(nextPage));
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const tab = typeof tabSegment === "string" ? tabSegment.toLowerCase() : "";
  if (!VALID_EXPLORE_TABS.includes(tab)) {
    return <Navigate to="/explore/exercises" replace />;
  }

  return (
    <div className="flex flex-col gap-8 px-4 py-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Explore</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Browse exercises, public templates, and public plans for training
          ideas.
        </p>
      </div>

      <Tabs value={tab} onValueChange={handleTabChange} className="gap-4">
        <TabsList className="w-full max-w-md justify-start sm:w-auto">
          <TabsTrigger value="exercises" className="flex-1 sm:flex-initial">
            Exercises
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex-1 sm:flex-initial">
            Templates
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex-1 sm:flex-initial">
            Plans
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exercises" className="outline-none">
          <ExerciseLibrary embedded />
        </TabsContent>

        <TabsContent value="templates" className="outline-none">
          <WorkoutTemplateList page={page} onPageChange={handlePageChange} />
        </TabsContent>

        <TabsContent value="plans" className="outline-none">
          <WorkoutPlanList page={page} onPageChange={handlePageChange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

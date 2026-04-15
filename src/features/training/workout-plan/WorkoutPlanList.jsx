import { useCallback, useEffect, useState } from "react";
import { Eye, Search } from "lucide-react";
import { getPlans } from "@/src/services/planService.js";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LoadingSpinner from "@/src/shared/feedback/LoadingSpinner.jsx";
import ExploreListPagination from "@/src/features/training/explore/ExploreListPagination.jsx";
import WorkoutPlanRead from "@/src/features/training/workout-plan/WorkoutPlanRead.jsx";
import WorkoutPlanGenerateDialog from "@/src/features/training/workout-plan/WorkoutPlanGenerateDialog.jsx";
import {
  EXPLORE_LIST_PAGE_SIZE,
  getTotalPagesFromCount,
  normalizeCatalogResponse,
} from "@/src/features/training/explore/exploreListUtils.js";
import { apiErrorMessage } from "@/src/utils/apiErrorMessage.js";
import { useDebounced } from "@/src/hooks/useDebounced.js";

const exploreSearchDebounceMs = (() => {
  const n = Number.parseInt(
    String(import.meta.env.VITE_EXPLORE_SEARCH_DEBOUNCE_MS ?? "300"),
    10,
  );
  return Number.isFinite(n) && n >= 0 ? n : 300;
})();

function formatPlanOwner(plan) {
  if (plan.username) return plan.username;
  if (plan.user && typeof plan.user === "object" && plan.user.username) {
    return plan.user.username;
  }
  if (plan.user != null && typeof plan.user !== "object") {
    return `User #${plan.user}`;
  }
  return "—";
}

function suppressFocusSteal(e) {
  e.preventDefault();
}

export default function WorkoutPlanList({ page, onPageChange }) {
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search, exploreSearchDebounceMs);
  const [viewPlanId, setViewPlanId] = useState(null);
  const [actionBanner, setActionBanner] = useState(null);

  const handleGenerated = useCallback(() => {
    setActionBanner({
      type: "success",
      text: "Workouts generated. Open My Training to see your calendar.",
    });
  }, []);

  const handleSearchChange = useCallback(
    (event) => {
      setSearch(event.target.value);
      onPageChange(1);
      setActionBanner(null);
    },
    [onPageChange],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getPlans({
          scope: "public",
          page,
          pageSize: EXPLORE_LIST_PAGE_SIZE,
          search: debouncedSearch,
        });
        if (!cancelled) {
          const { results, count } = normalizeCatalogResponse(data);
          setItems(results);
          setTotalPages(getTotalPagesFromCount(count, EXPLORE_LIST_PAGE_SIZE));
        }
      } catch (err) {
        if (!cancelled) {
          setError(apiErrorMessage(err, "Could not load public plans."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch]);

  const safePage = Math.min(Math.max(1, page), totalPages);

  useEffect(() => {
    if (page !== safePage) {
      onPageChange(safePage);
    }
  }, [page, safePage, onPageChange]);

  if (loading) {
    return (
      <LoadingSpinner
        message="Loading plans…"
        messageClassName="text-sm"
        variant="centered"
      />
    );
  }

  if (error) {
    return (
      <p className="text-destructive text-sm" role="alert">
        {error}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        Public workout plans you can browse and use from Training.
      </p>

      {actionBanner ? (
        <p
          className={
            actionBanner.type === "error"
              ? "text-destructive text-sm"
              : "text-muted-foreground text-sm"
          }
          role={actionBanner.type === "error" ? "alert" : "status"}
        >
          {actionBanner.text}
        </p>
      ) : null}

      <div className="w-full max-w-xl">
        <InputGroup className="h-10">
          <InputGroupAddon align="inline-start">
            <Search aria-hidden className="text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            placeholder="Search plans by title, description, or author…"
            value={search}
            onChange={handleSearchChange}
            aria-label="Search plans"
          />
        </InputGroup>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>User</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground h-24 text-center"
                >
                  No plans match your search.
                </TableCell>
              </TableRow>
            ) : (
              items.map((p) => {
                const canGenerate = (p.template_links?.length ?? 0) > 0;
                return (
                  <TableRow key={p.id}>
                    <TableCell className="max-w-[10rem] align-top font-medium">
                      <span className="line-clamp-2">{p.title}</span>
                    </TableCell>

                    <TableCell className="align-top whitespace-normal">
                      {formatPlanOwner(p)}
                    </TableCell>
                    <TableCell className="text-right align-top">
                      <div className="inline-flex flex-nowrap items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground"
                          aria-label="View plan"
                          title="View plan"
                          onPointerDown={suppressFocusSteal}
                          onClick={() => setViewPlanId(p.id)}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <WorkoutPlanGenerateDialog
                          plan={p}
                          disabled={!canGenerate}
                          onPointerDown={suppressFocusSteal}
                          onGenerated={handleGenerated}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <ExploreListPagination
        page={safePage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      <Dialog
        open={viewPlanId != null}
        onOpenChange={(open) => {
          if (!open) setViewPlanId(null);
        }}
      >
        <DialogContent className="flex max-h-[min(90vh,720px)] w-full flex-col gap-4 overflow-hidden p-6 sm:max-w-3xl">
          <DialogTitle className="shrink-0">View plan</DialogTitle>
          <DialogDescription className="sr-only">
            Read-only details for this workout plan
          </DialogDescription>
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <WorkoutPlanRead planId={viewPlanId} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

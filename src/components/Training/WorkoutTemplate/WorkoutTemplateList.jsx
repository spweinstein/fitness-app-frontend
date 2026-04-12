import { useCallback, useEffect, useState } from "react";
import { Eye, Search } from "lucide-react";
import {
  getTemplates,
  scheduleWorkoutFromTemplate,
} from "@/src/services/templateService.js";
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
import LoadingSpinner from "@/src/components/shared/LoadingSpinner/LoadingSpinner.jsx";
import ExploreListPagination from "@/src/components/Training/Explore/ExploreListPagination.jsx";
import WorkoutTemplateRead from "./WorkoutTemplateRead.jsx";
import WorkoutTemplateSchedulerPopover from "./WorkoutTemplateSchedulerPopover.jsx";
import {
  EXPLORE_LIST_PAGE_SIZE,
  getTotalPagesFromCount,
  normalizeCatalogResponse,
} from "@/src/components/Training/Explore/exploreListUtils.js";
import { apiErrorMessage } from "@/src/utils/apiErrorMessage.js";

function formatTemplateOwner(t) {
  if (t.username) return t.username;
  if (t.user && typeof t.user === "object" && t.user.username) {
    return t.user.username;
  }
  if (t.user != null && typeof t.user !== "object") {
    return `User #${t.user}`;
  }
  return "—";
}

function suppressFocusSteal(e) {
  e.preventDefault();
}

export default function WorkoutTemplateList({ page, onPageChange }) {
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [viewTemplateId, setViewTemplateId] = useState(null);
  const [scheduleNotice, setScheduleNotice] = useState("");

  const handleSchedule = useCallback(async (template, { startISO }) => {
    setScheduleNotice("");
    await scheduleWorkoutFromTemplate(template.id, { start_dt: startISO });
    setScheduleNotice(
      "Workout scheduled. Open My Training to see your calendar.",
    );
  }, []);

  const handleSearchChange = useCallback(
    (event) => {
      setSearch(event.target.value);
      onPageChange(1);
      setScheduleNotice("");
    },
    [onPageChange],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getTemplates({
          scope: "public",
          page,
          pageSize: EXPLORE_LIST_PAGE_SIZE,
          search,
        });
        if (!cancelled) {
          const { results, count } = normalizeCatalogResponse(data);
          setItems(results);
          setTotalPages(
            getTotalPagesFromCount(count, EXPLORE_LIST_PAGE_SIZE),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(apiErrorMessage(err, "Could not load public templates."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, search]);

  const safePage = Math.min(Math.max(1, page), totalPages);

  useEffect(() => {
    if (page !== safePage) {
      onPageChange(safePage);
    }
  }, [page, safePage, onPageChange]);

  if (loading) {
    return (
      <LoadingSpinner
        message="Loading templates…"
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
        Public templates shared by the community.
      </p>

      {scheduleNotice ? (
        <p className="text-muted-foreground text-sm" role="status">
          {scheduleNotice}
        </p>
      ) : null}

      <div className="w-full max-w-xl">
        <InputGroup className="h-10">
          <InputGroupAddon align="inline-start">
            <Search aria-hidden className="text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            placeholder="Search templates by title, description, or author…"
            value={search}
            onChange={handleSearchChange}
            aria-label="Search templates"
          />
        </InputGroup>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground h-24 text-center"
                >
                  No templates match your search.
                </TableCell>
              </TableRow>
            ) : (
              items
                .filter((t) => t.is_rest_placeholder === false)
                .map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="max-w-[10rem] align-top font-medium">
                      <span className="line-clamp-2">{t.title}</span>
                    </TableCell>
                    <TableCell className="align-top whitespace-normal">
                      {formatTemplateOwner(t)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums align-top">
                      {t.duration != null ? `${t.duration} min` : "—"}
                    </TableCell>
                    <TableCell className="text-right align-top">
                      <div className="inline-flex flex-nowrap items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground"
                          aria-label="View template"
                          title="View template"
                          onPointerDown={suppressFocusSteal}
                          onClick={() => setViewTemplateId(t.id)}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <WorkoutTemplateSchedulerPopover
                          template={t}
                          onSchedule={handleSchedule}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
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
        open={viewTemplateId != null}
        onOpenChange={(open) => {
          if (!open) setViewTemplateId(null);
        }}
      >
        <DialogContent className="flex max-h-[min(90vh,720px)] w-full flex-col gap-4 overflow-hidden p-6 sm:max-w-3xl">
          <DialogTitle className="shrink-0">View template</DialogTitle>
          <DialogDescription className="sr-only">
            Read-only details for this workout template
          </DialogDescription>
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <WorkoutTemplateRead templateId={viewTemplateId} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

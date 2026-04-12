import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getPlans } from "@/src/services/planService.js";
import { UserContext } from "@/src/contexts/UserContext.jsx";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import WorkoutPlanRead from "./WorkoutPlanRead.jsx";
import WorkoutPlanEdit from "./WorkoutPlanEdit.jsx";
import WorkoutPlanCreate from "./WorkoutPlanCreate.jsx";
import WorkoutPlanDelete from "./WorkoutPlanDelete.jsx";
import WorkoutPlanGenerateDialog from "./WorkoutPlanGenerateDialog.jsx";
import { Eye, Pencil, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import LoadingSpinner from "@/src/components/shared/LoadingSpinner/LoadingSpinner.jsx";
import { apiErrorMessage } from "@/src/utils/apiErrorMessage.js";

function suppressFocusSteal(e) {
  e.preventDefault();
}

function planLabel(p) {
  if (p == null) return "";
  return String(p.title ?? p.name ?? "Untitled").trim() || "Untitled";
}

function comboboxFilter(item, query, toString = planLabel) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return toString(item).toLowerCase().includes(q);
}

export default function WorkoutPlanPicker({
  scope = "user",
  className = "",
  /** When false, omit the Plans h2 (e.g. inside an accordion trigger). */
  showHeading = true,
  /** Passed to plan forms when loading template dropdowns (`all` = yours + public). */
  templateScope = "all",
  onPlanGenerated,
}) {
  const { user } = useContext(UserContext);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [modalPlanId, setModalPlanId] = useState(null);
  const [mode, setMode] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const refreshPlans = useCallback(async () => {
    try {
      const data = await getPlans(scope);
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load plans."));
    }
  }, [scope]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getPlans(scope);
        if (!cancelled) setPlans(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(apiErrorMessage(err, "Could not load plans."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [scope]);

  const comboboxItems = useMemo(
    () =>
      plans.map((p) => ({
        id: p.id,
        title: p.title,
        name: p.name,
        user: p.user,
      })),
    [plans],
  );

  const canManage = (item) =>
    user && item.user != null && item.user === user.id;

  const closeModal = () => {
    setModalPlanId(null);
    setMode(null);
  };

  const handleSaved = async (saved) => {
    await refreshPlans();
    if (saved?.id && selected?.id === saved.id) {
      setSelected((prev) =>
        prev
          ? {
              ...prev,
              title: saved.title ?? prev.title,
            }
          : prev,
      );
    }
    closeModal();
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-2">
        <div className="min-w-0 flex-1">
          {showHeading ? (
            <h2 className="text-lg font-semibold tracking-tight">Plans</h2>
          ) : null}
          <p className="text-muted-foreground text-xs leading-snug">
            Ordered workout steps (and rest days). Use generate to add them to
            your calendar for a date range.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 sm:ml-auto"
          title="Create a new workout plan (templates on a schedule)"
          onClick={() => {
            setModalPlanId(null);
            setMode("create");
          }}
        >
          <Plus className="size-4" />
          New plan
        </Button>
      </div>

      <div
        className={cn(
          "flex min-w-0 flex-wrap items-stretch divide-x divide-border rounded-md border border-input bg-background shadow-xs",
          "overflow-hidden focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/50",
        )}
      >
        <div className="min-h-8 min-w-0 flex-1 min-w-[12rem]">
          <Combobox
            items={comboboxItems}
            value={selected}
            onValueChange={setSelected}
            itemToStringLabel={planLabel}
            itemToStringValue={(p) => (p ? String(p.id) : "")}
            isItemEqualToValue={(a, b) => a?.id === b?.id}
            filter={comboboxFilter}
            disabled={loading}
            autoHighlight="always"
          >
            <ComboboxInput
              placeholder={loading ? "Loading…" : "Search plans…"}
              showClear={!!selected}
              disabled={loading}
              className={cn(
                "h-8 min-h-8 w-full rounded-none border-0 bg-transparent shadow-none",
                "has-[[data-slot=input-group-control]:focus-visible]:ring-0",
                "[&_input]:h-8 [&_input]:min-h-0 [&_input]:border-0 [&_input]:bg-transparent [&_input]:shadow-none",
                "dark:[&_input]:bg-transparent",
              )}
            />
            <ComboboxContent>
              <ComboboxEmpty>No plans found.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item.id} value={item}>
                    {planLabel(item)}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>

        {loading ? (
          <div
            className="border-border flex min-h-8 items-center border-l px-2"
            aria-hidden
          >
            <LoadingSpinner variant="inline" size="sm" decorative />
          </div>
        ) : null}

        <ButtonGroup
          className={cn(
            "w-fit shrink-0 rounded-none border-0 bg-transparent shadow-none",
            "[&>[data-slot=button]:first-child]:rounded-l-none",
            "[&>[data-slot=button]:first-child]:border-l-0",
          )}
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!selected}
            aria-label="View plan"
            title={!selected ? "Select a plan" : "View plan details"}
            onPointerDown={suppressFocusSteal}
            onClick={() => {
              if (!selected) return;
              setModalPlanId(selected.id);
              setMode("view");
            }}
          >
            <Eye className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!selected || !canManage(selected)}
            aria-label="Edit plan"
            title={
              !selected
                ? "Select a plan"
                : !canManage(selected)
                  ? "You can only edit your own plans"
                  : "Edit this plan"
            }
            onPointerDown={suppressFocusSteal}
            onClick={() => {
              if (!selected) return;
              setModalPlanId(selected.id);
              setMode("edit");
            }}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10"
            disabled={!selected || !canManage(selected)}
            aria-label="Delete plan"
            title={
              !selected
                ? "Select a plan"
                : !canManage(selected)
                  ? "You can only delete your own plans"
                  : "Delete this plan"
            }
            onPointerDown={suppressFocusSteal}
            onClick={() => selected && setDeleteTarget(selected)}
          >
            <Trash2 className="size-4" />
          </Button>
          <WorkoutPlanGenerateDialog
            plan={selected}
            disabled={!selected}
            onPointerDown={suppressFocusSteal}
            onGenerated={() => onPlanGenerated?.()}
          />
        </ButtonGroup>
      </div>

      {error && (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}

      <Dialog
        open={modalPlanId != null || mode === "create"}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <DialogContent className="flex max-h-[min(90vh,720px)] w-full flex-col gap-4 overflow-hidden p-6 sm:max-w-3xl">
          <DialogTitle className="shrink-0">
            {mode == "edit" && modalPlanId != null
              ? "Edit Plan"
              : mode == "create"
                ? "Create Plan"
                : "View Plan"}
          </DialogTitle>
          <DialogDescription
            className="sr-only"
            id="workout-plan-dialog-description"
          >
            {mode == "edit" && modalPlanId != null
              ? "Edit this workout plan"
              : mode == "create"
                ? "Create a new workout plan"
                : "View this workout plan"}
          </DialogDescription>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {mode == "edit" && modalPlanId != null ? (
              <WorkoutPlanEdit
                planId={modalPlanId}
                templateScope={templateScope}
                onClose={closeModal}
                onSave={handleSaved}
              />
            ) : mode == "create" ? (
              <WorkoutPlanCreate
                templateScope={templateScope}
                onClose={closeModal}
                onSave={handleSaved}
              />
            ) : (
              <WorkoutPlanRead planId={modalPlanId} />
            )}
          </div>
        </DialogContent>
      </Dialog>
      <WorkoutPlanDelete
        plan={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={(id) => {
          setPlans((prev) => prev.filter((p) => p.id !== id));
          if (selected?.id === id) setSelected(null);
        }}
        onError={setError}
      />
    </div>
  );
}

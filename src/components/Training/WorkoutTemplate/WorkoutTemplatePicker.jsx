import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getTemplates } from "@/src/services/templateService.js";
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
import WorkoutTemplateRead from "./WorkoutTemplateRead.jsx";
import WorkoutTemplateEdit from "./WorkoutTemplateEdit.jsx";
import WorkoutTemplateCreate from "./WorkoutTemplateCreate.jsx";
import WorkoutTemplateDelete from "./WorkoutTemplateDelete.jsx";
import WorkoutTemplateSchedulerPopover from "./WorkoutTemplateSchedulerPopover.jsx";
import { Eye, Pencil, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import LoadingSpinner from "@/src/components/shared/LoadingSpinner/LoadingSpinner.jsx";
import { apiErrorMessage } from "@/src/utils/apiErrorMessage.js";

function suppressFocusSteal(e) {
  e.preventDefault();
}

function templateLabel(t) {
  if (t == null) return "";
  return String(t.title ?? t.name ?? "Untitled").trim() || "Untitled";
}

function comboboxFilter(item, query, toString = templateLabel) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return toString(item).toLowerCase().includes(q);
}

export default function WorkoutTemplatePicker({
  scope = "user",
  className = "",
  onSchedule,
  exercises,
  /** When false, omit the section h2 (e.g. inside an accordion trigger). */
  showHeading = true,
}) {
  const { user } = useContext(UserContext);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [modalTemplateId, setModalTemplateId] = useState(null);
  const [mode, setMode] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const refreshTemplates = useCallback(async () => {
    try {
      const data = await getTemplates(scope);
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load templates."));
    }
  }, [scope]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getTemplates(scope);
        if (!cancelled) setTemplates(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) {
          setError(apiErrorMessage(err, "Could not load templates."));
        }
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
      templates
        .filter((t) => !t.is_rest_placeholder)
        .map((t) => ({
          id: t.id,
          title: t.title,
          name: t.name,
          user: t.user,
        })),
    [templates],
  );

  const canManage = (item) =>
    user && item.user != null && item.user === user.id;

  const closeModal = () => {
    setModalTemplateId(null);
    setMode(null);
  };

  const handleSaved = async (saved) => {
    await refreshTemplates();
    if (saved?.id && selected?.id === saved.id) {
      setSelected((prev) =>
        prev
          ? {
              ...prev,
              title: saved.title ?? prev.title,
              description: saved.description ?? prev.description,
              duration: saved.duration ?? prev.duration,
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
            <h2 className="text-lg font-semibold tracking-tight">Templates</h2>
          ) : null}
          <p className="text-muted-foreground text-xs leading-snug">
            Reusable routines you can schedule on the calendar or attach to
            plans.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 sm:ml-auto"
          title="Create a new reusable workout template"
          onClick={() => {
            setModalTemplateId(null);
            setMode("create");
          }}
        >
          <Plus className="size-4" />
          New template
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
            itemToStringLabel={templateLabel}
            itemToStringValue={(t) => (t ? String(t.id) : "")}
            isItemEqualToValue={(a, b) => a?.id === b?.id}
            filter={comboboxFilter}
            disabled={loading}
            autoHighlight="always"
          >
            <ComboboxInput
              placeholder={loading ? "Loading…" : "Search templates…"}
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
              <ComboboxEmpty>No templates found.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item.id} value={item}>
                    {templateLabel(item)}
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
            aria-label="View template"
            title={!selected ? "Select a template" : "View template details"}
            onPointerDown={suppressFocusSteal}
            onClick={() => {
              if (!selected) return;
              setModalTemplateId(selected.id);
              setMode("view");
            }}
          >
            <Eye className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={
              !selected || !canManage(selected) || exercises.length === 0
            }
            aria-label="Edit template"
            title={
              !selected
                ? "Select a template"
                : !canManage(selected)
                  ? "You can only edit your own templates"
                  : exercises.length === 0
                    ? "Load exercises to edit a template"
                    : "Edit this template"
            }
            onPointerDown={suppressFocusSteal}
            onClick={() => {
              if (!selected) return;
              setModalTemplateId(selected.id);
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
            aria-label="Delete template"
            title={
              !selected
                ? "Select a template"
                : !canManage(selected)
                  ? "You can only delete your own templates"
                  : "Delete this template"
            }
            onPointerDown={suppressFocusSteal}
            onClick={() => selected && setDeleteTarget(selected)}
          >
            <Trash2 className="size-4" />
          </Button>
          {onSchedule && (
            <WorkoutTemplateSchedulerPopover
              template={selected}
              disabled={!selected}
              onSchedule={onSchedule}
            />
          )}
        </ButtonGroup>
      </div>

      {error && (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}

      <Dialog
        open={modalTemplateId != null || mode === "create"}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <DialogContent className="flex max-h-[min(90vh,720px)] w-full flex-col gap-4 overflow-hidden p-6 sm:max-w-3xl">
          <DialogTitle className="shrink-0">
            {mode == "edit" && modalTemplateId != null
              ? "Edit Template"
              : mode == "create"
                ? "Create Template"
                : "View Template"}
          </DialogTitle>
          <DialogDescription
            className="sr-only"
            id="workout-template-dialog-description"
          >
            {mode == "edit" && modalTemplateId != null
              ? "Edit this workout template"
              : mode == "create"
                ? "Create a new workout template"
                : "View this workout template"}
          </DialogDescription>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {mode == "edit" && modalTemplateId != null ? (
              <WorkoutTemplateEdit
                templateId={modalTemplateId}
                exercises={exercises}
                onClose={closeModal}
                onSave={handleSaved}
              />
            ) : mode == "create" ? (
              <WorkoutTemplateCreate
                exercises={exercises}
                onClose={closeModal}
                onSave={handleSaved}
              />
            ) : (
              <WorkoutTemplateRead templateId={modalTemplateId} />
            )}
          </div>
        </DialogContent>
      </Dialog>
      <WorkoutTemplateDelete
        template={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={(id) => {
          setTemplates((prev) => prev.filter((t) => t.id !== id));
          if (selected?.id === id) setSelected(null);
        }}
        onError={setError}
      />
    </div>
  );
}

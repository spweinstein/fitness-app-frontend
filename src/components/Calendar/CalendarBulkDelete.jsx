import { useRef, useState } from "react";
import { deleteWorkout } from "@/src/services/workoutService.js";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const DELETE_BATCH_SIZE = 5;

async function deleteWorkoutsInBatches(ids) {
  const results = [];

  for (let i = 0; i < ids.length; i += DELETE_BATCH_SIZE) {
    const batch = ids.slice(i, i + DELETE_BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map((id) => deleteWorkout(id)),
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * Confirms deletion of all workouts currently loaded for the calendar view.
 * `ids` null or empty means the dialog is closed.
 */
export default function CalendarBulkDelete({
  ids,
  onClose,
  onDeleted,
  onError,
}) {
  const open = ids != null && ids.length > 0;
  const count = ids?.length ?? 0;
  const isDeletingRef = useRef(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!ids?.length || isDeletingRef.current) return;
    isDeletingRef.current = true;
    setIsDeleting(true);
    try {
      const results = await deleteWorkoutsInBatches(ids);
      const failed = results.filter((r) => r.status === "rejected").length;
      const ok = results.length - failed;
      if (failed === results.length) {
        onError?.("Could not delete workouts. Try again.");
      } else if (failed > 0) {
        onError?.(
          `Deleted ${ok} workout${ok === 1 ? "" : "s"}. ${failed} could not be deleted.`,
        );
      }
      onDeleted?.();
    } catch {
      onError?.("Delete failed. Try again.");
    } finally {
      isDeletingRef.current = false;
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next && isDeletingRef.current) return;
        if (!next) onClose();
      }}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete workouts in this view?</AlertDialogTitle>
          <AlertDialogDescription>
            This cannot be undone.
            {count > 0
              ? ` All ${count} workout${count === 1 ? "" : "s"} currently shown on the calendar will be removed.`
              : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel size="sm" disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            size="sm"
            disabled={isDeleting}
            onClick={(e) => {
              e.preventDefault();
              void handleConfirm();
            }}
          >
            {isDeleting ? "Deleting…" : "Delete all"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

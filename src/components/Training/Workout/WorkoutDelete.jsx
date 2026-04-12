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

export default function WorkoutDelete({ workout, onClose, onDeleted, onError }) {
  const open = workout != null;
  const label = formatTitle(workout);
  const isDeletingRef = useRef(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!workout || isDeletingRef.current) return;
    const id = workout.id;
    isDeletingRef.current = true;
    setIsDeleting(true);
    try {
      await deleteWorkout(id);
      onDeleted(id);
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
          <AlertDialogTitle>Delete this workout?</AlertDialogTitle>
          <AlertDialogDescription>
            This cannot be undone.
            {label ? ` “${label}” will be removed.` : null}
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
            {isDeleting ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function formatTitle(w) {
  if (w == null) return "";
  return String(w.title ?? "").trim();
}

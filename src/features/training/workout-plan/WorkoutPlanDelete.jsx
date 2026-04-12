import { deletePlan } from "@/src/services/planService.js";
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

export default function WorkoutPlanDelete({ plan, onClose, onDeleted, onError }) {
  const open = plan != null;
  const label = formatTitle(plan);

  const handleConfirm = async () => {
    if (!plan) return;
    const id = plan.id;
    onClose();
    try {
      await deletePlan(id);
      onDeleted(id);
    } catch {
      onError?.("Delete failed. Try again.");
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this plan?</AlertDialogTitle>
          <AlertDialogDescription>
            Scheduled workouts generated from this plan may remain on your
            calendar; this only removes the plan definition.
            {label ? ` “${label}” will be removed.` : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel size="sm">Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            size="sm"
            onClick={() => void handleConfirm()}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function formatTitle(p) {
  if (p == null) return "";
  return String(p.title ?? p.name ?? "").trim();
}

import { deleteTemplate } from "@/src/services/templateService.js";
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

/**
 * Controlled confirm dialog; parent holds `template` state (null = closed).
 */
export default function WorkoutTemplateDelete({
  template,
  onClose,
  onDeleted,
  onError,
}) {
  const open = template != null;
  const label = formatTitle(template);

  const handleConfirm = async () => {
    if (!template) return;
    const id = template.id;
    onClose();
    try {
      await deleteTemplate(id);
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
          <AlertDialogTitle>Delete this template?</AlertDialogTitle>
          <AlertDialogDescription>
            This cannot be undone.
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

function formatTitle(t) {
  if (t == null) return "";
  return String(t.title ?? t.name ?? "").trim();
}

import { useContext, useEffect, useState } from "react";
import { Link, NavLink } from "react-router";
import {
  getTemplates,
  deleteTemplate,
} from "@/src/services/templateService.js";
import { getExercises } from "@/src/services/exerciseService.js";
import { UserContext } from "@/src/app/UserContext.jsx";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import WorkoutTemplateRead from "@/src/features/training/workout-template/WorkoutTemplateRead.jsx";
import WorkoutTemplateEdit from "@/src/features/training/workout-template/WorkoutTemplateEdit.jsx";
import { Trash2, Eye, Pencil } from "lucide-react";
import LoadingSpinner from "@/src/shared/feedback/LoadingSpinner.jsx";

const SCOPES = [
  { value: "user", label: "Mine" },
  { value: "public", label: "Public" },
  { value: "all", label: "All" },
];

/** Scoped template management (user/public/all); not used on Explore. */
export default function WorkoutTemplateManageList() {
  const { user } = useContext(UserContext);
  const [scope, setScope] = useState("user");
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [templateId, setTemplateId] = useState(null);
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getTemplates(scope);
        const exercisesData = await getExercises();
        if (!cancelled) {
          setTemplates(Array.isArray(data) ? data : []);
          setExercises(Array.isArray(exercisesData) ? exercisesData : []);
        }
      } catch {
        if (!cancelled) setError("Could not load templates.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [scope]);

  const canManage = (item) =>
    user && item.user != null && item.user === user.id;

  const handleOpenReadModal = async (item) => {
    setTemplateId(item.id);
    setIsEditing(false);
  };

  const handleOpenEditModal = async (item) => {
    setTemplateId(item.id);
    setIsEditing(true);
  };

  const closeDialog = () => {
    setTemplateId(null);
    setIsEditing(false);
  };

  const handleDelete = async (item) => {
    if (!window.confirm("Delete this template? This cannot be undone.")) return;
    try {
      await deleteTemplate(item.id);
      setTemplates((prev) => prev.filter((t) => t.id !== item.id));
    } catch {
      setError("Delete failed. Try again.");
    }
  };

  const handleTemplateSaved = (saved) => {
    if (!saved?.id) return;
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === saved.id
          ? {
              ...t,
              title: saved.title ?? t.title,
              description: saved.description ?? t.description,
              duration: saved.duration ?? t.duration,
            }
          : t,
      ),
    );
  };

  const empty = !loading && templates.length === 0;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Workout templates
          </h1>
          <p className="text-muted-foreground text-sm">
            Build and reuse workout structures.
          </p>
        </div>
        <Button asChild>
          <Link to="/workout-template/new">New template</Link>
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {SCOPES.map(({ value, label }) => (
          <Button
            key={value}
            type="button"
            variant={scope === value ? "default" : "outline"}
            size="sm"
            onClick={() => setScope(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      {error && (
        <p className="text-destructive mb-4 text-sm" role="alert">
          {error}
        </p>
      )}

      {loading && (
        <LoadingSpinner message="Loading…" messageClassName="text-sm" />
      )}

      {empty && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>No templates yet</CardTitle>
            <CardDescription>
              Create a template to reuse across workouts and plans.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link to="/workout-template/new">Create template</Link>
            </Button>
          </CardFooter>
        </Card>
      )}

      {!loading && !empty && (
        <div className="max-h-[30vh] overflow-x-auto rounded-md border">
          <Table className="w-full overflow-x-scroll">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[8rem]">Title</TableHead>
                <TableHead className="w-[1%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <NavLink
                      to={`/workout-template/${item.id}`}
                      className="text-primary hover:underline"
                    >
                      <span className="line-clamp-2">{item.title}</span>
                    </NavLink>
                  </TableCell>

                  <TableCell className="text-right">
                    <span className="inline-flex flex-nowrap items-center justify-end text-sm">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-slate-500 hover:bg-slate-500/10 hover:text-slate-500"
                        aria-label="View template"
                        onClick={() => handleOpenReadModal(item)}
                      >
                        <Eye />
                      </Button>
                      {canManage(item) && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            type="button"
                            className="text-blue-500 hover:bg-blue-500/10 hover:text-blue-500"
                            onClick={() => handleOpenEditModal(item)}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            type="button"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDelete(item)}
                          >
                            <Trash2 />
                          </Button>
                        </>
                      )}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Dialog
        open={templateId != null}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent className="flex max-h-[min(90vh,720px)] w-full flex-col gap-4 overflow-hidden p-6 sm:max-w-3xl">
          <DialogTitle className="shrink-0">Workout Template</DialogTitle>
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {isEditing && templateId != null && exercises.length > 0 ? (
              <WorkoutTemplateEdit
                templateId={templateId}
                exercises={exercises}
                onClose={closeDialog}
                onSave={handleTemplateSaved}
              />
            ) : (
              <WorkoutTemplateRead
                templateId={templateId}
                onClose={closeDialog}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

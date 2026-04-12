import { useState, useEffect, useRef, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { apiErrorMessage } from "@/src/utils/apiErrorMessage.js";
import { getWorkouts, updateWorkout } from "@/src/services/workoutService.js";
import WorkoutSummaryPopover from "@/src/features/training/workout/WorkoutSummaryPopover.jsx";
import WorkoutRead from "@/src/features/training/workout/WorkoutRead.jsx";
import WorkoutCreate from "@/src/features/training/workout/WorkoutCreate.jsx";
import WorkoutEdit from "@/src/features/training/workout/WorkoutEdit.jsx";
import WorkoutDelete from "@/src/features/training/workout/WorkoutDelete.jsx";
import CalendarBulkDelete from "@/src/features/training/calendar/CalendarBulkDelete.jsx";
import LoadingSpinner from "@/src/shared/feedback/LoadingSpinner.jsx";
import "./Calendar.css";
const MOBILE_MQ = "(max-width: 767px)";

function workoutToCalendarEvent(workout) {
  const startMs = new Date(workout.start_dt).getTime();
  const endMs = new Date(workout.end_dt).getTime();
  return {
    id: workout.id,
    title: workout.title,
    start: workout.start_dt,
    end: workout.end_dt,
    extendedProps: {
      status: workout.status,
      notes: workout.notes,
      end_dt: workout.end_dt,
      durationMs:
        Number.isFinite(startMs) && Number.isFinite(endMs)
          ? Math.max(0, endMs - startMs)
          : null,
    },
  };
}

function getEventDurationMs(event) {
  const startMs = event?.start ? event.start.getTime() : null;
  const endMs = event?.end
    ? event.end.getTime()
    : event?.extendedProps?.end_dt
      ? new Date(event.extendedProps.end_dt).getTime()
      : Number.isFinite(event?.extendedProps?.durationMs)
        ? startMs + event.extendedProps.durationMs
        : null;

  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
    return 60 * 60 * 1000;
  }

  return Math.max(0, endMs - startMs);
}

function refetchVisibleRange(calendarRef, fetchWorkouts) {
  if (!calendarRef.current) return;
  const view = calendarRef.current.getApi().view;
  fetchWorkouts(view.activeStart, view.activeEnd);
}

export default function Calendar({
  refreshNonce = 0,
  exercises = [],
  onWorkoutMutated,
}) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [popover, setPopover] = useState({
    open: false,
    workoutId: null,
    x: 0,
    y: 0,
  });
  const [dialog, setDialog] = useState({
    mode: null,
    workoutId: null,
  });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState(null);
  const calendarRef = useRef(null);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MOBILE_MQ).matches,
  );

  const bumpCalendar = useCallback(() => {
    onWorkoutMutated?.();
  }, [onWorkoutMutated]);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // useEffect(() => {
  //   if (!calendarRef.current) return;
  //   calendarRef.current
  //     .getApi()
  //     .changeView(isMobile ? "timeGridWeek" : "dayGridMonth");
  // }, [isMobile]);

  const fetchWorkouts = useCallback(async (start, end) => {
    setLoading(true);
    try {
      const workouts = await getWorkouts(
        start.toISOString(),
        end.toISOString(),
      );
      setEvents(
        Array.isArray(workouts) ? workouts.map(workoutToCalendarEvent) : [],
      );
    } catch (error) {
      console.error("Failed to fetch workouts:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const lastRefreshNonce = useRef(0);
  useEffect(() => {
    if (!refreshNonce || refreshNonce === lastRefreshNonce.current) return;
    lastRefreshNonce.current = refreshNonce;
    if (!calendarRef.current) return;
    refetchVisibleRange(calendarRef, fetchWorkouts);
  }, [refreshNonce, fetchWorkouts]);

  const handleDatesSet = (dateInfo) => {
    fetchWorkouts(dateInfo.start, dateInfo.end);
  };

  const closePopover = () =>
    setPopover((p) => ({ ...p, open: false, workoutId: null }));

  const handleEventClick = (clickInfo) => {
    setPopover({
      open: true,
      workoutId: clickInfo.event.id,
      x: clickInfo.jsEvent.clientX,
      y: clickInfo.jsEvent.clientY,
    });
    clickInfo.jsEvent.preventDefault();
  };

  const closeWorkoutDialog = () => setDialog({ mode: null, workoutId: null });

  const handleSaved = () => {
    bumpCalendar();
    closeWorkoutDialog();
  };

  const workoutDialogOpen =
    dialog.mode === "create" ||
    (dialog.workoutId != null &&
      (dialog.mode === "view" || dialog.mode === "edit"));

  const handleEventDrop = async (dropInfo) => {
    const workoutId = dropInfo.event.id;
    const newStart = dropInfo.event.start;
    const duration = getEventDurationMs(dropInfo.oldEvent ?? dropInfo.event);
    const newEnd = new Date(newStart.getTime() + duration);

    try {
      await updateWorkout(workoutId, {
        start_dt: newStart.toISOString(),
        end_dt: newEnd.toISOString(),
      });
      fetchWorkouts(dropInfo.view.activeStart, dropInfo.view.activeEnd);
    } catch (error) {
      dropInfo.revert();
      alert(apiErrorMessage(error, "Could not move workout"));
      console.error(error);
    }
  };

  const handleEventResize = async (resizeInfo) => {
    const workoutId = resizeInfo.event.id;
    const newEnd = resizeInfo.event.end;

    try {
      await updateWorkout(workoutId, {
        end_dt: newEnd.toISOString(),
      });
      fetchWorkouts(resizeInfo.view.activeStart, resizeInfo.view.activeEnd);
    } catch (error) {
      resizeInfo.revert();
      alert(apiErrorMessage(error, "Could not resize workout"));
      console.error(error);
    }
  };
  let headerToolbar = null;
  if (isMobile) {
    headerToolbar = {
      left: "prev,next",
      right:
        "dayGridMonth,timeGridWeek,timeGridDay createWorkout clearSelection",
    };
  } else {
    headerToolbar = {
      left: "prev,next today",
      center: "title",
      right:
        "dayGridMonth,timeGridWeek,timeGridDay createWorkout clearSelection",
    };
  }

  return (
    headerToolbar && (
      <section className="relative flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Workout schedule
          </h2>
          {loading ? (
            <LoadingSpinner
              variant="inline"
              size="sm"
              message="Loading…"
              ariaLive="polite"
              ariaBusy={false}
              className="text-muted-foreground"
            />
          ) : null}
        </div>

        <div
          className={cn(
            "border-border bg-background relative overflow-hidden rounded-lg border",
            "h-[min(75vh,44rem)] min-h-[22rem] sm:min-h-[26rem]",
            loading && "opacity-60",
          )}
          aria-busy={loading}
        >
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            height="100%"
            events={events}
            datesSet={handleDatesSet}
            editable
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            selectable
            dayMaxEvents={3}
            moreLinkClick="popover"
            expandRows={false}
            handleWindowResize
            headerToolbar={headerToolbar}
            customButtons={{
              createWorkout: {
                text: "+ Workout",
                click: () => setDialog({ mode: "create", workoutId: null }),
              },
              clearSelection: {
                text: "Clear",
                hint: "Delete all workouts in the current calendar view",
                click: () => {
                  if (!events.length) {
                    alert(
                      "No workouts to delete in the current calendar view.",
                    );
                    return;
                  }
                  setBulkDeleteIds([
                    ...new Set(events.map((e) => String(e.id))),
                  ]);
                },
              },
            }}
          />
        </div>

        <WorkoutSummaryPopover
          open={popover.open}
          onOpenChange={(next) => {
            if (!next) closePopover();
          }}
          anchorPosition={{ x: popover.x, y: popover.y }}
          workoutId={popover.workoutId}
          onViewDetails={(w) =>
            setDialog({ mode: "view", workoutId: String(w.id) })
          }
          onEdit={(w) => setDialog({ mode: "edit", workoutId: String(w.id) })}
          onRequestDelete={(w) => setDeleteTarget(w)}
        />

        <Dialog
          open={workoutDialogOpen}
          onOpenChange={(open) => {
            if (!open) closeWorkoutDialog();
          }}
        >
          <DialogContent className="flex max-h-[min(90vh,720px)] w-full flex-col gap-4 overflow-hidden p-6 sm:max-w-3xl">
            <DialogTitle className="shrink-0">
              {dialog.mode === "edit"
                ? "Edit workout"
                : dialog.mode === "create"
                  ? "Create workout"
                  : "View workout"}
            </DialogTitle>
            <DialogDescription
              className="sr-only"
              id="workout-instance-dialog-description"
            >
              {dialog.mode === "edit"
                ? "Edit this scheduled workout"
                : dialog.mode === "create"
                  ? "Create a new workout on your calendar"
                  : "View this scheduled workout"}
            </DialogDescription>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              {dialog.mode === "edit" && dialog.workoutId != null ? (
                <WorkoutEdit
                  workoutId={dialog.workoutId}
                  exercises={exercises}
                  onClose={closeWorkoutDialog}
                  onSave={handleSaved}
                />
              ) : dialog.mode === "create" ? (
                <WorkoutCreate
                  exercises={exercises}
                  onClose={closeWorkoutDialog}
                  onSave={handleSaved}
                />
              ) : dialog.mode === "view" && dialog.workoutId != null ? (
                <WorkoutRead workoutId={dialog.workoutId} />
              ) : null}
            </div>
          </DialogContent>
        </Dialog>

        <WorkoutDelete
          workout={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => {
            setDeleteTarget(null);
            bumpCalendar();
          }}
          onError={(msg) => alert(msg)}
        />

        <CalendarBulkDelete
          ids={bulkDeleteIds}
          onClose={() => setBulkDeleteIds(null)}
          onDeleted={() => {
            setBulkDeleteIds(null);
            calendarRef.current?.getApi()?.unselect();
            bumpCalendar();
          }}
          onError={(msg) => alert(msg)}
        />
      </section>
    )
  );
}

import { useState } from "react";
import { format, startOfDay } from "date-fns";
import { generateWorkoutsFromPlan } from "@/src/services/planService.js";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarRange, Zap } from "lucide-react";
import {
  combineLocalDateTimeToISO,
  formatDateToYYYYMMDD,
} from "@/src/utils/planGenerateHelpers.js";
import { apiErrorMessage } from "@/src/utils/apiErrorMessage.js";

function defaultDateRange() {
  const from = startOfDay(new Date());
  const to = new Date(from);
  to.setDate(to.getDate() + 14);
  return { from, to };
}

/**
 * Icon button + dialog: date range (popover calendar) and POST plan generate.
 */
export default function WorkoutPlanGenerateDialog({
  plan,
  disabled,
  onPointerDown,
  onGenerated,
  triggerVariant = "icon",
  triggerTitle,
}) {
  const [open, setOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [dateRange, setDateRange] = useState(defaultDateRange);
  const [formError, setFormError] = useState("");

  const handleDialogOpenChange = (next) => {
    setOpen(next);
    if (next) {
      setDateRange(defaultDateRange());
      setPickerOpen(false);
      setFormError("");
    }
  };

  const handleConfirm = async () => {
    if (!plan?.id) return;
    setFormError("");
    const { from, to } = dateRange ?? {};
    if (!from || !to) {
      setFormError("Select a start and end date.");
      return;
    }
    const startKey = formatDateToYYYYMMDD(from);
    const endKey = formatDateToYYYYMMDD(to);
    if (!startKey || !endKey) {
      setFormError("Invalid date range.");
      return;
    }
    const start_dt = combineLocalDateTimeToISO(startKey, "12:00");
    if (!start_dt) {
      setFormError("Invalid start date.");
      return;
    }
    const GENERATE_FAILED = "Could not generate workouts.";
    setPending(true);
    try {
      const result = await generateWorkoutsFromPlan(plan.id, {
        start_dt,
        end_dt: endKey,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      onGenerated?.(result);
      setOpen(false);
    } catch (err) {
      console.log(err);
      setFormError(apiErrorMessage(err, GENERATE_FAILED));
    } finally {
      setPending(false);
    }
  };

  const rangeLabel =
    dateRange?.from && dateRange?.to
      ? `${format(dateRange.from, "LLL d, y")} – ${format(dateRange.to, "LLL d, y")}`
      : dateRange?.from
        ? `${format(dateRange.from, "LLL d, y")} – …`
        : null;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        aria-label="Generate workouts from plan"
        title={
          triggerTitle ?? "Add plan workouts to your calendar for a date range"
        }
        onPointerDown={onPointerDown}
        onClick={() => setOpen(true)}
        className={triggerVariant === "labeled" ? "gap-1.5" : undefined}
      >
        <Zap className="size-4" />
        {triggerVariant === "labeled" ? "Generate workouts" : null}
      </Button>

      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent
          className="sm:max-w-[min(100vw-2rem,28rem)]"
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle>Generate workouts</DialogTitle>
            <DialogDescription>
              Add sessions from{" "}
              <span className="font-medium text-foreground">
                {plan?.title ?? "this plan"}
              </span>{" "}
              for each day in the range. Each step uses its own time of day (or
              a rest day where set). End date is inclusive.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full justify-start gap-2 text-left font-normal"
                  data-empty={!rangeLabel}
                >
                  <CalendarRange className="text-muted-foreground size-4 shrink-0" />
                  <span
                    className={
                      rangeLabel ? "text-foreground" : "text-muted-foreground"
                    }
                  >
                    {rangeLabel ?? "Pick a date range"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="z-[60] w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  numberOfMonths={2}
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  autoFocus
                />
              </PopoverContent>
            </Popover>

            {formError ? (
              <p className="text-destructive text-sm" role="alert">
                {formError}
              </p>
            ) : null}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={pending}
              onClick={() => void handleConfirm()}
            >
              {pending ? "Generating…" : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

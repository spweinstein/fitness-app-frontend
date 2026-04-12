import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

import "react-day-picker/style.css";

/**
 * shadcn-style calendar wrapper (React DayPicker v9 + default RDP stylesheet).
 * Supports mode="single" | "range" and passes through other DayPicker props.
 */
function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-xs",
        "[--rdp-accent-color:var(--color-primary)]",
        "[--rdp-accent-background-color:color-mix(in_oklab,var(--color-primary)_18%,transparent)]",
        "[--rdp-range_middle-background-color:color-mix(in_oklab,var(--color-primary)_14%,transparent)]",
        "[--rdp-range_start-date-background-color:var(--color-primary)]",
        "[--rdp-range_end-date-background-color:var(--color-primary)]",
        className,
      )}
      classNames={{
        months: "relative flex flex-col gap-4 sm:flex-row sm:gap-6",
        month: "flex w-full flex-col gap-4",
        month_caption: "flex h-8 items-center justify-center px-10",
        caption_label: "text-sm font-medium",
        nav: "absolute top-2 flex w-full justify-between px-1",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "size-8 p-0 aria-disabled:opacity-40",
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "size-8 p-0 aria-disabled:opacity-40",
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "text-muted-foreground flex-1 select-none text-center text-[0.8rem] font-normal",
        week: "mt-2 flex w-full",
        day: "relative flex-1 p-0 text-center text-sm",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-9 min-w-9 p-0 font-normal",
        ),
        selected:
          "[&_button]:bg-primary [&_button]:text-primary-foreground [&_button]:hover:bg-primary [&_button]:hover:text-primary-foreground",
        today: "[&_button]:bg-accent [&_button]:text-accent-foreground",
        outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-40",
        range_middle: "bg-accent/50 [&_button]:bg-transparent",
        range_start: "rounded-l-md bg-accent/50",
        range_end: "rounded-r-md bg-accent/50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ className: chevronClass, orientation, ...chevronProps }) =>
          orientation === "left" ? (
            <ChevronLeft
              className={cn("size-4", chevronClass)}
              {...chevronProps}
            />
          ) : (
            <ChevronRight
              className={cn("size-4", chevronClass)}
              {...chevronProps}
            />
          ),
      }}
      {...props}
    />
  );
}

export { Calendar };

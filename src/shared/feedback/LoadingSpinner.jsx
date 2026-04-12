import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

const variantRoot = {
  default: "",
  centered: "flex min-h-[12rem] flex-col items-center justify-center gap-3",
  fullscreen: "flex min-h-dvh w-full flex-col items-center justify-center gap-3 p-4",
  inline: "inline-flex items-center gap-2",
};

const spinnerSize = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-6",
};

const titleDefaultClass =
  "text-foreground text-lg font-semibold tracking-tight";

/**
 * Wraps shadcn {@link Spinner} with optional title/message and layout variants.
 *
 * @param {object} props
 * @param {string} [props.message]
 * @param {string} [props.title]
 * @param {"h1"|"h2"|"h3"|"span"} [props.titleAs="h3"]
 * @param {"default"|"centered"|"fullscreen"|"inline"} [props.variant="default"]
 * @param {"horizontal"|"vertical"} [props.orientation="horizontal"]
 * @param {"sm"|"md"|"lg"} [props.size="md"]
 * @param {string} [props.className]
 * @param {string} [props.messageClassName]
 * @param {"polite"|"off"} [props.ariaLive="polite"]
 * @param {boolean} [props.ariaBusy=true] — set false when a parent already has aria-busy
 * @param {boolean} [props.decorative=false] — hide spinner from AT (e.g. when label/placeholder already conveys loading)
 */
export default function LoadingSpinner({
  message,
  title,
  titleAs: TitleTag = "h3",
  variant = "default",
  orientation = "horizontal",
  size = "md",
  className,
  messageClassName,
  ariaLive = "polite",
  ariaBusy = true,
  decorative = false,
}) {
  const textMuted = "text-muted-foreground text-sm";
  const showTitle = Boolean(title);
  const showMessage = Boolean(message);

  const hideSpinnerFromAt =
    decorative ||
    (variant === "inline" && showMessage);

  const spinnerNode = (
    <Spinner
      className={cn(spinnerSize[size], variant === "inline" && "shrink-0")}
      {...(hideSpinnerFromAt
        ? { "aria-hidden": true, role: "presentation" }
        : {})}
    />
  );

  if (variant === "inline") {
    return (
      <span
        className={cn(variantRoot.inline, className)}
        aria-live={decorative ? undefined : ariaLive}
        {...(ariaBusy && !decorative ? { "aria-busy": true } : {})}
      >
        {spinnerNode}
        {showMessage ? (
          <span className={cn(textMuted, messageClassName)}>{message}</span>
        ) : null}
      </span>
    );
  }

  const flexDir =
    orientation === "vertical" ? "flex-col items-center" : "flex-row items-center";
  const titleClass = titleDefaultClass;

  const textBlock =
    showTitle || showMessage ? (
      orientation === "vertical" ? (
        <>
          {showTitle ? <TitleTag className={titleClass}>{title}</TitleTag> : null}
          {showMessage ? (
            <p className={cn(textMuted, messageClassName)}>{message}</p>
          ) : null}
        </>
      ) : showTitle ? (
        <div className="min-w-0 flex-1 space-y-1">
          <TitleTag className={titleClass}>{title}</TitleTag>
          {showMessage ? (
            <p className={cn(textMuted, messageClassName)}>{message}</p>
          ) : null}
        </div>
      ) : showMessage ? (
        <p className={cn(textMuted, messageClassName)}>{message}</p>
      ) : null
    ) : null;

  return (
    <div
      className={cn(
        variantRoot[variant],
        flexDir,
        orientation === "horizontal" && "gap-3",
        orientation === "vertical" && "gap-2",
        className,
      )}
      role={decorative ? undefined : "status"}
      aria-live={decorative ? undefined : ariaLive}
      {...(ariaBusy && !decorative ? { "aria-busy": true } : {})}
    >
      {spinnerNode}
      {textBlock}
    </div>
  );
}

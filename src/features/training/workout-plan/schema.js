import { z } from "zod";

export const planTemplateLinkRowSchema = z.object({
  id: z.any().optional(),
  template: z.union([z.string(), z.number()]).optional(),
  time: z.string().optional(),
  order: z.number().optional(),
});

export const workoutPlanSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().optional(),
  is_public: z.boolean(),
  template_links: z.array(planTemplateLinkRowSchema),
});

function normalizeTimeForApi(timeStr) {
  if (timeStr == null || String(timeStr).trim() === "") return "09:00:00";
  const t = String(timeStr).trim();
  const parts = t.split(":");
  if (parts.length === 2) return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}:00`;
  if (parts.length >= 3)
    return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}:${parts[2].padStart(2, "0").slice(0, 2)}`;
  return "09:00:00";
}

function formatTimeForInput(value) {
  if (value == null || value === "") return "09:00";
  const s = String(value);
  const parts = s.split(":");
  if (parts.length >= 2) return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
  return "09:00";
}

/** Resolve template pk from API link (FK id, nested object, or template_detail only). */
export function linkTemplateIdFromApi(link) {
  if (link == null) return "";
  const t = link.template;
  if (t != null && typeof t !== "object") return String(t);
  if (typeof t === "object" && t?.id != null) return String(t.id);
  const det = link.template_detail;
  if (det?.id != null) return String(det.id);
  return "";
}

function mapApiLinksToForm(links) {
  if (!links?.length) {
    return [{ template: "", time: "09:00", order: 0 }];
  }
  return [...links]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.id ?? 0) - (b.id ?? 0))
    .map((link, index) => ({
      id: link.id,
      template: linkTemplateIdFromApi(link),
      time: formatTimeForInput(link.time),
      order: link.order ?? index,
    }));
}

export function planDefaultsFromProps(defaultValues) {
  if (!defaultValues) {
    return {
      title: "",
      description: "",
      is_public: false,
      template_links: [{ template: "", time: "09:00", order: 0 }],
    };
  }
  return {
    title: defaultValues.title ?? "",
    description: defaultValues.description ?? "",
    is_public: Boolean(defaultValues.is_public),
    template_links: mapApiLinksToForm(defaultValues.template_links),
  };
}

export function planToApiShape(data) {
  const links = (data.template_links ?? [])
    .filter(
      (row) =>
        row.template !== "" &&
        row.template != null &&
        String(row.template).trim() !== "",
    )
    .map((row, index) => ({
      template: Number(row.template),
      order: index,
      time: normalizeTimeForApi(row.time),
    }));

  return {
    title: data.title.trim(),
    description: data.description?.trim() ?? "",
    is_public: Boolean(data.is_public),
    template_links: links,
  };
}

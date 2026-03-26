"use client";

export type DateFilterState = {
  period: "today" | "week" | "month" | "custom" | "";
  dateFrom: string;
  dateTo: string;
};

interface Props {
  value: DateFilterState;
  onChange: (v: DateFilterState) => void;
}

export function buildQueryString(f: DateFilterState): string {
  if (!f.period && !f.dateFrom && !f.dateTo) return "";
  const p = new URLSearchParams();
  if (f.period && f.period !== "custom") p.set("period", f.period);
  if (f.dateFrom) p.set("dateFrom", f.dateFrom);
  if (f.dateTo)   p.set("dateTo",   f.dateTo);
  const s = p.toString();
  return s ? "?" + s : "";
}

const PERIODS: { value: DateFilterState["period"]; label: string }[] = [
  { value: "today", label: "Aujourd'hui" },
  { value: "week",  label: "7 jours" },
  { value: "month", label: "Ce mois" },
  { value: "custom",label: "Personnalisé" },
];

export default function DateFilter({ value, onChange }: Props) {
  function setPeriod(p: DateFilterState["period"]) {
    if (p === "custom") {
      onChange({ period: "custom", dateFrom: value.dateFrom, dateTo: value.dateTo });
    } else {
      onChange({ period: p, dateFrom: "", dateTo: "" });
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Period pills */}
      <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--surface-3)" }}>
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className="px-3 py-1.5 text-xs font-medium transition-all duration-150 whitespace-nowrap"
            style={
              value.period === p.value
                ? { background: "var(--surface)", color: "var(--brand)", boxShadow: "var(--shadow-sm)", margin: "2px" }
                : { background: "transparent", color: "var(--text-muted)" }
            }
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom date range */}
      {value.period === "custom" && (
        <div className="flex items-center gap-1.5 animate-fade-in">
          <input
            type="date"
            value={value.dateFrom}
            onChange={(e) => onChange({ ...value, dateFrom: e.target.value })}
            className="input py-1.5 text-xs"
            style={{ width: "140px" }}
          />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>→</span>
          <input
            type="date"
            value={value.dateTo}
            onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
            className="input py-1.5 text-xs"
            style={{ width: "140px" }}
          />
        </div>
      )}
    </div>
  );
}

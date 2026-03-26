// src/components/ui/StatCard.tsx
import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  subColor?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label?: string };
  accent?: "blue" | "green" | "orange" | "purple" | "red";
}

const accentConfig = {
  blue:   { bg: "#EFF6FF", icon: "#DBEAFE", text: "#2563EB", bar: "from-blue-500 to-blue-400" },
  green:  { bg: "#F0FDF4", icon: "#DCFCE7", text: "#16A34A", bar: "from-green-500 to-emerald-400" },
  orange: { bg: "#FFF7ED", icon: "#FED7AA", text: "#EA580C", bar: "from-orange-500 to-amber-400" },
  purple: { bg: "#FAF5FF", icon: "#E9D5FF", text: "#7C3AED", bar: "from-violet-500 to-purple-400" },
  red:    { bg: "#FEF2F2", icon: "#FECACA", text: "#DC2626", bar: "from-red-500 to-rose-400" },
};

export default function StatCard({ label, value, sub, subColor, icon, trend, accent = "blue" }: StatCardProps) {
  const cfg = accentConfig[accent];
  const isPositive = trend && trend.value >= 0;

  return (
    <div className="stat-card animate-fade-in group" style={{ position: "relative", overflow: "hidden" }}>
      {/* Gradient bar top */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${cfg.bar} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          {label}
        </p>
        {icon && (
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
            style={{ background: cfg.icon, color: cfg.text }}
          >
            {icon}
          </div>
        )}
      </div>

      <p className="text-3xl font-bold tracking-tight mb-1" style={{ color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
        {value}
      </p>

      {(sub || trend) && (
        <div className="flex items-center gap-2">
          {trend && (
            <span
              className="inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-md"
              style={{
                background: isPositive ? "#DCFCE7" : "#FEE2E2",
                color:      isPositive ? "#15803D" : "#DC2626",
              }}
            >
              {isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </span>
          )}
          {sub && (
            <p className={`text-xs ${subColor ?? ""}`} style={subColor ? undefined : { color: "var(--text-muted)" }}>
              {sub}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

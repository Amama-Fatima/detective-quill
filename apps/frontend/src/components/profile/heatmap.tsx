"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useContributions } from "@/hooks/use-contributions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  activityRateFillClasses,
  monthNames,
  getCellFill,
  weekdayLabels,
  formatTooltipDate,
} from "@/lib/utils/heatmap-utils";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Flame, Loader2, Sparkles } from "lucide-react";

const Heatmap = () => {
  const { getMonthlyContributionsMutation } = useContributions();
  const now = new Date();
  const year = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);

  useEffect(() => {
    getMonthlyContributionsMutation.mutate({ year, month: selectedMonth });
  }, [selectedMonth, year]);

  const monthOptions = useMemo(
    () =>
      monthNames
        .slice(0, currentMonth)
        .map((label, index) => ({ label, value: index + 1 })),
    [currentMonth],
  );

  const valueMap = useMemo(() => {
    const map: Record<string, number> = {};
    getMonthlyContributionsMutation.data?.data?.days?.forEach((item) => {
      map[item.date] = item.total_score;
    });
    return map;
  }, [getMonthlyContributionsMutation.data]);

  const totalScore = Object.values(valueMap).reduce((sum, v) => sum + v, 0);
  const activeDays = Object.values(valueMap).filter((v) => v > 0).length;

  const daysInMonth = useMemo(
    () => new Date(year, selectedMonth, 0).getDate(),
    [year, selectedMonth],
  );

  const grid = useMemo(() => {
    const firstDayOfWeek = new Date(year, selectedMonth - 1, 1).getDay();
    const cells: (number | null)[] = [
      ...Array(firstDayOfWeek).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);
    const rows: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [year, selectedMonth, daysInMonth]);

  function toDateStr(day: number) {
    const m = String(selectedMonth).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  }

  const insights = useMemo(() => {
    const makeDateStr = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const isCurrentMonth = selectedMonth === currentMonth;
    const referenceDay = isCurrentMonth
      ? Math.min(now.getDate(), daysInMonth)
      : daysInMonth;

    const refDate = new Date(year, selectedMonth - 1, referenceDay);
    const prevDate = new Date(refDate);
    prevDate.setDate(refDate.getDate() - 1);

    const todayCount = valueMap[makeDateStr(refDate)] ?? 0;
    const yesterdayCount = valueMap[makeDateStr(prevDate)] ?? 0;
    const delta = todayCount - yesterdayCount;

    const primary =
      delta > 0
        ? `+${delta} more than yesterday`
        : delta < 0
          ? `${Math.abs(delta)} fewer than yesterday`
          : "Matched yesterday";

    const trend = delta > 0 ? "up" : delta < 0 ? "down" : "flat";

    let bestDay = "";
    let bestScore = 0;
    for (let i = 1; i <= daysInMonth; i++) {
      const score = valueMap[toDateStr(i)] ?? 0;
      if (score > bestScore) {
        bestScore = score;
        bestDay = toDateStr(i);
      }
    }

    let streak = 0;
    let maxStreak = 0;
    for (let i = 1; i <= daysInMonth; i++) {
      const score = valueMap[toDateStr(i)] ?? 0;
      if (score > 0) {
        streak += 1;
        maxStreak = Math.max(maxStreak, streak);
      } else {
        streak = 0;
      }
    }

    return { trend, bestDay, bestScore, maxStreak };
  }, [selectedMonth, currentMonth, now, daysInMonth, valueMap, year]);

  const activityRate = Math.round((activeDays / daysInMonth) * 100);
  const isPending = getMonthlyContributionsMutation.isPending;

  return (
    <div className="w-full rounded-2xl border border-border/60 bg-card overflow-hidden shadow-xl">
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4 bg-primary">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-yellow-400 fill-current" />
          <span className="mystery-title text-[16px] font-semibold tracking-widest uppercase text-background">
            Productivity Heatmap
          </span>
          <span className="rounded-full border border-border/10 bg-card px-2.5 py-0.5 text-[0.8rem] font-medium tracking-wider text-foreground uppercase">
            {monthNames[selectedMonth - 1]} {year}
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        <div className="flex flex-col gap-5 border-b border-border/40 bg-sidebar/60 p-6 lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
          <div className="flex flex-col items-center gap-2">
            <div className="h-36 w-36">
              <DotLottieReact
                src="/lottie/writing.lottie"
                autoplay
                loop
                style={{ width: "100%", height: "100%" }}
              />
            </div>
            <p className="text-center text-[0.8rem] font-semibold tracking-widest text-foreground uppercase font-playfair-display">
              Keep writing, keep growing
            </p>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

          <div className="space-y-2.5">
            {[
              { label: "Total Score", value: isPending ? "—" : totalScore },
              {
                label: "Active Days",
                value: isPending ? "—" : `${activeDays} / ${daysInMonth}`,
              },
              {
                label: "Activity Rate",
                value: isPending ? "—" : `${activityRate}%`,
                icon: (
                  <Flame className="h-3 w-3 text-orange-500 fill-current" />
                ),
              },
              {
                label: "Best Streak",
                value: isPending
                  ? "—"
                  : `${insights.maxStreak} day${insights.maxStreak === 1 ? "" : "s"}`,
              },
              {
                label: "Best Day",
                value: isPending
                  ? "—"
                  : insights.bestScore > 0
                    ? formatTooltipDate(insights.bestDay)
                    : "—",
              },
            ].map(({ label, value, icon }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2.5 transition-colors hover:bg-background/80"
              >
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {icon}
                  {label}
                </span>
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="mb-5">
            <Select
              value={String(selectedMonth)}
              onValueChange={(v) => setSelectedMonth(Number(v))}
            >
              <SelectTrigger className="h-8 w-32 rounded-lg text-xs bg-card">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((m) => (
                  <SelectItem
                    key={m.value}
                    value={String(m.value)}
                    className="text-xs"
                  >
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isPending ? (
            <div className="flex h-full min-h-52 flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-xs tracking-wide">
                Loading contributions…
              </span>
            </div>
          ) : (
            <div className="flex h-[85%] flex-col gap-4">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1.5">
                {weekdayLabels.map((label) => (
                  <div
                    key={label}
                    className="text-center text-[0.6rem] font-bold tracking-widest text-muted-foreground uppercase"
                  >
                    {label}
                  </div>
                ))}
              </div>

              <div className="flex-1 space-y-1.5">
                {grid.map((row, rowIdx) => (
                  <div key={rowIdx} className="grid grid-cols-7 gap-1.5">
                    {row.map((day, colIdx) => {
                      if (day === null) {
                        return (
                          <div
                            key={colIdx}
                            className="h-9 w-full rounded-lg bg-transparent"
                          />
                        );
                      }
                      const dateStr = toDateStr(day);
                      const count = valueMap[dateStr] ?? 0;
                      return (
                        <Tooltip key={colIdx}>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              aria-label={`${dateStr}: ${count} points`}
                              className={`group flex h-9 w-full items-center justify-center rounded-lg border border-border/30 text-[0.6rem] font-semibold text-foreground/50 shadow-sm transition-all duration-150 hover:scale-105 hover:border-border/70 hover:text-foreground/90 hover:ring-2 hover:ring-ring/40 ${getCellFill(count)}`}
                            >
                              {day}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" sideOffset={6}>
                            <div className="text-xs space-y-0.5">
                              <p className="text-muted-foreground">
                                {formatTooltipDate(dateStr)}
                              </p>
                              <p className="font-semibold">
                                {count} point{count !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 text-[0.65rem] text-muted-foreground">
                <span>Less</span>
                {activityRateFillClasses.map((cls) => (
                  <div
                    key={cls}
                    className={`h-3 w-3 rounded-[3px] border border-border/30 ${cls}`}
                  />
                ))}
                <span>More</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Heatmap;

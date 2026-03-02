"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useContributions } from "@/hooks/use-contributions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  monthNames,
  getCellFill,
  weekdayLabels,
} from "@/lib/utils/heatmap-utils";
import { Flame, Loader2, Sparkles, TrendingUp } from "lucide-react";

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
  const activeDays = Object.values(valueMap).filter(
    (value) => value > 0,
  ).length;

  const daysInMonth = useMemo(
    () => new Date(year, selectedMonth, 0).getDate(),
    [year, selectedMonth],
  );

  // Build rows × 7 cols (Sun–Sat)
  const grid = useMemo(() => {
    const firstDayOfWeek = new Date(year, selectedMonth - 1, 1).getDay();

    const cells: (number | null)[] = [
      ...Array(firstDayOfWeek).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    while (cells.length % 7 !== 0) cells.push(null);

    const rows: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }
    return rows;
  }, [year, selectedMonth, daysInMonth]);

  function toDateStr(day: number) {
    const m = String(selectedMonth).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  }

  function formatTooltipDate(date: string) {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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

    const refStr = makeDateStr(refDate);
    const prevStr = makeDateStr(prevDate);

    const todayCount = valueMap[refStr] ?? 0;
    const yesterdayCount = valueMap[prevStr] ?? 0;
    const delta = todayCount - yesterdayCount;

    const primary =
      delta > 0
        ? `You made ${delta} more contribution${delta === 1 ? "" : "s"} than the previous day.`
        : delta < 0
          ? `You made ${Math.abs(delta)} fewer contribution${Math.abs(delta) === 1 ? "" : "s"} than the previous day.`
          : "You matched yesterday’s contributions.";

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

    const secondary =
      bestScore > 0
        ? `Best day: ${formatTooltipDate(bestDay)} (${bestScore} points) · Longest streak: ${maxStreak} day${maxStreak === 1 ? "" : "s"}.`
        : "No contributions yet for this month. Start with one small task today.";

    return { primary, secondary };
  }, [selectedMonth, currentMonth, now, daysInMonth, valueMap, year]);

  return (
    <Card className="w-full overflow-hidden rounded-lg shadow-md">
      <div className="">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-300 fill-current " />
              <h3 className="mystery-title text-primary">
                Productivity Heatmap
              </h3>
            </CardTitle>
            <CardDescription>
              <p className="case-file text-[0.7rem] my-5 text-background bg-foreground p-2 rounded-sm w-fit">
                {monthNames[selectedMonth - 1]} {year}
              </p>
            </CardDescription>

            <div className="rounded-lg border-border bg-sidebar border-2 px-3 py-2 text-md noir-text">
              <p className="font-medium text-primary">{insights.primary}</p>
              <p className="mt-0.5 text-sm text-primary/90">
                {insights.secondary}
              </p>
            </div>
          </div>

          <Select
            value={String(selectedMonth)}
            onValueChange={(value) => setSelectedMonth(Number(value))}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((month) => (
                <SelectItem key={month.value} value={String(month.value)}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
      </div>

      <CardContent className="space-y-4 pt-5">
        {getMonthlyContributionsMutation.isPending ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Loading contributions...
            </span>
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-3 ">
              <div className="rounded-xl border-[1.5px] border-border bg-sidebar p-3 hover:-translate-y-0.5 transition-transform">
                <p className="text-sm text-foreground font-playfair-display">
                  Total score
                </p>
                <p className="mt-1 text-xl font-semibold">{totalScore}</p>
              </div>
              <div className="rounded-xl border-[1.5px] border-border bg-sidebar p-3 hover:-translate-y-0.5 transition-transform">
                <p className="text-sm text-foreground font-playfair-display">
                  Active days
                </p>
                <p className="mt-1 text-xl font-semibold">{activeDays}</p>
              </div>
              <div className="rounded-xl border-[1.5px] border-border bg-sidebar p-3 hover:-translate-y-0.5 transition-transform">
                <p className="flex items-center gap-1 text-sm text-foreground font-playfair-display">
                  <Flame className="h-4 w-4 text-orange-600 fill-current" />
                  Activity rate
                </p>
                <p className="mt-1 text-xl font-semibold">
                  {Math.round((activeDays / daysInMonth) * 100)}%
                </p>
              </div>
            </div>

            <div className="w-full rounded-xl border border-border bg-muted p-4">
              <div className="mb-3 grid grid-cols-7 gap-2">
                {weekdayLabels.map((label) => (
                  <div
                    key={label}
                    className="text-center text-xs font-medium text-muted-foreground"
                  >
                    {label.slice(0, 1)}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {grid.map((row, rowIdx) => (
                  <div key={rowIdx} className="grid grid-cols-7 gap-2">
                    {row.map((day, colIdx) => {
                      if (day === null) {
                        return (
                          <div key={colIdx} className="flex justify-center">
                            <div className="h-6 w-6 rounded-md bg-transparent" />
                          </div>
                        );
                      }
                      const dateStr = toDateStr(day);
                      const count = valueMap[dateStr] ?? 0;
                      return (
                        <div key={colIdx} className="flex justify-center">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                aria-label={`${dateStr}: ${count} points`}
                                className={`h-5 w-5 rounded-[2px] border border-border/60 shadow-sm transition-all hover:scale-105 hover:ring-2 hover:ring-ring ${getCellFill(count)}`}
                              />
                            </TooltipTrigger>
                            <TooltipContent side="top" sideOffset={6}>
                              <div className="text-xs">
                                <p>{formatTooltipDate(dateStr)}</p>
                                <p className="font-semibold">{count} points</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Low</span>
              <div className="h-3 w-3 rounded-[3px] border border-border/30 bg-accent" />
              <div className="h-3 w-3 rounded-[3px] border border-border/30 bg-blue-300" />
              <div className="h-3 w-3 rounded-[3px] border border-border/30 bg-blue-500" />
              <div className="h-3 w-3 rounded-[3px] border border-border/30 bg-blue-700" />
              <div className="h-3 w-3 rounded-[3px] border border-border/30 bg-blue-950" />
              <span>High</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default Heatmap;

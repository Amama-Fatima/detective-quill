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
import { Loader2 } from "lucide-react";

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

  // Build a 7-column grid (Sun–Sat) with all days of the month
  const grid = useMemo(() => {
    const daysInMonth = new Date(year, selectedMonth, 0).getDate();
    // rows × 7 cols; pad start with nulls based on weekday of the 1st
    const firstDayOfWeek = new Date(year, selectedMonth - 1, 1).getDay();

    const cells: (number | null)[] = [
      ...Array(firstDayOfWeek).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    // Pad to full rows
    while (cells.length % 7 !== 0) cells.push(null);

    const rows: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }
    return rows;
  }, [year, selectedMonth]);

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

  return (
    <Card className="w-full border-border/70 shadow-md">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Productivity Heatmap</CardTitle>
          <CardDescription>
            {monthNames[selectedMonth - 1]} {year} · {activeDays} active days ·{" "}
            Total score: {totalScore}
          </CardDescription>
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

      <CardContent>
        {getMonthlyContributionsMutation.isPending ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Loading contributions...
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-full rounded-xl border border-border/60 bg-muted/10 p-4">
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

              <div className="">
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
                                  className={`h-6 w-6 rounded-md border border-border/30 transition-all hover:scale-105 ${getCellFill(count)}`}
                                />
                              </TooltipTrigger>
                              <TooltipContent side="top" sideOffset={6}>
                                <div className="text-xs">
                                  <p>{formatTooltipDate(dateStr)}</p>
                                  <p className="font-semibold">
                                    {count} points
                                  </p>
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
            </div>

            <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
              <span>Low</span>
              <div className="h-3 w-3 rounded-[3px] border border-border/30 bg-muted" />
              <div className="h-3 w-3 rounded-[3px] border border-border/30 bg-emerald-200 dark:bg-emerald-900" />
              <div className="h-3 w-3 rounded-[3px] border border-border/30 bg-emerald-400 dark:bg-emerald-700" />
              <div className="h-3 w-3 rounded-[3px] border border-border/30 bg-emerald-500 dark:bg-emerald-500" />
              <div className="h-3 w-3 rounded-[3px] border border-border/30 bg-emerald-700 dark:bg-emerald-300" />
              <span>High</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Heatmap;

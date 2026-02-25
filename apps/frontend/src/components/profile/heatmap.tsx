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

  return (
    <Card className="max-w-xl">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Productivity Heatmap</CardTitle>
          <CardDescription>
            Monthly contribution score ({year}) · Total score: {totalScore}
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
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />{" "}
            Loading contributions...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="border-separate border-spacing-2">
              <thead>
                <tr>
                  {weekdayLabels.map((label) => (
                    <th
                      key={label}
                      className="w-9 text-center text-xs font-medium text-muted-foreground pb-1"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grid.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {row.map((day, colIdx) => {
                      if (day === null) {
                        return <td key={colIdx} className="w-9 h-9" />;
                      }
                      const dateStr = toDateStr(day);
                      const count = valueMap[dateStr] ?? 0;
                      return (
                        <td key={colIdx} className="w-15 h-9">
                          <div
                            title={`${dateStr}: ${count} points`}
                            className={`
                              w-full h-full rounded-md flex items-center justify-center
                              text-xs font-medium cursor-default transition-opacity hover:opacity-80
                              ${getCellFill(count)}
                              ${count > 0 ? "text-white dark:text-gray-900" : "text-muted-foreground"}
                            `}
                          >
                            {day}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Heatmap;

export const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const activityRateFillClasses = [
  "bg-[oklch(90%_0.012_80)]",
  "bg-[oklch(80%_0.030_245)]",
  "bg-[oklch(60%_0.040_245)]",
  "bg-[oklch(38%_0.035_245)]",
  "bg-[oklch(24%_0.022_245)]",
];

export const getCellFill = (count: number) => {
  if (count <= 0) return activityRateFillClasses[0];
  if (count <= 3) return activityRateFillClasses[1];
  if (count <= 10) return activityRateFillClasses[2];
  if (count <= 25) return activityRateFillClasses[3];
  return activityRateFillClasses[4];
};

export const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

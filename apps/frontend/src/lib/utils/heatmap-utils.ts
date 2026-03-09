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
  "bg-accent",
  "bg-blue-300",
  "bg-blue-500",
  "bg-blue-700",
  "bg-blue-950",
];

export const getCellFill = (count: number) => {
  if (count <= 0) return activityRateFillClasses[0];
  if (count <= 3) return activityRateFillClasses[1];
  if (count <= 10) return activityRateFillClasses[2];
  if (count <= 25) return activityRateFillClasses[3];
  return activityRateFillClasses[4];
};

export const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

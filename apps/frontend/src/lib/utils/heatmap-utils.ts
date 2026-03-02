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

export const getCellFill = (count: number) => {
  if (count <= 0) return "bg-accent";
  if (count <= 2) return "bg-blue-300";
  if (count <= 5) return "bg-blue-400";
  if (count <= 10) return "bg-blue-500";
  if (count <= 25) return "bg-blue-600";
  if (count <= 50) return "bg-blue-700";

  return "bg-blue-950";
};

export const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

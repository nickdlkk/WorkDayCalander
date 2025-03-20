declare module 'workday-cn' {
  export function isWorkday(date: Date): boolean;
  export function getWorkdaysBetween(startDate: Date, endDate: Date): number;
} 
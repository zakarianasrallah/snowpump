import { addDays, addMonths, isAfter, isBefore, isEqual, lastDayOfMonth } from 'date-fns';
import type { Frequency } from '@prisma/client';

export type RecurringInput = {
  id: string;
  startDate: Date;
  endDate?: Date | null;
  frequency: Frequency;
};

export function generateRecurringDates(
  item: RecurringInput,
  from: Date,
  to: Date
): Date[] {
  const dates: Date[] = [];
  let current = item.startDate;
  const endDate = item.endDate;

  const withinRange = (date: Date) => {
    if (isBefore(date, from)) return false;
    if (isAfter(date, to)) return false;
    if (endDate && isAfter(date, endDate)) return false;
    return true;
  };

  while (isBefore(current, from)) {
    current = nextDate(current, item.frequency);
  }

  while (!isAfter(current, to)) {
    if (withinRange(current)) {
      dates.push(current);
    }
    current = nextDate(current, item.frequency);
  }

  return dates;
}

export function nextDate(current: Date, frequency: Frequency): Date {
  if (frequency === 'WEEKLY') {
    return addDays(current, 7);
  }
  if (frequency === 'BIWEEKLY') {
    return addDays(current, 14);
  }

  const next = addMonths(current, 1);
  const day = current.getDate();
  const lastDay = lastDayOfMonth(next).getDate();
  const safeDay = Math.min(day, lastDay);
  next.setDate(safeDay);
  return next;
}

export function isLate(dueDate: Date, graceDays?: number | null, paid?: boolean) {
  if (paid) return false;
  if (!graceDays) return false;
  const graceDate = addDays(dueDate, graceDays);
  return isAfter(new Date(), graceDate) && !isEqual(new Date(), graceDate);
}

import { AppShell } from '@/components/app-shell';
import { CalendarClient } from '@/components/calendar-client';
import { PeriodFilter } from '@/components/period-filter';
import { requireSession } from '@/lib/require-session';

export default async function CalendarPage() {
  await requireSession();
  return (
    <AppShell>
      <div className="space-y-6">
        <PeriodFilter />
        <CalendarClient />
      </div>
    </AppShell>
  );
}

import { AppShell } from '@/components/app-shell';
import { CalendarClient } from '@/components/calendar-client';
import { requireSession } from '@/lib/require-session';

export default async function CalendarPage() {
  await requireSession();
  return (
    <AppShell>
      <CalendarClient />
    </AppShell>
  );
}

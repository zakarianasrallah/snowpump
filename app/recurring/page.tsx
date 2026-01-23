import { AppShell } from '@/components/app-shell';
import { RecurringClient } from '@/components/recurring-client';
import { PeriodFilter } from '@/components/period-filter';
import { requireSession } from '@/lib/require-session';

export default async function RecurringPage() {
  await requireSession();
  return (
    <AppShell>
      <div className="space-y-6">
        <PeriodFilter />
        <RecurringClient />
      </div>
    </AppShell>
  );
}

import { AppShell } from '@/components/app-shell';
import { ReportsClient } from '@/components/reports-client';
import { PeriodFilter } from '@/components/period-filter';
import { requireSession } from '@/lib/require-session';

export default async function ReportsPage() {
  await requireSession();
  return (
    <AppShell>
      <div className="space-y-6">
        <PeriodFilter />
        <ReportsClient />
      </div>
    </AppShell>
  );
}

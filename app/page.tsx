import { requireSession } from '@/lib/require-session';
import { AppShell } from '@/components/app-shell';
import { DashboardClient } from '@/components/dashboard-client';
import { PeriodFilter } from '@/components/period-filter';

export default async function DashboardPage() {
  await requireSession();
  return (
    <AppShell>
      <div className="space-y-6">
        <PeriodFilter />
        <DashboardClient />
      </div>
    </AppShell>
  );
}

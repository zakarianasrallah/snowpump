import { requireSession } from '@/lib/require-session';
import { AppShell } from '@/components/app-shell';
import { DashboardClient } from '@/components/dashboard-client';

export default async function DashboardPage() {
  await requireSession();
  return (
    <AppShell>
      <DashboardClient />
    </AppShell>
  );
}

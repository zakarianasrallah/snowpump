import { AppShell } from '@/components/app-shell';
import { ReportsClient } from '@/components/reports-client';
import { requireSession } from '@/lib/require-session';

export default async function ReportsPage() {
  await requireSession();
  return (
    <AppShell>
      <ReportsClient />
    </AppShell>
  );
}

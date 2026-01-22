import { AppShell } from '@/components/app-shell';
import { TransactionsClient } from '@/components/transactions-client';
import { PeriodFilter } from '@/components/period-filter';
import { requireSession } from '@/lib/require-session';

export default async function TransactionsPage() {
  await requireSession();
  return (
    <AppShell>
      <div className="space-y-6">
        <PeriodFilter />
        <TransactionsClient />
      </div>
    </AppShell>
  );
}

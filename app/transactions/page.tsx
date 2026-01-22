import { AppShell } from '@/components/app-shell';
import { TransactionsClient } from '@/components/transactions-client';
import { requireSession } from '@/lib/require-session';

export default async function TransactionsPage() {
  await requireSession();
  return (
    <AppShell>
      <TransactionsClient />
    </AppShell>
  );
}

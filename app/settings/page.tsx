import { AppShell } from '@/components/app-shell';
import { SettingsClient } from '@/components/settings-client';
import { requireSession } from '@/lib/require-session';

export default async function SettingsPage() {
  await requireSession();
  return (
    <AppShell>
      <SettingsClient />
    </AppShell>
  );
}

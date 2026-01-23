'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

type ProjectionEntry = {
  date: string;
  type: 'INCOME' | 'EXPENSE';
  name: string;
  amount: string;
  currency: 'CAD' | 'MAD';
  convertedAmount: string | null;
  paid: boolean;
  graceDays?: number | null;
  categoryId?: string | null;
  cumulative?: string;
};

type ProjectionResponse = {
  entries: ProjectionEntry[];
  totals: {
    totalIncome: string;
    totalExpense: string;
    net: string;
  };
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(value);

export function DashboardClient() {
  const [projection, setProjection] = useState<ProjectionResponse | null>(null);
  const [error, setError] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'CAD' | 'MAD'>('CAD');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [recurringName, setRecurringName] = useState('');
  const [recurringAmount, setRecurringAmount] = useState('');
  const [recurringCurrency, setRecurringCurrency] = useState<'CAD' | 'MAD'>('CAD');
  const [recurringFrequency, setRecurringFrequency] = useState<
    'WEEKLY' | 'BIWEEKLY' | 'FOUR_WEEKS' | 'MONTHLY'
  >('MONTHLY');
  const [recurringStartDate, setRecurringStartDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [recurringEndDate, setRecurringEndDate] = useState('');
  const [recurringIncomes, setRecurringIncomes] = useState<
    { id: string; name: string; amount: string; currency: string; frequency: string }[]
  >([]);

  const loadProjection = async () => {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 90);
    const response = await fetch(`/api/projection?from=${from.toISOString()}&to=${to.toISOString()}`);
    if (!response.ok) {
      setError('Impossible de charger les données.');
      return;
    }
    const data = (await response.json()) as ProjectionResponse;
    setProjection(data);
  };

  const loadRecurring = async () => {
    const response = await fetch('/api/recurring');
    if (!response.ok) return;
    const data = (await response.json()) as Array<{
      id: string;
      type: 'INCOME' | 'EXPENSE';
      name: string;
      amount: string;
      currency: string;
      frequency: string;
    }>;
    setRecurringIncomes(data.filter((item) => item.type === 'INCOME'));
  };

  useEffect(() => {
    loadProjection();
    loadRecurring();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    const response = await fetch('/api/one-time', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        name,
        amount: Number(amount),
        currency,
        date: new Date(date).toISOString(),
        categoryId: null
      })
    });
    if (!response.ok) {
      setError('Erreur lors de la création.');
      return;
    }
    setName('');
    setAmount('');
    await loadProjection();
  };

  const handleRecurringSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    const response = await fetch('/api/recurring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'INCOME',
        name: recurringName,
        amount: Number(recurringAmount),
        currency: recurringCurrency,
        frequency: recurringFrequency,
        startDate: recurringStartDate,
        endDate: recurringEndDate || null,
        categoryId: null,
        isActive: true
      })
    });
    if (!response.ok) {
      setError('Erreur lors de la création du revenu récurrent.');
      return;
    }
    setRecurringName('');
    setRecurringAmount('');
    setRecurringEndDate('');
    await loadProjection();
    await loadRecurring();
  };

  const entries = projection?.entries ?? [];
  const totals = projection?.totals;
  const missingFx = entries.some(
    (entry) => entry.currency === 'MAD' && !entry.convertedAmount
  );
  const netNegative = totals ? Number(totals.net) < 0 : false;
  const overdueCount = entries.filter((entry) => {
    if (entry.type !== 'EXPENSE' || entry.paid || !entry.graceDays) return false;
    const dueDate = new Date(entry.date);
    const grace = new Date(dueDate);
    grace.setDate(grace.getDate() + entry.graceDays);
    return new Date() > grace;
  }).length;

  const worstDay = entries.reduce<{ date: string; value: number } | null>((acc, entry) => {
    if (!entry.cumulative) return acc;
    const value = Number(entry.cumulative);
    if (!acc || value < acc.value) {
      return { date: entry.date, value };
    }
    return acc;
  }, null);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-slate-500">Revenus</p>
          <p className="text-2xl font-semibold">
            {totals ? formatMoney(Number(totals.totalIncome)) : '—'}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-slate-500">Dépenses</p>
          <p className="text-2xl font-semibold">
            {totals ? formatMoney(Number(totals.totalExpense)) : '—'}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-slate-500">Net</p>
          <p
            className={`text-2xl font-semibold ${
              totals && Number(totals.net) < 0 ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {totals ? formatMoney(Number(totals.net)) : '—'}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-slate-500">Pire jour</p>
          <p className="text-2xl font-semibold">
            {worstDay ? formatMoney(worstDay.value) : '—'}
          </p>
          <p className="text-xs text-slate-500">
            {worstDay ? new Date(worstDay.date).toLocaleDateString('fr-CA') : ''}
          </p>
        </div>
      </section>

      {missingFx ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Taux de change manquant pour certaines transactions MAD.
        </div>
      ) : null}
      {netNegative ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Net négatif sur la période sélectionnée.
        </div>
      ) : null}
      {overdueCount > 0 ? (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
          {overdueCount} paiement(s) en retard.
        </div>
      ) : null}
      <section className="rounded-lg bg-white p-4 shadow">
        <h2 className="text-lg font-semibold">Ajouter une transaction ponctuelle</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-5" onSubmit={handleSubmit}>
          <Select
            value={type}
            onChange={(event) => setType(event.target.value as 'INCOME' | 'EXPENSE')}
          >
            <option value="INCOME">Revenu</option>
            <option value="EXPENSE">Dépense</option>
          </Select>
          <Input
            placeholder="Nom"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <Input
            type="number"
            step="0.01"
            placeholder="Montant"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
          />
          <Select
            value={currency}
            onChange={(event) => setCurrency(event.target.value as 'CAD' | 'MAD')}
          >
            <option value="CAD">CAD</option>
            <option value="MAD">MAD</option>
          </Select>
          <Input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
          <Button type="submit">Ajouter</Button>
        </form>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </section>

      <section className="rounded-lg bg-white p-4 shadow">
        <h2 className="text-lg font-semibold">Ajouter un revenu récurrent</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-6" onSubmit={handleRecurringSubmit}>
          <Input
            placeholder="Nom"
            value={recurringName}
            onChange={(event) => setRecurringName(event.target.value)}
            required
          />
          <Input
            type="number"
            step="0.01"
            placeholder="Montant"
            value={recurringAmount}
            onChange={(event) => setRecurringAmount(event.target.value)}
            required
          />
          <Select
            value={recurringCurrency}
            onChange={(event) => setRecurringCurrency(event.target.value as 'CAD' | 'MAD')}
          >
            <option value="CAD">CAD</option>
            <option value="MAD">MAD</option>
          </Select>
          <Select
            value={recurringFrequency}
            onChange={(event) =>
              setRecurringFrequency(
                event.target.value as 'WEEKLY' | 'BIWEEKLY' | 'FOUR_WEEKS' | 'MONTHLY'
              )
            }
          >
            <option value="WEEKLY">Hebdo</option>
            <option value="BIWEEKLY">Bimensuel</option>
            <option value="FOUR_WEEKS">Mensuel (4 semaines)</option>
            <option value="MONTHLY">Mensuel (calendrier)</option>
          </Select>
          <Input
            type="date"
            value={recurringStartDate}
            onChange={(event) => setRecurringStartDate(event.target.value)}
            required
          />
          <Input
            type="date"
            value={recurringEndDate}
            onChange={(event) => setRecurringEndDate(event.target.value)}
            placeholder="Fin (optionnel)"
          />
          <Button type="submit" className="md:col-span-2">
            Ajouter
          </Button>
        </form>
        <div className="mt-4 space-y-2 text-sm">
          {recurringIncomes.length === 0 ? (
            <p className="text-slate-500">Aucun revenu récurrent.</p>
          ) : (
            recurringIncomes.map((item) => (
              <div key={item.id} className="flex justify-between border-b pb-2 last:border-b-0">
                <span className="font-medium">{item.name}</span>
                <span>
                  {item.amount} {item.currency} · {item.frequency}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-lg bg-white p-4 shadow">
        <h2 className="text-lg font-semibold">Timeline (90 jours)</h2>
        <div className="mt-4 space-y-3">
          {entries.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune transaction.</p>
          ) : (
            entries.map((entry) => (
              <div
                key={`${entry.name}-${entry.date}-${entry.amount}`}
                className="flex flex-col gap-1 border-b pb-3 text-sm last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{entry.name}</span>
                  <span>{new Date(entry.date).toLocaleDateString('fr-CA')}</span>
                </div>
                <div className="text-slate-600">
                  {entry.type === 'EXPENSE' ? '-' : '+'}
                  {entry.currency === 'CAD'
                    ? formatMoney(Number(entry.amount))
                    : `${entry.amount} MAD`}
                  {entry.currency === 'MAD' ? (
                    entry.convertedAmount ? (
                      <span className="ml-2 text-xs text-slate-500">
                        (~{formatMoney(Number(entry.convertedAmount))})
                      </span>
                    ) : (
                      <span className="ml-2 text-xs text-amber-600">Taux manquant</span>
                    )
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

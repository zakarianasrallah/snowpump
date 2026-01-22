'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
  const params = useSearchParams();
  const [projection, setProjection] = useState<ProjectionResponse | null>(null);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [categoryList, setCategoryList] = useState<{ id: string; name: string }[]>([]);
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'CAD' | 'MAD'>('CAD');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState('');
  const [hasFxRate, setHasFxRate] = useState(true);

  const from = params.get('from');
  const to = params.get('to');
  const rangeLabel = useMemo(() => {
    if (!from || !to) return '';
    const fromDate = new Date(from);
    const toDate = new Date(to);
    return `${fromDate.toLocaleDateString('fr-CA')} → ${toDate.toLocaleDateString('fr-CA')}`;
  }, [from, to]);

  const loadProjection = async () => {
    if (!from || !to) return;
    const response = await fetch(`/api/projection?from=${from}&to=${to}`);
    if (!response.ok) {
      setError('Impossible de charger les données.');
      return;
    }
    const data = (await response.json()) as ProjectionResponse;
    setProjection(data);
  };

  useEffect(() => {
    loadProjection();
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        const map: Record<string, string> = {};
        for (const category of data) {
          map[category.id] = category.name;
        }
        setCategories(map);
        setCategoryList(data);
      });
    fetch('/api/fx/rates')
      .then((res) => res.json())
      .then((data) => setHasFxRate(data.length > 0));
  }, [from, to]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (type === 'EXPENSE' && !categoryId) {
      setError('La catégorie est obligatoire pour une dépense.');
      return;
    }
    if (currency === 'MAD' && !hasFxRate) {
      setError('Impossible de créer une transaction MAD sans taux de change disponible.');
      return;
    }
    const response = await fetch('/api/one-time', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        name,
        amount: Number(amount),
        currency,
        date: new Date(date).toISOString(),
        categoryId: categoryId || null
      })
    });
    if (!response.ok) {
      setError('Erreur lors de la création.');
      return;
    }
    setName('');
    setAmount('');
    setCategoryId('');
    await loadProjection();
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

  const topCategories = entries
    .filter((entry) => entry.type === 'EXPENSE')
    .reduce((acc, entry) => {
      const key = entry.categoryId ?? 'uncategorized';
      const amount = Number(entry.convertedAmount ?? 0);
      acc[key] = (acc[key] ?? 0) + amount;
      return acc;
    }, {} as Record<string, number>);
  const topCategoryList = Object.entries(topCategories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

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
      <section className="rounded-lg bg-white p-4 shadow">
        <p className="text-xs font-semibold uppercase text-slate-500">Récap période</p>
        <p className="mt-1 text-sm text-slate-700">{rangeLabel || 'Sélectionnez une période.'}</p>
      </section>
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
      {topCategoryList.length > 0 ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          Top catégories:{" "}
          {topCategoryList
            .map(([key, value]) => `${categories[key] ?? 'Sans catégorie'} (${formatMoney(value)})`)
            .join(', ')}
        </div>
      ) : null}

      <section className="rounded-lg bg-white p-4 shadow">
        <h2 className="text-lg font-semibold">Ajouter une transaction</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-6" onSubmit={handleSubmit}>
          <Select
            value={type}
            onChange={(event) => setType(event.target.value as 'INCOME' | 'EXPENSE')}
            aria-label="Type"
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
            aria-label="Devise"
          >
            <option value="CAD">CAD</option>
            <option value="MAD">MAD</option>
          </Select>
          <Input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
            aria-label="Date"
          />
          <Select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            required={type === 'EXPENSE'}
            aria-label="Catégorie"
          >
            <option value="">Catégorie</option>
            {categoryList.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <Button type="submit">Ajouter</Button>
        </form>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </section>

      <section className="rounded-lg bg-white p-4 shadow">
        <h2 className="text-lg font-semibold">Timeline (période)</h2>
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

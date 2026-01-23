'use client';

import { useEffect, useState } from 'react';

type Entry = {
  date: string;
  type: 'INCOME' | 'EXPENSE';
  name: string;
  amount: string;
  currency: 'CAD' | 'MAD';
  convertedAmount: string | null;
  paid: boolean;
  cumulative?: string;
};

type DayGroup = {
  date: string;
  entries: Entry[];
  totals: {
    income: number;
    expense: number;
    net: number;
    cumulative: number | null;
  };
};

export function CalendarClient() {
  const [days, setDays] = useState<DayGroup[]>([]);

  useEffect(() => {
    const load = async () => {
      const from = new Date();
      const to = new Date();
      to.setDate(to.getDate() + 14);
      const response = await fetch(`/api/projection?from=${from.toISOString()}&to=${to.toISOString()}`);
      const data = await response.json();
      const grouped: Record<string, DayGroup> = {};
      for (const entry of data.entries as Entry[]) {
        const dateKey = entry.date.slice(0, 10);
        if (!grouped[dateKey]) {
          grouped[dateKey] = {
            date: dateKey,
            entries: [],
            totals: { income: 0, expense: 0, net: 0, cumulative: null }
          };
        }
        grouped[dateKey].entries.push(entry);
        const amount = Number(entry.convertedAmount ?? 0);
        if (entry.type === 'INCOME') {
          grouped[dateKey].totals.income += amount;
        } else {
          grouped[dateKey].totals.expense += amount;
        }
        grouped[dateKey].totals.net =
          grouped[dateKey].totals.income - grouped[dateKey].totals.expense;
        grouped[dateKey].totals.cumulative = entry.cumulative
          ? Number(entry.cumulative)
          : grouped[dateKey].totals.cumulative;
      }
      setDays(Object.values(grouped));
    };
    load();
  }, []);

  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <h2 className="text-lg font-semibold">Timeline sur 2 semaines</h2>
      <div className="mt-4 space-y-4">
        {days.length === 0 ? (
          <p className="text-sm text-slate-500">Aucune donnée.</p>
        ) : (
          days.map((day) => (
            <div key={day.date}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">{day.date}</h3>
                <div className="text-xs text-slate-500">
                  Revenus {day.totals.income.toFixed(2)} CAD · Dépenses {day.totals.expense.toFixed(2)} CAD · Net{' '}
                  {day.totals.net.toFixed(2)} CAD · Cumul{' '}
                  {day.totals.cumulative !== null ? day.totals.cumulative.toFixed(2) : '—'} CAD
                </div>
              </div>
              <ul className="mt-2 space-y-2 text-sm">
                {day.entries.map((entry) => (
                  <li key={`${entry.name}-${entry.date}`} className="flex justify-between">
                    <span>{entry.name}</span>
                    <span>
                      {entry.currency === 'CAD'
                        ? `${entry.amount} CAD`
                        : `${entry.amount} MAD`}
                      {entry.currency === 'MAD' && entry.convertedAmount
                        ? ` (~${Number(entry.convertedAmount).toFixed(2)} CAD)`
                        : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

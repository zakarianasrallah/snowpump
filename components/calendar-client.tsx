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
};

type DayGroup = {
  date: string;
  entries: Entry[];
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
      const grouped: Record<string, Entry[]> = {};
      for (const entry of data.entries as Entry[]) {
        const dateKey = entry.date.slice(0, 10);
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(entry);
      }
      setDays(
        Object.entries(grouped).map(([date, entries]) => ({ date, entries }))
      );
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
              <h3 className="text-sm font-semibold">{day.date}</h3>
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

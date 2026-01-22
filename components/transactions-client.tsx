'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type OneTimeItem = {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  amount: string;
  currency: 'CAD' | 'MAD';
  date: string;
  category?: { name: string } | null;
};

export function TransactionsClient() {
  const params = useSearchParams();
  const [items, setItems] = useState<OneTimeItem[]>([]);

  const from = params.get('from');
  const to = params.get('to');

  const rangeLabel = useMemo(() => {
    if (!from || !to) return '';
    return `${new Date(from).toLocaleDateString('fr-CA')} → ${new Date(to).toLocaleDateString('fr-CA')}`;
  }, [from, to]);

  useEffect(() => {
    const load = async () => {
      if (!from || !to) return;
      const response = await fetch(`/api/one-time?from=${from}&to=${to}`);
      const data = await response.json();
      setItems(data);
    };
    load();
  }, [from, to]);

  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <h2 className="text-lg font-semibold">Transactions ponctuelles</h2>
      {rangeLabel ? <p className="text-sm text-slate-500">{rangeLabel}</p> : null}
      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500">
            <th className="py-2">Date</th>
            <th>Nom</th>
            <th>Type</th>
            <th>Catégorie</th>
            <th>Montant</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-4 text-center text-slate-500">
                Aucune transaction.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="py-2">{item.date.slice(0, 10)}</td>
                <td>{item.name}</td>
                <td>{item.type === 'INCOME' ? 'Revenu' : 'Dépense'}</td>
                <td>{item.category?.name ?? '—'}</td>
                <td>
                  {item.amount} {item.currency}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

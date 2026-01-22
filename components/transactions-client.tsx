'use client';

import { useEffect, useState } from 'react';

type OneTimeItem = {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  amount: string;
  currency: 'CAD' | 'MAD';
  date: string;
};

export function TransactionsClient() {
  const [items, setItems] = useState<OneTimeItem[]>([]);

  useEffect(() => {
    const load = async () => {
      const response = await fetch('/api/one-time');
      const data = await response.json();
      setItems(data);
    };
    load();
  }, []);

  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <h2 className="text-lg font-semibold">Transactions ponctuelles</h2>
      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500">
            <th className="py-2">Date</th>
            <th>Nom</th>
            <th>Type</th>
            <th>Montant</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-4 text-center text-slate-500">
                Aucune transaction.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="py-2">{item.date.slice(0, 10)}</td>
                <td>{item.name}</td>
                <td>{item.type === 'INCOME' ? 'Revenu' : 'Dépense'}</td>
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

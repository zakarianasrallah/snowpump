'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type Report = {
  totals: {
    totalIncome: string;
    totalExpense: string;
    net: string;
  };
  byCategory: { name: string; total: number }[];
  mad: { original: number; converted: number };
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(value);

export function ReportsClient() {
  const params = useSearchParams();
  const [report, setReport] = useState<Report | null>(null);

  const from = params.get('from');
  const to = params.get('to');

  const rangeLabel = useMemo(() => {
    if (!from || !to) return '';
    return `${new Date(from).toLocaleDateString('fr-CA')} → ${new Date(to).toLocaleDateString('fr-CA')}`;
  }, [from, to]);

  useEffect(() => {
    const load = async () => {
      if (!from || !to) return;
      const response = await fetch(`/api/reports/monthly?from=${from}&to=${to}`);
      const data = await response.json();
      setReport(data);
    };
    load();
  }, [from, to]);

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-white p-4 shadow">
        <h2 className="text-lg font-semibold">Totaux de la période</h2>
        {rangeLabel ? <p className="text-sm text-slate-500">{rangeLabel}</p> : null}
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-slate-500">Revenus</p>
            <p className="text-xl font-semibold">
              {report ? formatMoney(Number(report.totals.totalIncome)) : '—'}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Dépenses</p>
            <p className="text-xl font-semibold">
              {report ? formatMoney(Number(report.totals.totalExpense)) : '—'}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Net</p>
            <p className="text-xl font-semibold">
              {report ? formatMoney(Number(report.totals.net)) : '—'}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg bg-white p-4 shadow">
        <h2 className="text-lg font-semibold">Dépenses par catégorie</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {(report?.byCategory ?? []).map((category) => (
            <li key={category.name} className="flex justify-between">
              <span>{category.name}</span>
              <span>{formatMoney(category.total)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg bg-white p-4 shadow">
        <h2 className="text-lg font-semibold">Dépenses MAD converties</h2>
        <p className="mt-2 text-sm text-slate-600">
          {report
            ? `${report.mad.original} MAD (~${formatMoney(report.mad.converted)})`
            : '—'}
        </p>
      </section>
    </div>
  );
}

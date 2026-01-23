'use client';

import { addDays, addMonths, format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const presets = [
  { value: '2w', label: '2 semaines', days: 14 },
  { value: '1m', label: '1 mois', months: 1 },
  { value: '3m', label: '3 mois', months: 3 },
  { value: 'custom', label: 'Personnalisé' }
];

function formatDateInput(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

export function PeriodFilter() {
  const router = useRouter();
  const params = useSearchParams();
  const fromParam = params.get('from');
  const toParam = params.get('to');

  const [preset, setPreset] = useState('2w');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const range = useMemo(() => {
    const today = new Date();
    const baseFrom = fromParam ? new Date(fromParam) : today;
    const baseTo = toParam ? new Date(toParam) : addDays(today, 14);
    return { baseFrom, baseTo };
  }, [fromParam, toParam]);

  useEffect(() => {
    if (!fromParam || !toParam) {
      const today = new Date();
      const defaultFrom = formatDateInput(today);
      const defaultTo = formatDateInput(addDays(today, 14));
      const search = new URLSearchParams(params.toString());
      search.set('from', new Date(defaultFrom).toISOString());
      search.set('to', new Date(defaultTo).toISOString());
      router.replace(`?${search.toString()}`);
      setFrom(defaultFrom);
      setTo(defaultTo);
      return;
    }
    setFrom(formatDateInput(range.baseFrom));
    setTo(formatDateInput(range.baseTo));
  }, [fromParam, toParam, params, range.baseFrom, range.baseTo, router]);

  const applyRange = (nextFrom: Date, nextTo: Date) => {
    const search = new URLSearchParams(params.toString());
    search.set('from', nextFrom.toISOString());
    search.set('to', nextTo.toISOString());
    router.replace(`?${search.toString()}`);
  };

  const handlePresetChange = (value: string) => {
    setPreset(value);
    const today = new Date();
    if (value === '2w') {
      applyRange(today, addDays(today, 14));
      return;
    }
    if (value === '1m') {
      applyRange(today, addMonths(today, 1));
      return;
    }
    if (value === '3m') {
      applyRange(today, addMonths(today, 3));
      return;
    }
  };

  const handleApplyCustom = () => {
    if (!from || !to) return;
    applyRange(new Date(from), new Date(to));
  };

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg bg-white p-4 shadow">
      <div className="min-w-[180px]">
        <label className="text-xs font-semibold uppercase text-slate-500">Période</label>
        <Select value={preset} onChange={(event) => handlePresetChange(event.target.value)}>
          {presets.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase text-slate-500">Du</label>
        <Input
          type="date"
          value={from}
          onChange={(event) => setFrom(event.target.value)}
          disabled={preset !== 'custom'}
        />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase text-slate-500">Au</label>
        <Input
          type="date"
          value={to}
          onChange={(event) => setTo(event.target.value)}
          disabled={preset !== 'custom'}
        />
      </div>
      <Button type="button" onClick={handleApplyCustom} disabled={preset !== 'custom'}>
        Appliquer
      </Button>
    </div>
  );
}

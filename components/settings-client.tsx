'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Category = { id: string; name: string };

type FxRate = {
  id: string;
  rate: string;
  effectiveDate: string;
  source: 'API' | 'MANUAL';
  fetchedAt: string;
};

export function SettingsClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [rates, setRates] = useState<FxRate[]>([]);
  const [manualRate, setManualRate] = useState('');
  const [manualDate, setManualDate] = useState('');
  const [demoEnabled, setDemoEnabled] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    const [categoriesRes, ratesRes, demoRes] = await Promise.all([
      fetch('/api/categories'),
      fetch('/api/fx/rates'),
      fetch('/api/demo')
    ]);
    if (categoriesRes.ok) {
      setCategories(await categoriesRes.json());
    } else {
      setCategories([]);
    }
    if (ratesRes.ok) {
      setRates(await ratesRes.json());
    } else {
      setRates([]);
    }
    if (demoRes.ok) {
      const demo = await demoRes.json();
      setDemoEnabled(demo.enabled);
    } else {
      setDemoEnabled(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategory })
    });
    setNewCategory('');
    await load();
  };

  const handleRefreshFx = async () => {
    setMessage('');
    const response = await fetch('/api/fx/refresh', { method: 'POST' });
    if (!response.ok) {
      setMessage('API indisponible: dernier taux conservé.');
    }
    await load();
  };

  const handleManualRate = async (event: React.FormEvent) => {
    event.preventDefault();
    await fetch('/api/fx/rates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rate: Number(manualRate), effectiveDate: manualDate })
    });
    setManualRate('');
    setManualDate('');
    await load();
  };

  const handleDemoToggle = async () => {
    const next = !demoEnabled;
    setDemoEnabled(next);
    await fetch('/api/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: next })
    });
  };

  const latestRate = rates[0];

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-white p-4 shadow">
        <h2 className="text-lg font-semibold">Catégories</h2>
        <form className="mt-4 flex gap-2" onSubmit={handleAddCategory}>
          <Input
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
            placeholder="Nouvelle catégorie"
            required
          />
          <Button type="submit">Ajouter</Button>
        </form>
        <ul className="mt-4 space-y-2 text-sm">
          {categories.map((category) => (
            <li key={category.id}>{category.name}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg bg-white p-4 shadow">
        <h2 className="text-lg font-semibold">Taux de change MAD → CAD</h2>
        <p className="mt-2 text-sm text-slate-600">
          Dernier refresh: {latestRate ? new Date(latestRate.fetchedAt).toLocaleString('fr-CA') : '—'}
        </p>
        <p className="text-sm text-slate-600">
          Taux courant: {latestRate ? Number(latestRate.rate).toFixed(4) : '—'}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" onClick={handleRefreshFx}>
            Refresh maintenant
          </Button>
          {message ? <span className="text-sm text-amber-600">{message}</span> : null}
        </div>
        <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={handleManualRate}>
          <Input
            placeholder="Taux manuel"
            value={manualRate}
            onChange={(event) => setManualRate(event.target.value)}
            type="number"
            step="0.0001"
            required
          />
          <Input
            type="date"
            value={manualDate}
            onChange={(event) => setManualDate(event.target.value)}
            required
          />
          <Button type="submit">Sauvegarder</Button>
        </form>
        <ul className="mt-4 space-y-2 text-sm">
          {rates.slice(0, 5).map((rate) => (
            <li key={rate.id}>
              {rate.effectiveDate.slice(0, 10)} · {Number(rate.rate).toFixed(4)} ({rate.source})
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg bg-white p-4 shadow">
        <h2 className="text-lg font-semibold">Données demo</h2>
        <p className="mt-2 text-sm text-slate-600">
          Activez pour générer quelques transactions fictives.
        </p>
        <Button type="button" className="mt-3" onClick={handleDemoToggle}>
          {demoEnabled ? 'Désactiver' : 'Activer'}
        </Button>
      </section>
    </div>
  );
}

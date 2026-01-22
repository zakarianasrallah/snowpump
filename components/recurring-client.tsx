'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

type Category = { id: string; name: string };

type RecurringItem = {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  name: string;
  amount: string;
  currency: 'CAD' | 'MAD';
  frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  startDate: string;
  endDate?: string | null;
  categoryId?: string | null;
};

export function RecurringClient() {
  const [items, setItems] = useState<RecurringItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'CAD' | 'MAD'>('CAD');
  const [frequency, setFrequency] = useState<'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'>('MONTHLY');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    const [itemsRes, categoriesRes] = await Promise.all([
      fetch('/api/recurring'),
      fetch('/api/categories')
    ]);
    setItems(await itemsRes.json());
    setCategories(await categoriesRes.json());
  };

  useEffect(() => {
    const today = new Date();
    setStartDate(today.toISOString().slice(0, 10));
    load();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (type === 'EXPENSE' && !categoryId) {
      setError('La catégorie est obligatoire pour une dépense.');
      return;
    }
    const url = editingId ? `/api/recurring/${editingId}` : '/api/recurring';
    const response = await fetch(url, {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        name,
        amount: Number(amount),
        currency,
        frequency,
        startDate,
        endDate: endDate || null,
        categoryId: categoryId || null,
        isActive: true
      })
    });
    if (!response.ok) {
      setError('Erreur lors de la sauvegarde.');
      return;
    }
    setEditingId(null);
    setName('');
    setAmount('');
    setEndDate('');
    setCategoryId('');
    await load();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/recurring/${id}`, { method: 'DELETE' });
    await load();
  };

  const handleEdit = (item: RecurringItem) => {
    setEditingId(item.id);
    setType(item.type);
    setName(item.name);
    setAmount(item.amount);
    setCurrency(item.currency);
    setFrequency(item.frequency);
    setStartDate(item.startDate.slice(0, 10));
    setEndDate(item.endDate ? item.endDate.slice(0, 10) : '');
    setCategoryId(item.categoryId ?? '');
  };

  const handleCancel = () => {
    setEditingId(null);
    setType('EXPENSE');
    setName('');
    setAmount('');
    setCurrency('CAD');
    setFrequency('MONTHLY');
    setStartDate(new Date().toISOString().slice(0, 10));
    setEndDate('');
    setCategoryId('');
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-white p-4 shadow">
        <h2 className="text-lg font-semibold">
          {editingId ? 'Modifier un récurrent' : 'Ajouter un récurrent'}
        </h2>
        <form className="mt-4 grid gap-3 md:grid-cols-6" onSubmit={handleSubmit}>
          <Select value={type} onChange={(event) => setType(event.target.value as 'INCOME' | 'EXPENSE')}>
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
          <Select value={currency} onChange={(event) => setCurrency(event.target.value as 'CAD' | 'MAD')}>
            <option value="CAD">CAD</option>
            <option value="MAD">MAD</option>
          </Select>
          <Select
            value={frequency}
            onChange={(event) => setFrequency(event.target.value as 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY')}
          >
            <option value="WEEKLY">Hebdo</option>
            <option value="BIWEEKLY">Bi-hebdo</option>
            <option value="MONTHLY">Mensuel</option>
          </Select>
          <Input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            required
          />
          <Input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
          <Select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            required={type === 'EXPENSE'}
          >
            <option value="">Catégorie</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit">{editingId ? 'Mettre à jour' : 'Ajouter'}</Button>
            {editingId ? (
              <Button type="button" className="bg-slate-200 text-slate-900 hover:bg-slate-300" onClick={handleCancel}>
                Annuler
              </Button>
            ) : null}
          </div>
        </form>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </section>

      <section className="rounded-lg bg-white p-4 shadow">
        <h2 className="text-lg font-semibold">Récurrents existants</h2>
        <div className="mt-4 space-y-3 text-sm">
          {items.length === 0 ? (
            <p className="text-slate-500">Aucun récurrent.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-slate-500">
                    {item.type === 'INCOME' ? 'Revenu' : 'Dépense'} · {item.amount} {item.currency} ·
                    {` ${item.frequency}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" onClick={() => handleEdit(item)}>
                    Éditer
                  </Button>
                  <Button type="button" onClick={() => handleDelete(item.id)}>
                    Supprimer
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

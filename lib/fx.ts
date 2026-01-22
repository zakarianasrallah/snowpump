import { prisma } from './prisma';
import { Decimal } from '@prisma/client/runtime/library';
import type { FxRate, FxSource } from '@prisma/client';

const MEMORY_CACHE_MS = 6 * 60 * 60 * 1000;
let cache: { fetchedAt: number; rates: FxRate[] } | null = null;

export type FxRateInput = {
  fromCurrency: 'MAD';
  toCurrency: 'CAD';
  rate: Decimal;
  effectiveDate: Date;
  source: FxSource;
};

export async function refreshFxRates(householdId: string) {
  const response = await fetch(
    'https://bcd-api-dca-ipa.cbsa-asfc.cloud-nuage.canada.ca/exchange-rate-lambda/exchange-rates'
  );
  if (!response.ok) {
    throw new Error('FX API unavailable');
  }
  const data = await response.json();
  const rates = (data?.ForeignExchangeRates ?? []) as Array<{
    FromCurrency: { Value: string };
    ToCurrency: { Value: string };
    Rate: string;
    ExchangeRateEffectiveTimestamp: string;
  }>;

  const madRates = rates.filter(
    (rate) => rate.FromCurrency.Value === 'MAD' && rate.ToCurrency.Value === 'CAD'
  );

  const upserts = madRates.map((rate) => {
    const effectiveDate = new Date(rate.ExchangeRateEffectiveTimestamp);
    const effectiveDateOnly = new Date(
      Date.UTC(
        effectiveDate.getUTCFullYear(),
        effectiveDate.getUTCMonth(),
        effectiveDate.getUTCDate()
      )
    );
    return prisma.fxRate.upsert({
      where: {
        householdId_fromCurrency_toCurrency_effectiveDate_source: {
          householdId,
          fromCurrency: 'MAD',
          toCurrency: 'CAD',
          effectiveDate: effectiveDateOnly,
          source: 'API'
        }
      },
      update: {
        rate: new Decimal(rate.Rate),
        fetchedAt: new Date()
      },
      create: {
        householdId,
        fromCurrency: 'MAD',
        toCurrency: 'CAD',
        rate: new Decimal(rate.Rate),
        effectiveDate: effectiveDateOnly,
        source: 'API'
      }
    });
  });

  await prisma.$transaction(upserts);
  cache = null;
}

export async function listFxRates(householdId: string) {
  return prisma.fxRate.findMany({
    where: { householdId },
    orderBy: { effectiveDate: 'desc' }
  });
}

export async function getCachedRates(householdId: string) {
  if (cache && Date.now() - cache.fetchedAt < MEMORY_CACHE_MS) {
    return cache.rates;
  }
  const rates = await prisma.fxRate.findMany({
    where: { householdId, fromCurrency: 'MAD', toCurrency: 'CAD' },
    orderBy: { effectiveDate: 'desc' }
  });
  cache = { fetchedAt: Date.now(), rates };
  return rates;
}

export function selectRateForDate(rates: FxRate[], date: Date) {
  const sorted = [...rates].sort((a, b) => {
    if (a.effectiveDate.getTime() === b.effectiveDate.getTime()) {
      return a.source === 'MANUAL' ? -1 : 1;
    }
    return b.effectiveDate.getTime() - a.effectiveDate.getTime();
  });

  return sorted.find((rate) => rate.effectiveDate <= date) ?? null;
}

export async function convertMadToCad(
  householdId: string,
  amount: Decimal,
  date: Date
) {
  const rates = await getCachedRates(householdId);
  const rate = selectRateForDate(rates, date);
  if (!rate) {
    return { rate: null, converted: null };
  }
  return {
    rate,
    converted: applyFxRate(amount, rate.rate)
  };
}

export function applyFxRate(amount: Decimal, rate: Decimal) {
  return amount.mul(rate);
}

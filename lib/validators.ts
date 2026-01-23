import { z } from 'zod';

export const currencySchema = z.enum(['CAD', 'MAD']);
export const itemTypeSchema = z.enum(['INCOME', 'EXPENSE']);
export const frequencySchema = z.enum(['WEEKLY', 'BIWEEKLY', 'FOUR_WEEKS', 'MONTHLY']);

export const oneTimeSchema = z.object({
  type: itemTypeSchema,
  name: z.string().min(1),
  categoryId: z.string().optional().nullable(),
  amount: z.number().positive(),
  currency: currencySchema,
  date: z.string()
});

export const recurringSchema = z
  .object({
    type: itemTypeSchema,
    name: z.string().min(1),
    categoryId: z.string().optional().nullable(),
    amount: z.number().positive(),
    currency: currencySchema,
    frequency: frequencySchema,
    startDate: z.string(),
    endDate: z.string().optional().nullable(),
    graceDays: z.number().int().optional().nullable(),
    isActive: z.boolean().optional()
  })
  .superRefine((value, context) => {
    if (value.type === 'EXPENSE' && !value.categoryId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Category required for expense',
        path: ['categoryId']
      });
    }
  });

export const categorySchema = z.object({
  name: z.string().min(1)
});

export const idSchema = z.string().min(1);

export const overrideSchema = z.object({
  recurringItemId: z.string(),
  date: z.string(),
  paid: z.boolean(),
  editedAmount: z.number().optional(),
  note: z.string().optional()
});

export const demoSchema = z.object({
  enabled: z.boolean()
});

export const manualFxSchema = z.object({
  rate: z.number().positive(),
  effectiveDate: z.string()
});

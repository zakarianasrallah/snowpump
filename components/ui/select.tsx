import { SelectHTMLAttributes } from 'react';
import clsx from 'clsx';

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={clsx(
        'w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-600 focus:outline-none',
        className
      )}
      {...props}
    />
  );
}

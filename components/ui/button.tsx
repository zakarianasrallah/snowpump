import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

export function Button({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800',
        className
      )}
      {...props}
    />
  );
}

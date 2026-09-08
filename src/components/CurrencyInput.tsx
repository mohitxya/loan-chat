import React from 'react';
import { formatRupeesShort } from '../rules/formatters';

interface CurrencyInputProps {
  id: string;
  value: number | undefined;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  quickAmounts?: number[];
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  id,
  value,
  onChange,
  placeholder = 'e.g. 5,00,000',
  quickAmounts = [50000, 100000, 500000, 1000000, 1500000],
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const num = raw ? parseInt(raw, 10) : 0;
    onChange(num);
  };

  return (
    <div className="space-y-3">
      <div className="relative rounded-xl shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <span className="text-slate-500 font-semibold text-lg">₹</span>
        </div>
        <input
          type="text"
          id={id}
          inputMode="numeric"
          value={value !== undefined && value > 0 ? value.toLocaleString('en-IN') : ''}
          onChange={handleChange}
          placeholder={placeholder}
          className="block w-full rounded-xl border border-slate-300 pl-9 pr-24 py-3.5 text-lg font-semibold text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
        />
        {value !== undefined && value > 0 && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
              {formatRupeesShort(value)}
            </span>
          </div>
        )}
      </div>

      {/* Quick Amount Suggestion Chips */}
      {quickAmounts && quickAmounts.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {quickAmounts.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => onChange(amt)}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                value === amt
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300 ring-1 ring-indigo-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {formatRupeesShort(amt)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

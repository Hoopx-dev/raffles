'use client';

import { cn } from '@/lib/utils';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  className?: string;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 100,
  label = 'Ticket',
  className,
}: QuantitySelectorProps) {
  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleMin = () => {
    onChange(min);
  };

  const handleMax = () => {
    onChange(max);
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="flex items-center gap-4">
        {/* MIN button */}
        <button
          onClick={handleMin}
          disabled={value <= min}
          className="text-xs text-text-muted hover:text-text-dark disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
        >
          MIN
        </button>

        {/* Decrease button */}
        <button
          onClick={handleDecrease}
          disabled={value <= min}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 text-text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>

        {/* Value display */}
        <div className="text-center min-w-[60px]">
          <div className="text-4xl font-bold text-text-dark">{value}</div>
          <div className="text-sm text-text-muted">{label}</div>
        </div>

        {/* Increase button */}
        <button
          onClick={handleIncrease}
          disabled={value >= max}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-mint hover:brightness-95 disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 text-text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {/* MAX button */}
        <button
          onClick={handleMax}
          disabled={value >= max}
          className="text-xs text-primary font-medium hover:text-primary-dark disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
        >
          MAX
        </button>
      </div>
    </div>
  );
}

import { Lock, Unlock } from 'lucide-react';

interface LockedInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  locked: boolean;
  onToggleLock: () => void;
  step?: string;
  min?: string;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export default function LockedInput({
  label,
  value,
  onChange,
  locked,
  onToggleLock,
  step = '1',
  min,
  className = '',
  prefix,
  suffix,
}: LockedInputProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative flex items-center gap-2">
        {locked ? (
          <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 font-medium">
            {prefix}{Number(value) || 0}{suffix}
          </div>
        ) : (
          <div className="relative flex-1">
            {prefix && <span className="absolute left-3 top-2 text-gray-500">{prefix}</span>}
            <input
              type="number"
              value={Number(value) || 0}
              onChange={e => onChange(Number(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md ${prefix ? 'pl-12' : ''} ${suffix ? 'pr-10' : ''}`}
              step={step}
              min={min}
            />
            {suffix && <span className="absolute right-3 top-2 text-gray-500">{suffix}</span>}
          </div>
        )}
        <button
          onClick={onToggleLock}
          className={`p-2 rounded-md transition-colors ${
            locked
              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
          title={locked ? 'Unlock to edit' : 'Lock to prevent editing'}
        >
          {locked ? <Lock size={16} /> : <Unlock size={16} />}
        </button>
      </div>
    </div>
  );
}

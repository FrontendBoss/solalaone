import React from "react";
import * as LucideIcons from "lucide-react";
interface InputNumberProps {
  icon?: string;
  label?: string;
  value?: number;
  min?: number;
  max?: number;
  prefix?: string;
  suffix?: string;
  put?: (x: number) => string;
  get?: (x: number) => number;
  onChange?: (x: number) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

const InputNumber: React.FC<InputNumberProps> = ({
  icon,
  label,
  value = 0,
  min,
  max,
  prefix,
  suffix,
  put = (x) => x.toString(),
  get = (x) => x,
  onChange = () => {},
  placeholder,
  disabled = false,
  error = false,
  helperText,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    const parsed = get(num);
    onChange(parsed);
  };

  // Get the icon component dynamically
  const IconComponent = icon ? (LucideIcons as any)[icon] : null;

  return (
    <div className="w-full max-w-sm">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      {/* Input Container */}
      <div className={`
        relative flex items-center
        bg-white border rounded-lg shadow-sm
        transition-all duration-200 ease-in-out
        ${error 
          ? 'border-red-300 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-200' 
          : 'border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200'
        }
        ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-gray-400'}
      `}>
        
        {/* Icon */}
        {IconComponent && (
          <div className="flex items-center pl-3">
            <div className="p-1.5 bg-blue-100 rounded-md mr-2">
              <IconComponent 
                size={16} 
                className={`${disabled ? 'text-gray-400' : 'text-blue-600'}`}
              />
            </div>
          </div>
        )}
        
        {/* Prefix */}
        {prefix && (
          <span className={`
            px-3 py-2 text-sm font-medium
            ${disabled ? 'text-gray-400' : 'text-gray-600'}
          `}>
            {prefix}
          </span>
        )}
        
        {/* Input Field */}
        <input
          type="number"
          value={put(value)}
          min={min}
          max={max}
          placeholder={placeholder}
          disabled={disabled}
          onChange={handleChange}
          className={`
            flex-1 pr-1 py-2 text-sm
            bg-transparent border-none outline-none
            placeholder-gray-400
            ${disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-900'}
            ${!IconComponent && !prefix ? 'pl-3' : ''}
            ${!suffix ? 'pr-3' : ''}
          `}
        />
        
        {/* Suffix */}
        {suffix && (
          <span className={`
             py-2 mr-2 text-sm font-medium
            ${disabled ? 'text-gray-400' : 'text-gray-600'}
          `}>
            {suffix}
          </span>
        )}
      </div>
      
      {/* Helper Text */}
      {helperText && (
        <p className={`
          mt-1 text-xs
          ${error ? 'text-red-600' : 'text-gray-500'}
        `}>
          {helperText}
        </p>
      )}
    </div>
  );
};
export default InputNumber;
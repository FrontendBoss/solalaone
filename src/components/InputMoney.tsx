import React from "react";

interface InputMoneyProps {
  icon?: string;
  label?: string;
  value?: number;
  prefix?: string;
  suffix?: string;
  precision?: number;
  onChange?: (x: number) => void;
}

const InputMoney: React.FC<InputMoneyProps> = ({
  icon,
  label,
  value = 0,
  prefix = "$",
  suffix,
  precision = 2,
  onChange = () => {},
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseFloat(e.target.value);
    if (!isNaN(num)) {
      onChange(Number(num.toFixed(precision)));
    } else {
      onChange(0);
    }
  };

  return (
    <div className="flex items-center">
      {icon && <span className="material-icons mr-2">{icon}</span>}
      {label && <label className="mr-2">{label}</label>}
      {prefix && <span className="mr-1">{prefix}</span>}
      <input
        type="number"
        min={0}
        value={value}
        step={Math.pow(10, -precision)}
        onChange={handleChange}
        className="input-number"
      />
      {suffix && <span className="ml-1">{suffix}</span>}
    </div>
  );
};

export default InputMoney;
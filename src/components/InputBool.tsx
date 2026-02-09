import React from "react";

interface InputBoolProps {
  label: string;
  value?: boolean;
  onChange?: (value: boolean) => void;
}

const InputBool: React.FC<InputBoolProps> = ({
  label,
  value = false,
  onChange = () => {},
}) => {
  return (
    <label htmlFor={label} className="p-2 relative inline-flex items-center cursor-pointer">
      <input
        id={label}
        type="checkbox"
        checked={value}
        onChange={e => onChange(e.target.checked)}
        className="switch"
      />
      <span className="ml-3 body-large">{label}</span>
    </label>
  );
};

export default InputBool;
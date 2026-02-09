import React from "react";
import InputNumber from "./InputNumber";

interface InputPercentProps {
  icon?: string;
  label?: string;
  value?: number;
  prefix?: string;
  suffix?: string;
  onChange?: (x: number) => void;
}

const InputPercent: React.FC<InputPercentProps> = ({
  icon,
  label,
  value = 0,
  prefix,
  suffix = "%",
  onChange = () => {},
}) => {
  // Format value for display (as percent)
  const put = (x: number) =>
    (x * 100).toLocaleString(undefined, { maximumSignificantDigits: 2 });

  // Parse value from input (back to 0-1 range)
  const get = (x: number) => x / 100;

  const handleChange = (inputValue: number) => {
    onChange(get(inputValue));
  };

  return (
    <InputNumber
      icon={icon}
      label={label}
      value={Number(put(value))}
      prefix={prefix}
      suffix={suffix}
      put={put}
      get={get}
      onChange={handleChange}
    />
  );
};

export default InputPercent;
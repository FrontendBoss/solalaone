import React from "react";
import InputNumber from "./InputNumber";

interface InputRatioProps {
  icon?: string;
  label?: string;
  value?: number;
  decrease?: boolean;
  prefix?: string;
  suffix?: string;
  onChange?: (x: number) => void;
}

const InputRatio: React.FC<InputRatioProps> = ({
  icon,
  label,
  value = 0,
  decrease = false,
  prefix,
  suffix = "%",
  onChange = () => {},
}) => {
  // Format value for display
  const put = (x: number) =>
    ((decrease ? 1 - x : x - 1) * 100).toLocaleString(undefined, {
      maximumSignificantDigits: 2,
    });

  // Parse value from input
  const get = (x: number) =>
    decrease ? 1 - x / 100 : x / 100 + 1;

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

export default InputRatio;
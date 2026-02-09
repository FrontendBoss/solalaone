import React from "react";

interface GaugeProps {
  icon: string;
  title: string;
  label: string;
  value: number;
  labelSuffix?: string;
  min?: number;
  max?: number;
}

const Gauge: React.FC<GaugeProps> = ({
  icon,
  title,
  label,
  value,
  labelSuffix = "",
  min = 0,
  max = 1,
}) => {
  // Calculate progress as a percentage
  const percent = ((value - min) / (max - min)) * 100;
  const radius = 32;
  const stroke = 6;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (percent / 100) * circumference;

  return (
    <div className="grid place-items-center">
      <p className="p-2 body-large">{title}</p>
      <div className="relative" style={{ width: 72, height: 72 }}>
        {/* Circular Progress */}
        <svg
          height={72}
          width={72}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <circle
            stroke="#e0e0e0"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={36}
            cy={36}
          />
          <circle
            stroke="#6750a4"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + " " + circumference}
            style={{ strokeDashoffset, transition: "stroke-dashoffset 0.3s" }}
            r={normalizedRadius}
            cx={36}
            cy={36}
          />
        </svg>
        {/* Icon in the center */}
        <button
          className="absolute inset-0 m-auto flex items-center justify-center"
          style={{ width: 48, height: 48, background: "none", border: "none" }}
          tabIndex={-1}
        >
          <span className="material-icons primary-text" style={{ fontSize: 32 }}>
            {icon}
          </span>
        </button>
      </div>
      <p className="p-2 body-medium">
        <span className="primary-text">
          <b>{label}</b>
        </span>
        <span>{labelSuffix}</span>
      </p>
    </div>
  );
};

export default Gauge;
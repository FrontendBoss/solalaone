import React, { useState } from "react";

interface DropdownProps {
  options: Record<string, string>;
  value: string;
  expandTop?: boolean;
  onChange?: (x: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  expandTop = false,
  onChange = () => {},
}) => {
  const [opened, setOpened] = useState(false);

  return (
    <div className="relative">
      <button
        className="w-full flex items-center justify-between px-4 py-2 rounded border"
        onClick={() => setOpened((o) => !o)}
        type="button"
      >
        <span>
          {value !== undefined ? options[value] : "Choose an option"}
        </span>
        <span className="material-icons ml-2">
          {opened ? "expand_less" : "expand_more"}
        </span>
      </button>

      {opened && (
        <>
          <div
            className="fixed top-0 left-0 w-full h-full z-10"
            onClick={() => setOpened(false)}
            role="presentation"
          />
          <div
            className={`surface-variant on-surface-variant-text absolute ${
              expandTop ? "bottom-full" : ""
            } w-full p-2 rounded-lg shadow-xl z-20`}
          >
            {Object.keys(options).map((option) => (
              <button
                key={option}
                className="dropdown-item block px-4 py-2 w-full text-left rounded"
                style={{
                  backgroundColor: "var(--md-sys-color-surface-variant)",
                  color: "var(--md-sys-color-on-surface)",
                }}
                onMouseOver={e => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "var(--md-sys-color-secondary)";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "var(--md-sys-color-on-secondary)";
                }}
                onMouseOut={e => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "var(--md-sys-color-surface-variant)";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "var(--md-sys-color-on-surface)";
                }}
                onClick={() => {
                  setOpened(false);
                  onChange(option);
                }}
                type="button"
              >
                {options[option]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Dropdown;
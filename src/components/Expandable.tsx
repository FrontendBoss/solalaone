import React, { useState } from "react";

interface ExpandableProps {
  title: string;
  subtitle?: string;
  subtitle2?: string;
  icon?: React.ReactNode | string;
  section?: string;
  secondary?: boolean;
  children?: React.ReactNode;
}

const Expandable: React.FC<ExpandableProps> = ({
  title,
  subtitle = "",
  subtitle2 = "",
  icon = "",
  section = "",
  secondary = false,
  children,
}) => {
  const [openSection, setOpenSection] = useState(section);

  const titleText = secondary ? "secondary-text" : "primary-text";
  const isOpen = openSection === title;

  function toggle() {
    setOpenSection(isOpen ? "" : title);
  }

  return (
    <div>
      <button
        className="flex flex-row w-full p-4 items-center"
        onClick={toggle}
        type="button"
      >
        {/* Icon */}
        <span className={`${titleText} w-12 material-icons`}>
          {typeof icon === "string" ? icon : icon}
        </span>
        {/* Texts */}
        <div className="w-full grid justify-items-start text-left">
          <p className={`${titleText} body-large`}>
            <b>{title}</b>
          </p>
          <p className="label-medium outline-text">{subtitle}</p>
          <p className="label-medium outline-text">{subtitle2}</p>
        </div>
        {/* Expand/Collapse Icon */}
        <span className="material-icons">
          {isOpen ? "expand_less" : "expand_more"}
        </span>
      </button>
      {isOpen && (
        <div className="px-4 pb-6 animate-slide-down">
          {children}
        </div>
      )}
    </div>
  );
};

export default Expandable;
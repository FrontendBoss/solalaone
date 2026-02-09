import React from "react";
import Table from "./Table";

interface TableRow {
  name: string;
  value: string;
  units?: string;
  icon?: string;
}

interface SummaryCardProps {
  title?: string;
  icon?: string;
  rows?: TableRow[];
  children?: React.ReactNode;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title = "",
  icon = "",
  rows = [],
  children,
}) => (
  <div className="grid justify-items-start surface on-surface-text p-4 rounded-lg shadow-lg">
    <div className="flex items-center primary-text">
      {icon && (
        <span className="material-icons w-8 mr-2">{icon}</span>
      )}
      <p className="body-large">
        <b>{title}</b>
      </p>
    </div>
    <div className="py-3 w-full">
      <hr className="border-t" />
    </div>
    <div className="w-full secondary-text">
      <Table rows={rows} />
    </div>
    <div className="px-3">{children}</div>
  </div>
);

export default SummaryCard;
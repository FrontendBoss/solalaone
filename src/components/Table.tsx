import React from "react";

interface TableRow {
  name: string;
  value: string;
  units?: string;
  icon?: string;
}

interface TableProps {
  rows: TableRow[];
}

const Table: React.FC<TableProps> = ({ rows }) => (
  <table className="table-auto w-full body-medium">
    <tbody>
      {rows.map((row, idx) => (
        <tr key={idx}>
          <td className="primary-text py-2">
            <span className="material-icons">{row.icon ?? ""}</span>
          </td>
          <th className="pl-2 text-left">{row.name}</th>
          <td className="pl-2 text-right">
            <span>{row.value.toString()}</span>
            <span className="body-small">{row.units ?? ""}</span>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default Table;
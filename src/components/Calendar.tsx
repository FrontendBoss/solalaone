import React, { useState } from "react";
import Dropdown from "./Dropdown";

const monthDays: Record<string, number> = {
  January: 31,
  February: 28,
  March: 31,
  April: 30,
  May: 31,
  June: 30,
  July: 31,
  August: 31,
  September: 30,
  October: 31,
  November: 30,
  December: 31,
};

const months = Object.keys(monthDays);

interface CalendarProps {
  month: number;
  day: number;
  numCols?: number;
  onChange?: (month: number, day: number) => void;
}

const Calendar: React.FC<CalendarProps> = ({
  month,
  day,
  numCols = 7,
  onChange = () => {},
}) => {
  const [opened, setOpened] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(month);
  const [selectedDay, setSelectedDay] = useState(day);

  function dayFrom(row: number, col: number) {
    return row * numCols + col + 1;
  }

  const daysInMonth = monthDays[months[selectedMonth]];
  const numRows = Math.ceil(daysInMonth / numCols);

  return (
    <div className="relative">
      <button
        className="w-full flex items-center"
        onClick={() => setOpened((o) => !o)}
        type="button"
      >
        <span className="material-icons">event</span>
        <span>
          &nbsp;{months[selectedMonth]} {selectedDay}
        </span>
      </button>

      {opened && (
        <>
          <div
            className="fixed top-0 left-0 w-full h-full z-10"
            onClick={() => setOpened(false)}
            role="presentation"
          />
          <div className="surface-variant on-surface-variant-text absolute right-4 w-auto p-4 rounded-lg shadow-lg z-20">
            <div className="px-4 pb-4">
              <Dropdown
                value={selectedMonth.toString()}
                options={Object.fromEntries(
                  months.map((m, i) => [i.toString(), m])
                )}
                onChange={(value) => {
                  const newMonth = Number(value);
                  setSelectedMonth(newMonth);
                  // Clamp day if new month has fewer days
                  const newDaysInMonth = monthDays[months[newMonth]];
                  const newDay = Math.min(selectedDay, newDaysInMonth);
                  setSelectedDay(newDay);
                  onChange(newMonth, newDay);
                }}
              />
            </div>
            <table>
              <tbody>
                {Array.from({ length: numRows }).map((_, row) => (
                  <tr key={row}>
                    {Array.from({ length: numCols }).map((_, col) => {
                      const d = dayFrom(row, col);
                      if (d > daysInMonth) return <td key={col} />;
                      if (selectedDay === d)
                        return (
                          <td key={col}>
                            <button
                              className="primary on-primary-text relative w-8 h-8 rounded-full"
                              onClick={() => setOpened(false)}
                              type="button"
                            >
                              {d}
                            </button>
                          </td>
                        );
                      return (
                        <td key={col}>
                          <button
                            className="relative w-8 h-8 rounded-full"
                            onClick={() => {
                              setSelectedDay(d);
                              setOpened(false);
                              onChange(selectedMonth, d);
                            }}
                            type="button"
                          >
                            {d}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Calendar;
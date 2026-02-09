import React, { useState, useMemo } from "react";

interface ShowProps {
  keyName?: any;
  value: any;
  maxLength?: number;
  label?: string;
  collapsed?: boolean;
}

const Show: React.FC<ShowProps> = ({
  keyName = undefined,
  value,
  maxLength = 40,
  label = "",
  collapsed = false,
}) => {
  const [expanded, setExpanded] = useState(false);

  // Compute summary and items only when value changes
  const { summary, items } = useMemo(() => {
    let summary = JSON.stringify(value);
    if (summary?.length >= maxLength) {
      summary = summary.substring(0, maxLength) + "...";
    }
    let items: { k: any; v: any }[] = [];
    if (Array.isArray(value)) {
      items = value.map((v, i) => ({ k: i, v }));
    } else if (typeof value === "object" && value !== null) {
      items = Object.keys(value).map((k) => ({ k, v: value[k] }));
    }
    return { summary, items };
  }, [value, maxLength]);

  const isPrimitive =
    ["number", "string", "boolean", "undefined"].includes(typeof value);

  return (
    <div className="flex flex-col font-mono whitespace-nowrap">
      <div className="flex flex-row w-full items-center">
        {collapsed && items.length > 0 ? (
          <button onClick={() => setExpanded((e) => !e)}>
            <span className="material-icons">
              {expanded ? "arrow_drop_down" : "arrow_right"}
            </span>
          </button>
        ) : (
          <div>
            <span className="material-icons">&nbsp;</span>
          </div>
        )}

        {keyName !== undefined && (
          <span className="font-bold">{keyName}:&nbsp;</span>
        )}

        {label ? (
          <span>{label}</span>
        ) : isPrimitive || value === null ? (
          <span>{String(value)}</span>
        ) : Array.isArray(value) ? (
          <span className="font-sans italic">
            ({value.length}) {summary}
          </span>
        ) : (
          <span className="font-sans italic">{summary}</span>
        )}
      </div>

      {(!collapsed || expanded) && items.length > 0 && (
        <div className="flex flex-col ml-8 pb-6 max-h-72 overflow-auto" style={collapsed ? { borderLeft: "solid", borderColor: "var(--md-sys-color-outline-variant)" } : {}}>
          {Array.isArray(value) && (
            <span className="italic">length: {value.length}</span>
          )}
          <div>
            {items.map(({ k, v }) => (
              <Show
                key={k}
                keyName={k}
                value={v}
                collapsed={true}
                maxLength={maxLength}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Show;
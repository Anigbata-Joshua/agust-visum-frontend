import { cn } from "@/lib/utils";

/**
 * Editorial data table for the merchant area. Defaults to a dark,
 * hairline-ruled style. Pass `tone="light"` for a light background.
 */
export function DataTable({ columns = [], rows = [], tone = "dark", emptyText = "No rows." }) {
  if (!rows.length) {
    return (
      <p className="text-sm font-body text-ink/50 py-6 text-center">{emptyText}</p>
    );
  }
  const headClass =
    tone === "dark" ? "text-off/55 border-off/15" : "text-ink/55 border-ink/10";
  const cellClass =
    tone === "dark" ? "border-off/10" : "border-ink/10";
  const cellText = tone === "dark" ? "text-off" : "text-ink";

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left font-body text-sm">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className={cn(
                  "font-cond text-[10px] uppercase tracking-[0.18em] pb-3 border-b",
                  headClass
                )}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={cn("border-b", cellClass, cellText)}>
              {columns.map((col) => (
                <td key={col} className="py-3 pr-4 align-top">
                  {row[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;

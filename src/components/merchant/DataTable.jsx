export function DataTable({ columns = [], rows = [] }) {
  return (
    <table className="w-full text-left font-body text-sm">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col} className="font-cond text-[11px] uppercase tracking-[0.08em] pb-3">
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-t border-ink/10">
            {columns.map((col) => (
              <td key={col} className="py-3">{row[col]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

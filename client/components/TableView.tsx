import { useEffect, useState } from 'react';
import { useTables } from '../hooks/useTables';
import { API_BASE } from '../lib/api';

export default function TableView() {
  const { selectedView } = useTables();
  const [data, setData] = useState<{ columns: any[]; rows: any[] } | null>(null);

  useEffect(() => {
    if (!selectedView) return;
    fetch(`${API_BASE}/tables/views/${selectedView.id}/rows`)
      .then((r) => r.json())
      .then(setData);
  }, [selectedView]);

  if (!selectedView) return <div className="p-4">Select a view</div>;
  if (!data) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 overflow-auto">
      <table className="min-w-full border bg-white shadow-sm">
        <thead>
          <tr>
            {data.columns.map((c) => (
              <th key={c.id} className="border px-2 py-1 bg-gray-100 text-left">
                {c.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((r) => (
            <tr key={r.id}>
              {data.columns.map((c) => (
                <td key={c.id} className="border px-2 py-1">
                  {String(r.data[c.id] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


import { useEffect, useState } from 'react';
import { useTables } from '../hooks/useTables';

export default function KanbanView() {
  const { selectedView } = useTables();
  const [data, setData] = useState<{ columns: any[]; rows: any[] } | null>(null);

  useEffect(() => {
    if (!selectedView) return;
    fetch(`/tables/views/${selectedView.id}/rows`)
      .then((r) => r.json())
      .then(setData);
  }, [selectedView]);

  if (!selectedView) return <div className="p-4">Select a view</div>;
  if (!data) return <div className="p-4">Loading...</div>;

  const column = data.columns.find((c) => c.id === selectedView.kanbanField);
  if (!column) return <div className="p-4">Missing kanban field</div>;

  const groups: Record<string, any[]> = {};
  data.rows.forEach((r) => {
    const key = r.data[column.id] || 'Unset';
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  });

  return (
    <div className="flex space-x-4 p-4 overflow-auto">
      {Object.entries(groups).map(([key, rows]) => (
        <div key={key} className="w-64 bg-gray-100 p-2 rounded">
          <div className="font-bold mb-2">{key}</div>
          {rows.map((r) => (
            <div key={r.id} className="bg-white mb-2 p-2 rounded shadow">
              {data.columns.map((c) => (
                c.id !== column.id && <div key={c.id}>{String(r.data[c.id] ?? '')}</div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}


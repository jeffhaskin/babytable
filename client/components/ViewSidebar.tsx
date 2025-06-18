import React, { useEffect, useState } from 'react';
import { useTables } from '../hooks/useTables';
import { API_BASE } from '../lib/api';

export default function ViewSidebar() {
  const {
    selectedTable,
    selectedView,
    setSelectedView,
  } = useTables();
  const [views, setViews] = useState<any[]>([]);

  useEffect(() => {
    if (!selectedTable) return;
    fetch(`${API_BASE}/tables/${selectedTable.id}/views`)
      .then((r) => r.json())
      .then(setViews);
  }, [selectedTable]);

  if (!selectedTable) return null;

  const grouped: Record<string, any[]> = {};
  views.forEach((v) => {
    const folder = v.path || '';
    if (!grouped[folder]) grouped[folder] = [];
    grouped[folder].push(v);
  });

  return (
    <div className="p-2 border-r border-gray-300 w-60 bg-white overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold">Views</span>
        <button
          className="border px-2 bg-blue-500 text-white rounded"
          onClick={async () => {
            const name = prompt('View name?');
            if (!name) return;
            const res = await fetch(`${API_BASE}/tables/${selectedTable.id}/views`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, type: 'table', path: '' }),
            });
            const v = await res.json();
            setViews((prev) => [...prev, v]);
          }}
        >
          +
        </button>
      </div>
      {Object.entries(grouped).map(([folder, items]) => (
        <div key={folder} className="mb-2">
          {folder && <div className="font-semibold">{folder}</div>}
          <ul>
            {items.map((v) => (
              <li key={v.id}>
                <button
                  className={`block w-full text-left px-1 rounded hover:bg-gray-100 ${selectedView?.id === v.id ? 'bg-blue-100' : ''}`}
                  onClick={() => setSelectedView(v)}
                >
                  {v.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}


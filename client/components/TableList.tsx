import { useEffect } from 'react';
import { useTables } from '../hooks/useTables';
import { API_BASE } from '../lib/api';

export default function TableList() {
  const { tables, setTables, selectedTable, setSelectedTable } = useTables();

  useEffect(() => {
    fetch(`${API_BASE}/tables`)
      .then((r) => r.json())
      .then(setTables);
  }, [setTables]);

  return (
    <div className="p-2 border-r border-gray-300 w-60 bg-white overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold">Tables</span>
        <button
          className="border px-2 bg-blue-500 text-white rounded"
          onClick={async () => {
            const name = prompt('Table name?');
            if (!name) return;
            const res = await fetch(`${API_BASE}/tables`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name }),
            });
            const t = await res.json();
            setTables((prev) => [...prev, t]);
          }}
        >
          +
        </button>
      </div>
      <ul>
        {tables.map((t) => (
          <li key={t.id}>
            <button
              className={`block w-full text-left px-1 rounded hover:bg-gray-100 ${selectedTable?.id === t.id ? 'bg-blue-100' : ''}`}
              onClick={() => setSelectedTable(t)}
            >
              {t.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

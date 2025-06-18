import { useEffect } from 'react';
import { useTables } from '../hooks/useTables';

export default function TableList() {
  const { tables, setTables, selectedTable, setSelectedTable } = useTables();

  useEffect(() => {
    fetch('/tables')
      .then((r) => r.json())
      .then(setTables);
  }, [setTables]);

  return (
    <div className="p-2 border-r w-48 overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold">Tables</span>
        <button
          className="border px-1"
          onClick={async () => {
            const name = prompt('Table name?');
            if (!name) return;
            const res = await fetch('/tables', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name }),
            });
            const t = await res.json();
            setTables([...tables, t]);
          }}
        >
          +
        </button>
      </div>
      <ul>
        {tables.map((t) => (
          <li key={t.id}>
            <button
              className={`block w-full text-left px-1 rounded ${selectedTable?.id === t.id ? 'bg-blue-100' : ''}`}
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

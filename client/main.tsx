import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import TableList from './components/TableList';
import ViewSidebar from './components/ViewSidebar';
import TableView from './components/TableView';
import KanbanView from './components/KanbanView';
import { useTables } from './hooks/useTables';

function App() {
  const { selectedView } = useTables();
  return (
    <div className="flex h-screen text-sm font-sans">
      <TableList />
      <ViewSidebar />
      <div className="flex-1 overflow-hidden">
        {selectedView?.type === 'kanban' ? <KanbanView /> : <TableView />}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


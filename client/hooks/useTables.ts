import create from 'zustand';

interface TableState {
  tables: any[];
  setTables: (tables: any[]) => void;
  selectedTable?: any;
  setSelectedTable: (table: any) => void;
  selectedView?: any;
  setSelectedView: (view: any) => void;
}

export const useTables = create<TableState>((set) => ({
  tables: [],
  setTables: (tables) => set({ tables }),
  selectedTable: undefined,
  setSelectedTable: (table) => set({ selectedTable: table }),
  selectedView: undefined,
  setSelectedView: (view) => set({ selectedView: view }),
}));


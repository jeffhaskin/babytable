import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const listTables = () =>
  prisma.table.findMany({ include: { columns: true, rows: true } });

export const createTable = (name: string) =>
  prisma.table.create({ data: { name } });

export const getTable = (id: string) =>
  prisma.table.findUnique({
    where: { id },
    include: { columns: true, rows: true, views: true },
  });

export const deleteTable = (id: string) =>
  prisma.table.delete({ where: { id } });

export const createColumn = (
  tableId: string,
  name: string,
  type: string,
  linkedTo?: string,
  options?: any,
  order?: number
) =>
  prisma.column.create({
    data: { tableId, name, type, linkedTo, options, order },
  });

export const updateColumn = (
  id: string,
  data: { name?: string; type?: string; linkedTo?: string; options?: any; order?: number }
) => prisma.column.update({ where: { id }, data });

export const deleteColumn = (id: string) =>
  prisma.column.delete({ where: { id } });

export const createRow = (tableId: string, data: any) =>
  prisma.row.create({ data: { tableId, data } });

export const updateRow = (id: string, data: any) =>
  prisma.row.update({ where: { id }, data: { data } });

export const deleteRow = (id: string) => prisma.row.delete({ where: { id } });

export const createView = (
  tableId: string,
  name: string,
  type: string,
  path: string,
  filters?: any,
  sorts?: any,
  kanbanField?: string
) =>
  prisma.view.create({
    data: { tableId, name, type, path, filters, sorts, kanbanField },
  });

export const updateView = (
  id: string,
  data: {
    name?: string;
    type?: string;
    path?: string;
    filters?: any;
    sorts?: any;
    kanbanField?: string;
  }
) => prisma.view.update({ where: { id }, data });

export const deleteView = (id: string) => prisma.view.delete({ where: { id } });

export const listViews = (tableId: string) =>
  prisma.view.findMany({ where: { tableId } });

export const getViewRows = async (id: string) => {
  const view = await prisma.view.findUnique({ where: { id } });
  if (!view) return null;
  const table = await prisma.table.findUnique({
    where: { id: view.tableId },
    include: { columns: true, rows: true },
  });
  if (!table) return null;

  let rows = table.rows.map((r) => ({ ...r, data: { ...r.data } }));
  const filters = (view.filters as any[]) || [];
  for (const f of filters) {
    rows = rows.filter((row) => {
      const val = row.data[f.columnId];
      switch (f.operator) {
        case 'eq':
        default:
          return val === f.value;
      }
    });
  }
  const sorts = (view.sorts as any[]) || [];
  for (const s of sorts) {
    rows.sort((a, b) => {
      const va = a.data[s.columnId];
      const vb = b.data[s.columnId];
      if (va === vb) return 0;
      return s.direction === 'desc' ? (va > vb ? -1 : 1) : va > vb ? 1 : -1;
    });
  }

  for (const row of rows) {
    for (const col of table.columns) {
      if (col.type === 'formula' && col.options?.formula) {
        const expr = col.options.formula as string;
        try {
          const val = Function('row', `return ${expr}`)(row.data);
          row.data[col.id] = val;
        } catch {
          row.data[col.id] = null;
        }
      }
      if (col.type === 'linked-record') {
        const value = row.data[col.id];
        const resolve = async (ref: any) => {
          const r = await prisma.row.findUnique({ where: { id: ref.rowId } });
          return r?.data || null;
        };
        if (Array.isArray(value)) {
          row.data[col.id] = await Promise.all(value.map(resolve));
        } else if (value) {
          row.data[col.id] = await resolve(value);
        }
      }
    }
  }

  return { view, columns: table.columns, rows };
};


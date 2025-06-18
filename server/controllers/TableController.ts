import { PrismaClient } from '@prisma/client';

const parseColumn = (col: any) => ({
  ...col,
  options: col.options ? JSON.parse(col.options) : null,
});

const parseRow = (row: any) => ({
  ...row,
  data: row.data ? JSON.parse(row.data) : {},
});

const parseView = (view: any) => ({
  ...view,
  filters: view.filters ? JSON.parse(view.filters) : null,
  sorts: view.sorts ? JSON.parse(view.sorts) : null,
});

const prisma = new PrismaClient();

export const listTables = async () => {
  const tables = await prisma.table.findMany({ include: { columns: true, rows: true } });
  return tables.map((t) => ({
    ...t,
    columns: t.columns.map(parseColumn),
    rows: t.rows.map(parseRow),
  }));
};

export const createTable = (name: string) =>
  prisma.table.create({ data: { name } });

export const getTable = async (id: string) => {
  const table = await prisma.table.findUnique({
    where: { id },
    include: { columns: true, rows: true, views: true },
  });
  if (!table) return null;
  return {
    ...table,
    columns: table.columns.map(parseColumn),
    rows: table.rows.map(parseRow),
    views: table.views.map(parseView),
  };
};

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
  prisma.column
    .create({
      data: {
        tableId,
        name,
        type,
        linkedTo,
        options: options ? JSON.stringify(options) : undefined,
        order,
      },
    })
    .then(parseColumn);

export const updateColumn = (
  id: string,
  data: { name?: string; type?: string; linkedTo?: string; options?: any; order?: number }
) =>
  prisma.column
    .update({
      where: { id },
      data: {
        ...data,
        options: data.options ? JSON.stringify(data.options) : undefined,
      },
    })
    .then(parseColumn);

export const deleteColumn = (id: string) =>
  prisma.column.delete({ where: { id } });

export const createRow = (tableId: string, data: any) =>
  prisma.row
    .create({ data: { tableId, data: JSON.stringify(data) } })
    .then(parseRow);

export const updateRow = (id: string, data: any) =>
  prisma.row
    .update({ where: { id }, data: { data: JSON.stringify(data) } })
    .then(parseRow);

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
  prisma.view
    .create({
      data: {
        tableId,
        name,
        type,
        path,
        filters: filters ? JSON.stringify(filters) : undefined,
        sorts: sorts ? JSON.stringify(sorts) : undefined,
        kanbanField,
      },
    })
    .then(parseView);

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
) =>
  prisma.view
    .update({
      where: { id },
      data: {
        ...data,
        filters: data.filters ? JSON.stringify(data.filters) : undefined,
        sorts: data.sorts ? JSON.stringify(data.sorts) : undefined,
      },
    })
    .then(parseView);

export const deleteView = (id: string) => prisma.view.delete({ where: { id } });

export const listViews = (tableId: string) =>
  prisma.view
    .findMany({ where: { tableId } })
    .then((views) => views.map(parseView));

export const getViewRows = async (id: string) => {
  const viewRecord = await prisma.view.findUnique({ where: { id } });
  if (!viewRecord) return null;
  const table = await prisma.table.findUnique({
    where: { id: viewRecord.tableId },
    include: { columns: true, rows: true },
  });
  if (!table) return null;

  const view = parseView(viewRecord);
  const columns = table.columns.map(parseColumn);
  let rows = table.rows.map(parseRow);
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
    for (const col of columns) {
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

  return { view, columns, rows };
};


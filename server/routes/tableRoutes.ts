import { Router } from 'express';
import {
  listTables,
  createTable,
  getTable,
  deleteTable,
  createColumn,
  updateColumn,
  deleteColumn,
  createRow,
  updateRow,
  deleteRow,
  createView,
  updateView,
  deleteView,
  listViews,
  getViewRows,
} from '../controllers/TableController.ts';

const router = Router();

router.get('/', async (req, res) => {
  const tables = await listTables();
  res.json(tables);
});

router.get('/:id', async (req, res) => {
  const table = await getTable(req.params.id);
  if (!table) return res.status(404).end();
  res.json(table);
});

router.post('/', async (req, res) => {
  const { name } = req.body;
  const table = await createTable(name);
  res.json(table);
});

router.delete('/:id', async (req, res) => {
  await deleteTable(req.params.id);
  res.json({});
});

router.post('/:id/columns', async (req, res) => {
  const { id } = req.params;
  const { name, type, linkedTo, options, order } = req.body;
  const column = await createColumn(id, name, type, linkedTo, options, order);
  res.json(column);
});

router.put('/columns/:id', async (req, res) => {
  const column = await updateColumn(req.params.id, req.body);
  res.json(column);
});

router.delete('/columns/:id', async (req, res) => {
  await deleteColumn(req.params.id);
  res.json({});
});

router.post('/:id/rows', async (req, res) => {
  const { id } = req.params;
  const { data } = req.body;
  const row = await createRow(id, data);
  res.json(row);
});

router.get('/:id/views', async (req, res) => {
  const views = await listViews(req.params.id);
  res.json(views);
});

router.post('/:id/views', async (req, res) => {
  const { name, type, path, filters, sorts, kanbanField } = req.body;
  const view = await createView(
    req.params.id,
    name,
    type,
    path,
    filters,
    sorts,
    kanbanField
  );
  res.json(view);
});

router.get('/views/:id/rows', async (req, res) => {
  const data = await getViewRows(req.params.id);
  if (!data) return res.status(404).end();
  res.json(data);
});

router.put('/views/:id', async (req, res) => {
  const view = await updateView(req.params.id, req.body);
  res.json(view);
});

router.delete('/views/:id', async (req, res) => {
  await deleteView(req.params.id);
  res.json({});
});

router.put('/rows/:id', async (req, res) => {
  const row = await updateRow(req.params.id, req.body.data);
  res.json(row);
});

router.delete('/rows/:id', async (req, res) => {
  await deleteRow(req.params.id);
  res.json({});
});

export default router;

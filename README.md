# babytable
Basic self-hosted replacement for nocodb, airtable, etc.

## Install & Run

1. Install dependencies for both the server and client:

   ```bash
   npm install
   ```

2. Create the SQLite database and generate the Prisma client:

   ```bash
   cd server && npx prisma migrate dev --name init && cd ..
   ```

3. Start the backend and frontend together:

   ```bash
   npm start
   ```

   The Express API will run on `http://localhost:3000` and the React UI will be available on `http://localhost:5173`.


## Plan for development

### Project Intro

I'm making a minimal self-hosted database web ui airtable clone for personal use.

Frontend:
- Framework: React (i'm not anticipating millions of records)
- UI Library: Tailwind CSS + Headless UI
- State Management: React built-in state where possible; otherwise, Zustand.
- Data Grid: AG Grid

Backend:
- Language: Node.js
- API Design: REST
- Auth: none. It's for personal use only, there will only ever be one user, on an offline local network, with no need for any kind of security.

Database:
- SQLite
- Wrap it with an ORM: Prisma
Self-Hosting:
- Web Server: Simple localhost server running on the same machine the user is on (mine). Never to be deployed on scale, used only be me forever.
- Developed in a git repo so I colab with openai codex.


Phase 1 – MVP Features:
- Create multiple tables
- Add/edit/delete columns
- Add/edit/delete rows
- Add/edit/delete views
- Per view: add/edit/delete filters
- Per view: add/edit/delete sorts
- Column types: text, number, date, single-select, checkbox, formula, linked-record (linking between tables or within the same table)
- View as table
- View as kanban (sortable by any single-select field)
- Save data persistently (SQLite)
- Per table: left-hand view list. Be able to organize views into folders and sub-folders.


###  RECOMMENDED PROJECT STRUCTURE

```
/my-airtable-clone
├── /client                # React frontend
│   ├── /components        # Table editor, Kanban, column controls, etc.
│   ├── /hooks             # Zustand stores, custom hooks
│   ├── /pages             # Main views
│   ├── /styles            # Tailwind config, global styles
│   └── main.tsx           # App entry
├── /server                # Node.js backend
│   ├── /controllers       # CRUD logic per model
│   ├── /routes            # Express routes
│   ├── /prisma            # Prisma schema + generated client
│   │   ├── schema.prisma
│   ├── /utils             # Table schema generator, formula parser, etc.
│   └── index.ts           # App entry
├── /data                  # Optional SQLite backup dir or JSON exports
├── .env
├── package.json
├── prisma.sqlite          # SQLite DB file
└── README.md
```



---

### ✅ **Key Requirements for Linked Records**

1. You need a **stable identifier** that:

   * Survives table renames or row reordering.
   * Can reference rows across different tables.
2. You need to **store metadata** about the link (what table it’s from, what rows it's pointing to).
3. You need to **resolve and render linked values** for display (not just IDs).

---

#### PRISMA SCHEMA

We introduce a separate `LinkedRecord` field type for clarity, and use UUIDs or CUIDs for row identity.

```prisma
model Table {
  id        String   @id @default(cuid())
  name      String
  columns   Column[]
  rows      Row[]
}

model Column {
  id        String   @id @default(cuid())
  tableId   String
  table     Table    @relation(fields: [tableId], references: [id])
  name      String
  type      String   // e.g., "text", "number", "linked-record", etc.
  linkedTo  String?  // If type is "linked-record", this is the linked Table ID
  options   String?  // JSON string for other column types
  order     Int
}

model Row {
  id        String   @id @default(cuid()) // This is the universal identifier
  tableId   String
  table     Table    @relation(fields: [tableId], references: [id])
  data      String   // JSON string: columnId → value
}
```

### LINKED RECORD DATA FORMAT (in `Row.data`)

Here’s how a row might store a linked record reference:

```json
{
  "status": "Done",
  "project": {
    "tableId": "tbl_projects",
    "rowId": "row_xyz123"
  },
  "tags": [
    { "tableId": "tbl_tags", "rowId": "row_tag1" },
    { "tableId": "tbl_tags", "rowId": "row_tag2" }
  ]
}
```

Or for single-table links, like self-referencing rows:

```json
{
  "parentTask": { "tableId": "tbl_tasks", "rowId": "row_abc789" }
}
```


### CLIENT-SIDE: Rendering Linked Records

When rendering:

1. Look up the `tableId` in your Zustand/React state to find the table.
2. Look up the `rowId` inside that table’s row list.
3. Optionally, allow a "display column" setting for each table (e.g., use `name` instead of raw row ID).

### Formulas

* Use a simple parser like [mathjs](https://mathjs.org/) or implement a basic `eval`-based expression evaluator for MVP
* Later: support references like `row["Amount"] * row["Price"]`

### **Dynamic Table View**

* Use AG Grid’s column definition feature to map columns dynamically
* Watch column definitions via Zust and and reload grid accordingly

### **Kanban View**

* Filter data by selected single-select column (e.g., “Status”)
* Use sortable drag/drop libs like `@dnd-kit/core` or `react-beautiful-dnd`


### DEV TIP: PRISMA + ZOD

Use Prisma’s [zod generator](https://github.com/ivanhofer/prisma-zod-generator) to validate incoming data or even generate types for each column dynamically.

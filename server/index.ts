import express from 'express';
import cors from 'cors';
import tableRoutes from './routes/tableRoutes.ts';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/tables', tableRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));


import express from 'express';
import routes from './routes';
import cors from 'cors';

const app = express();
const PORT: number = 3000;

app.use(cors());

app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

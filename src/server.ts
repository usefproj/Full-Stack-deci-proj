import express from 'express';
import routes from './routes';

const app = express();
const PORT: number = 3000;

app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

import express, { Application, Request, Response } from 'express';
import './db';
// import path from 'path';
// import { fileURLToPath } from 'url';

const app: Application = express();
// const __filename: string = fileURLToPath(import.meta.url);
// const __dirname: string = path.dirname(__filename);
const port = process.env.PORT || 3001;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.listen(port, () => console.log(`⚡ Express is listening at http://localhost:${port}⚡`));

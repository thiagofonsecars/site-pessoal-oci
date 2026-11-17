'use strict';

const express = require('express');
const fs = require('node:fs/promises');
const path = require('node:path');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';
const postsFile = path.join(__dirname, 'data', 'posts.json');

app.disable('x-powered-by');
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

app.get('/api/posts', async (_req, res, next) => {
  try {
    const content = await fs.readFile(postsFile, 'utf8');
    res.set('Cache-Control', 'no-store').json(JSON.parse(content));
  } catch (error) {
    next(error);
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'thiago-site-pessoal' });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Não foi possível carregar o conteúdo.' });
});

app.listen(PORT, HOST, () => {
  console.log(`Site ativo em http://${HOST}:${PORT}`);
});

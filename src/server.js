const { createApp } = require('./app');

const PORT = 3000;

const app = createApp();

app.listen(PORT, () => {
  console.log(`Serwer działa na http://localhost:${PORT}`);
});

const config = require('./config');
const { createApp } = require('./app');

const app = createApp();

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});

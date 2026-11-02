const config = require('./src/config');
const app = require('./src/app');

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});
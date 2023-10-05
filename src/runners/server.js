require('dotenv')
  .config({ path: `${__dirname}/../../.env` });
const di = require('../di');
const app = require('../app');

const server = app(di);
(async () => {
  try {
    await server.listen({
      port: process.env.APP_PORT,
    });
    console.log(`server started on ${process.env.APP_PORT}`);
  } catch (err) {
    console.error(err);
  }
})();

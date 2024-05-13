import { defineConfig } from 'cypress';
import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { Client } from 'pg';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__dirname),
    setupNodeEvents(on) {
      on('task', {
        async queryDb(queryString) {
          const client = new Client({
            user: 'user',
            password: 'admin',
            host: '127.0.0.1',
            database: 'dfcomps',
            ssl: false,
            port: 5432,
          });

          await client.connect();

          const res = await client.query(queryString);

          await client.end();

          return res.rows;
        },
      });
    },
  },
});

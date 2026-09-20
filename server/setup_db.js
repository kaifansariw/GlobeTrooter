const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

(async () => {
  try {
    const appClient = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    await appClient.connect();
    console.log('✅ Connected to globetrotter database');

    const schemaSql = fs.readFileSync(path.join(__dirname, 'src', 'db', 'schema.sql'), 'utf8');
    await appClient.query(schemaSql);
    console.log('✅ Executed schema.sql successfully');

    // Generate valid hash for password123
    const realHash = await bcrypt.hash('password123', 12);
    await appClient.query('UPDATE users SET password_hash = $1', [realHash]);
    console.log('✅ Updated users password_hash to valid hash for "password123"');

    const users = await appClient.query('SELECT id, first_name, email, is_admin FROM users');
    console.log('👥 Available users:', users.rows);

    await appClient.end();
    console.log('🎉 Setup complete!');
  } catch (err) {
    console.error('❌ Error during DB setup:', err);
    process.exit(1);
  }
})();

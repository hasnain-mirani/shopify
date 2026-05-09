const Database = require('better-sqlite3');
const db = new Database('./backend/database.sqlite');
const tokens = db.prepare('SELECT * FROM fcm_tokens').all();
console.log(JSON.stringify(tokens, null, 2));

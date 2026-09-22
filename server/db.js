/** DB access module **/

import sqlite3 from "sqlite3";

// Apertura del database
const db = new sqlite3.Database('db.db', (err) => {
    if (err) throw err;
});

export default db;
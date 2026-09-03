const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js').default;

const dbPath = path.join(__dirname, 'data', 'alerts.db');
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

let SQL;
let db;
let ready;

function persist() {
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
}

function initSchema() {
    db.run(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        event_date TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS suspensions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        province TEXT NOT NULL,
        municipality TEXT NOT NULL,
        level TEXT NOT NULL,
        modality TEXT,
        until_date TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS status (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        parameter TEXT NOT NULL,
        current_status TEXT NOT NULL,
        impact TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0
      );
    `);
    persist();
}

ready = (async () => {
    SQL = await initSqlJs();
    if (fs.existsSync(dbPath)) {
        const fileBuffer = fs.readFileSync(dbPath);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }
    initSchema();
    return true;
})();

function all(sql, params = []) {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
}

function get(sql, params = []) {
    const rows = all(sql, params);
    return rows[0];
}

function run(sql, params = []) {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    stmt.step();
    const lastId = db.exec('SELECT last_insert_rowid() AS id')[0].values[0][0];
    stmt.free();
    persist();
    return { lastInsertRowid: lastId };
}

module.exports = { all, get, run, ready };
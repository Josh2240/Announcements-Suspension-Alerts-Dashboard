const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Routes: Server-rendered pages ----------

app.get('/', (req, res) => {
    const announcement = db.get('SELECT * FROM announcements ORDER BY id DESC LIMIT 1');
    const suspensions = db.all('SELECT * FROM suspensions ORDER BY province, municipality');
    const status = db.all('SELECT * FROM status ORDER BY id');
    const tips = db.all('SELECT * FROM tips ORDER BY sort_order');

    res.render('dashboard', {
        announcement,
        suspensions,
        status,
        tips,
        now: new Date()
    });
});

// ---------- Routes: REST API ----------

app.get('/api/suspensions', (req, res) => {
    const { province, q } = req.query;
    let sql = 'SELECT * FROM suspensions WHERE 1=1';
    const params = [];
    if (province && province !== 'all') {
        sql += ' AND province = ?';
        params.push(province);
    }
    if (q) {
        sql += ' AND (municipality LIKE ? OR level LIKE ? OR modality LIKE ?)';
        const like = `%${q}%`;
        params.push(like, like, like);
    }
    sql += ' ORDER BY province, municipality';
    res.json(db.all(sql, params));
});

app.post('/api/suspensions', (req, res) => {
    const { province, municipality, level, modality, until_date } = req.body || {};
    if (!province || !municipality || !level) {
        return res.status(400).json({ error: 'province, municipality and level are required' });
    }
    const info = db.run(
        'INSERT INTO suspensions (province, municipality, level, modality, until_date) VALUES (?, ?, ?, ?, ?)',
        [province, municipality, level, modality || null, until_date || null]
    );
    res.status(201).json(db.get('SELECT * FROM suspensions WHERE id = ?', [info.lastInsertRowid]));
});

app.delete('/api/suspensions/:id', (req, res) => {
    const before = db.get('SELECT id FROM suspensions WHERE id = ?', [req.params.id]);
    if (!before) return res.status(404).json({ error: 'Not found' });
    db.run('DELETE FROM suspensions WHERE id = ?', [req.params.id]);
    res.json({ deleted: true });
});

app.get('/api/status', (req, res) => {
    res.json(db.all('SELECT * FROM status ORDER BY id'));
});

app.get('/api/tips', (req, res) => {
    res.json(db.all('SELECT * FROM tips ORDER BY sort_order'));
});

app.get('/api/announcement', (req, res) => {
    res.json(db.get('SELECT * FROM announcements ORDER BY id DESC LIMIT 1'));
});

// ---------- Start ----------

app.listen(PORT, () => {
    console.log(`Announcements & Suspension Alerts Dashboard running at http://localhost:${PORT}`);
});
db.ready.then(() => console.log('Database initialized.'));
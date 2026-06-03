const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// CONFIGURACIÓN DE CORS REFORZADA
app.use(cors({
    origin: "http://localhost:5173", // Permite peticiones desde tu React
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true
}));

app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234', // Verifica que sea tu contraseña
    database: 'sigcot_db'
});

db.connect(err => {
    if (err) {
        console.error('❌ ERROR CRÍTICO MySQL:', err.message);
    } else {
        console.log('✅ CONECTADO EXITOSAMENTE A MYSQL: sigcot_db');
    }
});

// ENDPOINTS
app.get('/api/buses', (req, res) => {
    db.query('SELECT * FROM buses', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.get('/api/personal', (req, res) => {
    db.query('SELECT * FROM personal', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.get('/api/alertas', (req, res) => {
    db.query('SELECT * FROM alertas ORDER BY fecha DESC', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.delete('/api/alertas/:id', (req, res) => {
    db.query('DELETE FROM alertas WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true });
    });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 SERVIDOR API CORRIENDO EN: http://localhost:${PORT}`);
});
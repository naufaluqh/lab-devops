require('dotenv').config(); // 🚀 AKTIFKAN DETEKSI FILE .ENV
const express = require('express');
const { Pool } = require('pg');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔒 KODE AMAN: MENGMANDATKAN DATA DARI VARIABEL LINGKUNGAN
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || "5432")
});


// Middleware logger for transparency
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} request received at: ${req.url}`);
    next();
});

// Endpoint to render HTML interface dynamically
app.get('/', async (req, res) => {
    try {
        // Create table if not exists in app-database
        await pool.query(`
            CREATE TABLE IF NOT EXISTS devops_logs (
                id SERIAL PRIMARY KEY,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Fetch all stored data from database
        const result = await pool.query('SELECT * FROM devops_logs ORDER BY created_at DESC');
        
        // Build interactive visual interface string
        let rowsHtml = result.rows.map(row => 
            `<li><strong>[${row.created_at.toLocaleTimeString()}]</strong> ${row.content}</li>`
        ).join('');

        let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>DevOps Volume Persistence Test</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; background-color: #f4f6f9; }
                .card { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto; }
                h2 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
                input[type="text"] { width: 75%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; }
                button { padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
                button:hover { background-color: #0056b3; }
                ul { list-style-type: none; padding: 0; }
                li { background: #e9ecef; padding: 10px; margin-bottom: 8px; border-radius: 4px; border-left: 4px solid #28a745; }
            </style>
        </head>
        <body>
            <div class="card">
                <h2>🚀 DevOps Persistence Automation Lab</h2>
                <p>Status Database: <strong>CONNECTED TO POSTGRES</strong></p>
                
                <form action="/add-data" method="POST">
                    <input type="text" name="logContent" placeholder="Ketik data eksperimen di sini..." required>
                    <button type="submit">Simpan Data</button>
                </form>

                <h3>📊 Data Tersegmentasi di PostgreSQL Volume:</h3>
                <ul>${rowsHtml || '<li>Belum ada data di dalam brankas volume.</li>'}</ul>
            </div>
        </body>
        </html>
        `;
        res.status(200).send(html);
    } catch (err) {
        console.error(err);
        res.status(500).send("Database Integration Connection Error: " + err.message);
    }
});

// Endpoint to receive post submission from visual interface form
app.post('/add-data', async (req, res) => {
    const { logContent } = req.body;
    try {
        await pool.query('INSERT INTO devops_logs (content) VALUES (\$1)', [logContent]);
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to save data: " + err.message);
    }
});

module.exports = app;


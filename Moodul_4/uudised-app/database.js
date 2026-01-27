// database.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'uudised',
  waitForConnections: true,
  connectionLimit: 10,
});

async function getNews() {
  const [rows] = await pool.query('SELECT id, title FROM news ORDER BY id DESC');
  return rows;
}

async function getNewsById(id) {
  const [rows] = await pool.query('SELECT id, title, content FROM news WHERE id = ?', [id]);
  return rows[0]; // undefined если не найдено
}

async function createNews(title, content) {
  const [result] = await pool.execute(
    'INSERT INTO news (title, content) VALUES (?, ?)',
    [title, content]
  );
  return result.affectedRows > 0;
}

async function updateNews(id, title, content) {
  const [result] = await pool.execute(
    'UPDATE news SET title = ?, content = ? WHERE id = ?',
    [title, content, id]
  );
  return result.affectedRows > 0;
}

async function deleteNews(id) {
  const [result] = await pool.query('DELETE FROM news WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
};

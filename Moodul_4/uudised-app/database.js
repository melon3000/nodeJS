const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // <-- поставь пароль если есть
  database: 'uudised',
  waitForConnections: true,
  connectionLimit: 10,
});

// NEWS (public list)
async function getNews() {
  const [rows] = await pool.query(`
    SELECT n.id, n.title, n.created_at, u.username
    FROM news n
    LEFT JOIN users u ON u.id = n.user_id
    ORDER BY n.id DESC
  `);
  return rows;
}

async function getNewsById(id) {
  const [rows] = await pool.query(
    `
    SELECT n.id, n.title, n.content, n.created_at, n.user_id, u.username
    FROM news n
    LEFT JOIN users u ON u.id = n.user_id
    WHERE n.id = ?
    `,
    [id]
  );
  return rows[0];
}

async function createNews(title, content, userId) {
  const [result] = await pool.execute(
    'INSERT INTO news (title, content, user_id) VALUES (?, ?, ?)',
    [title, content, userId]
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

// ADMIN: list all with sorting
async function getAllNewsAdmin(sort = 'created_at', dir = 'desc') {
  const allowedSort = {
    username: 'u.username',
    title: 'n.title',
    content: 'n.content',
    created_at: 'n.created_at',
  };

  const sortCol = allowedSort[sort] || allowedSort.created_at;
  const sortDir = String(dir).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const [rows] = await pool.query(
    `
    SELECT n.id, n.title, n.content, n.created_at, n.user_id, u.username
    FROM news n
    LEFT JOIN users u ON u.id = n.user_id
    ORDER BY ${sortCol} ${sortDir}, n.id DESC
    `
  );
  return rows;
}

// USERS
async function getUserByUsername(username) {
  const [rows] = await pool.query(
    'SELECT id, username, password_hash FROM users WHERE username = ?',
    [username]
  );
  return rows[0];
}

async function createUser(username, passwordHash) {
  const [result] = await pool.execute(
    'INSERT INTO users (username, password_hash) VALUES (?, ?)',
    [username, passwordHash]
  );
  return result.affectedRows > 0;
}

module.exports = {
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  getAllNewsAdmin,
  getUserByUsername,
  createUser,
};

const express = require('express');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors'); // Подключаем CORS
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Разрешаем все домены (для тестирования)
app.use(cors());

// Подключение к базе данных SQLite
const db = new sqlite3.Database('./database.db');

// Создание таблицы для пользователей
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip TEXT,
      userAgent TEXT,
      name TEXT,
      lastName TEXT,
      middleName TEXT,
      mathType TEXT,
      subjects TEXT,
      results TEXT
    )
  `);
});

app.use(bodyParser.json());

// Обслуживание статических файлов (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Маршрут для получения IP-адреса и User-Agent через прокси
app.get('/get-ip', (req, res) => {
  try {
    // Получаем IP-адрес из заголовков X-Forwarded-For или напрямую из req.ip
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Очищаем IP-адрес от лишних данных (например, "::ffff:")
    const cleanIp = ip.split(',')[0].replace('::ffff:', '');

    // Получаем User-Agent
    const userAgent = req.headers['user-agent'] || 'Unknown';

    res.json({ ip: cleanIp, userAgent });
  } catch (error) {
    console.error('Ошибка при получении IP:', error.message);
    res.status(500).json({ error: 'Не удалось получить IP-адрес' });
  }
});

// Маршрут для регистрации нового пользователя
app.post('/register', (req, res) => {
  const { ip, userAgent, name, lastName, middleName, mathType, subjects, results } = req.body;

  db.run(
    'INSERT INTO users (ip, userAgent, name, lastName, middleName, mathType, subjects, results) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [ip, userAgent, name, lastName, middleName, mathType, JSON.stringify(subjects), JSON.stringify(results)],
    function (err) {
      if (err) {
        console.error('Ошибка при сохранении данных:', err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'User registered successfully' });
    }
  );
});

// Маршрут для обновления результатов пользователя
app.put('/update-results/:ip', (req, res) => {
  const ip = req.params.ip;
  const { results } = req.body;

  db.run('UPDATE users SET results = ? WHERE ip = ?', [JSON.stringify(results), ip], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Results updated successfully' });
  });
});

// Маршрут для удаления пользователя
app.delete('/delete-user/:ip', (req, res) => {
  const ip = req.params.ip;

  db.run('DELETE FROM users WHERE ip = ?', [ip], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'User deleted successfully' });
  });
});

// Маршрут для получения списка всех пользователей
app.get('/users', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Маршрут для получения результатов пользователя по IP
app.get('/results/:ip', (req, res) => {
  const ip = req.params.ip;

  db.get('SELECT * FROM users WHERE ip = ?', [ip], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });
});

// Корневой маршрут
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
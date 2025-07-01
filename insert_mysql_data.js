import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

(async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  await connection.execute(
    'INSERT INTO Files (filename, originalname, mimetype, size, path, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      'test.txt',
      'test.txt',
      'text/plain',
      18,
      'uploads/test.txt',
      new Date(),
      new Date()
    ]
  );

  console.log('Test data inserted successfully.');
  await connection.end();
})();

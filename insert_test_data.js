import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./development.sqlite');
db.run('INSERT INTO Files (filename, originalname, mimetype, size, path, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)', [
  'test.txt',
  'test.txt',
  'text/plain',
  18,
  'uploads/test.txt',
  new Date(),
  new Date()
], function(err) {
  if (err) {
    return console.error(err.message);
  }
  console.log(`A row has been inserted with rowid ${this.lastID}`);
});
db.close();
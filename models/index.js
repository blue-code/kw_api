import sequelize from '../config/database.js';
import { Item } from './Item.js';
import File from './File.js';

const db = {};

db.sequelize = sequelize;
db.Item = Item;
db.File = File;

// Define associations here if any

// Synchronize models with the database
// In a production environment, you might use migrations instead of `sync({ force: true })`
// For development, `sync()` without `force: true` is often sufficient after initial setup
// db.sequelize.sync({ force: true }).then(() => {
//   console.log('Database & tables created!');
// });

export default db;

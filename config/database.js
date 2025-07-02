import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: (sql, queryObject) => {
      console.log(sql);
      if (queryObject && queryObject.bind) {
        console.log('Parameters: ', queryObject.bind);
      }
    },
    dialectOptions: {
      charset: 'utf8mb4',
    },
  }
);

export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('데이터베이스 연결 성공.');
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error);
  }
};

export default sequelize;

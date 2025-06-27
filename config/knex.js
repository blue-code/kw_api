import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config(); // .env 파일에서 환경변수 로드

const knexConfig = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  pool: {
    min: 2,
    max: 10,
    afterCreate: (conn, done) => {
      // 연결 생성 후 실행할 작업 (예: 타임존 설정)
      // conn.query('SET time_zone = "Asia/Seoul";', (err) => {
      //   done(err, conn);
      // });
      // 여기서는 특별한 작업 없이 바로 done 호출
      done(null, conn);
    }
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: '../migrations' // 마이그레이션 파일이 위치할 디렉토리 (프로젝트 루트 기준)
  },
  seeds: {
    directory: '../seeds' // 시드 파일이 위치할 디렉토리 (프로젝트 루트 기준)
  }
};

// 개발 환경, 테스트 환경, 프로덕션 환경에 따라 다른 설정을 사용할 수 있습니다.
// 예: const environment = process.env.NODE_ENV || 'development';
// const config = knexConfig[environment];
// export default knex(config);

const db = knex(knexConfig);

export default db;

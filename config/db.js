import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config(); // .env 파일에서 환경 변수 로드

const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'test_db',
  port: process.env.MYSQL_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10, // 동시에 유지할 수 있는 최대 연결 수
  queueLimit: 0, // 연결 풀이 가득 찼을 때 대기열에 추가할 수 있는 최대 요청 수 (0은 무제한)
};

// 연결 풀 생성
const pool = mysql.createPool(dbConfig);

// 연결 테스트 함수 (선택 사항)
export const testConnection = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('MySQL 데이터베이스에 성공적으로 연결되었습니다.');
    return true;
  } catch (error) {
    console.error('MySQL 데이터베이스 연결 실패:', error);
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('데이터베이스 연결이 끊어졌습니다.');
    }
    if (error.code === 'ER_CON_COUNT_ERROR') {
      console.error('데이터베이스에 너무 많은 연결이 있습니다.');
    }
    if (error.code === 'ECONNREFUSED') {
      console.error('데이터베이스 연결이 거부되었습니다. DB 서버가 실행 중인지, 방화벽 설정을 확인하세요.');
    }
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('데이터베이스 접근이 거부되었습니다. 사용자 이름 또는 비밀번호를 확인하세요.');
    }
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('존재하지 않는 데이터베이스입니다. MYSQL_DATABASE 환경 변수를 확인하세요.');
    }
    return false;
  } finally {
    if (connection) {
      connection.release(); // 연결 반환
    }
  }
};

// 애플리케이션 시작 시 연결 테스트 실행 (선택 사항)
// testConnection();

export default pool;

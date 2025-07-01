import express from 'express';
import https from 'https';
import fs from 'fs';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize, { testConnection } from './config/database.js';
// import { testConnection } from './config/db.js'; // 더 이상 사용하지 않음

import logger from './config/logger.js';

dotenv.config();

// 데이터베이스 연결 테스트
testConnection();
logger.info('Logger initialized and working.');

const app = express();
const port = process.env.PORT || 3001; // HTTPS 기본 포트는 443이지만, 개발 편의상 다른 포트 사용

// CORS 설정
app.use(cors()); // 모든 도메인에서의 요청을 허용 (개발 중에는 편리하나, 프로덕션에서는 특정 도메인만 허용하도록 수정 필요)

// JSON 요청 본문 파싱
app.use(express.json());

import authRoutes from './routes/authRoutes.js';
import testRoutes from './routes/testRoutes.js';
import itemRoutes from './routes/itemRoutes.js'; // 아이템 라우터 추가
import fileRoutes from './routes/fileRoutes.js'; // 파일 라우터 추가

// 간단한 루트 응답
app.get('/', (req, res) => {
  res.send('API 서버가 실행 중입니다. (HTTPS)');
});

// 라우터 등록
app.use('/auth', authRoutes);
app.use('/test', testRoutes);
app.use('/items', itemRoutes); // 아이템 라우터 등록
app.use('/files', fileRoutes); // 파일 라우터 등록

import errorHandler from './middleware/errorHandler.js';

// 404 핸들러
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// 중앙 오류 처리 미들웨어
app.use(errorHandler);

// HTTPS 서버 설정 (개발용 자체 서명 인증서 필요)
// TODO: 실제 운영 환경에서는 정식 SSL 인증서를 사용해야 합니다.
// 개발용 인증서 파일 (key.pem, cert.pem)이 프로젝트 루트에 있다고 가정합니다.
try {
  const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
  };

  https.createServer(options, app).listen(port, () => {
    logger.info(`HTTPS 서버가 https://localhost:${port} 에서 실행 중입니다.`);
  });
} catch (error) {
  logger.error('HTTPS 서버를 시작하지 못했습니다. key.pem 또는 cert.pem 파일이 있는지 확인하세요.', error);
  logger.error('개발용 자체 서명 인증서 생성 방법:');
  logger.error('openssl genrsa -out key.pem 2048');
  logger.error('openssl req -new -key key.pem -out csr.pem');
  logger.error('openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out cert.pem');
  logger.info('\nHTTP 서버를 대신 시작합니다 (테스트용).');
  app.listen(port, () => {
    logger.info(`HTTP 서버가 http://localhost:${port} 에서 실행 중입니다.`);
  });
}

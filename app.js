import express from 'express';
import https from 'https';
import fs from 'fs';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001; // HTTPS 기본 포트는 443이지만, 개발 편의상 다른 포트 사용

// CORS 설정
app.use(cors()); // 모든 도메인에서의 요청을 허용 (개발 중에는 편리하나, 프로덕션에서는 특정 도메인만 허용하도록 수정 필요)

// JSON 요청 본문 파싱
app.use(express.json());

import authRoutes from './routes/authRoutes.js';
import testRoutes from './routes/testRoutes.js';

// 간단한 루트 응답
app.get('/', (req, res) => {
  res.send('API 서버가 실행 중입니다. (HTTPS)');
});

// 라우터 등록
app.use('/auth', authRoutes);
app.use('/test', testRoutes);

// 404 핸들러
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// 기본 오류 처리 미들웨어
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// HTTPS 서버 설정 (개발용 자체 서명 인증서 필요)
// TODO: 실제 운영 환경에서는 정식 SSL 인증서를 사용해야 합니다.
// 개발용 인증서 파일 (key.pem, cert.pem)이 프로젝트 루트에 있다고 가정합니다.
try {
  const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
  };

  https.createServer(options, app).listen(port, () => {
    console.log(`HTTPS 서버가 https://localhost:${port} 에서 실행 중입니다.`);
  });
} catch (error) {
  console.error('HTTPS 서버를 시작하지 못했습니다. key.pem 또는 cert.pem 파일이 있는지 확인하세요.');
  console.error('개발용 자체 서명 인증서 생성 방법:');
  console.error('openssl genrsa -out key.pem 2048');
  console.error('openssl req -new -key key.pem -out csr.pem');
  console.error('openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out cert.pem');
  console.log('\nHTTP 서버를 대신 시작합니다 (테스트용).');
  app.listen(port, () => {
    console.log(`HTTP 서버가 http://localhost:${port} 에서 실행 중입니다.`);
  });
}

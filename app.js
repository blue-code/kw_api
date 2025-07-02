// Node.js 환경에서 웹 애플리케이션 프레임워크인 Express를 가져옵니다.
// Java의 Spring 프레임워크와 유사한 역할을 합니다.
import express from 'express';
// HTTPS 프로토콜을 사용하기 위한 모듈입니다.
import https from 'https';
// 파일 시스템 작업을 위한 모듈입니다. (파일 읽기, 쓰기 등)
import fs from 'fs';
// CORS(Cross-Origin Resource Sharing)를 활성화하기 위한 미들웨어입니다.
// 다른 도메인에서의 요청을 허용하도록 설정합니다.
import cors from 'cors';
// .env 파일에서 환경 변수를 로드하기 위한 모듈입니다.
// Java의 properties 파일과 유사한 역할을 합니다.
import dotenv from 'dotenv';
// Sequelize ORM과 데이터베이스 연결 테스트 함수를 가져옵니다.
// Sequelize는 Java의 JPA/Hibernate와 유사한 ORM(Object-Relational Mapping) 도구입니다.
import sequelize, { testConnection } from './config/database.js';
// import { testConnection } from './config/db.js'; // 더 이상 사용하지 않음

// 로깅을 위한 Winston 로거를 가져옵니다.
// Java의 Log4j나 SLF4j와 유사한 역할을 합니다.
import logger from './config/logger.js';

// .env 파일에 정의된 환경 변수를 로드합니다.
// process.env 객체를 통해 환경 변수에 접근할 수 있게 됩니다.
dotenv.config();

// 애플리케이션 시작 시 데이터베이스 연결을 테스트합니다.
testConnection();
logger.info('Logger initialized and working.'); // 로거가 정상적으로 초기화되었음을 기록합니다.

// Express 애플리케이션 인스턴스를 생성합니다.
// Java Spring의 ApplicationContext와 유사하게 애플리케이션의 핵심 객체입니다.
const app = express();
// 환경 변수에서 포트 번호를 가져오거나, 없을 경우 기본값으로 3001을 사용합니다.
// HTTPS의 기본 포트는 443이지만, 개발 편의상 다른 포트를 사용할 수 있습니다.
const port = process.env.PORT || 3001;

// CORS 미들웨어를 애플리케이션에 적용합니다.
// app.use()는 Express에서 미들웨어를 추가하는 메서드입니다.
// cors()를 호출하면 모든 도메인에서의 요청을 허용하는 기본 설정이 적용됩니다.
// 개발 중에는 편리하지만, 프로덕션 환경에서는 보안을 위해 특정 도메인만 허용하도록 수정해야 합니다.
// 예: app.use(cors({ origin: 'https://yourdomain.com' }));
app.use(cors());

// 들어오는 요청의 본문(body)을 JSON 형식으로 파싱하기 위한 미들웨어입니다.
// 이 미들웨어를 사용하면 req.body 객체를 통해 JSON 데이터를 쉽게 접근할 수 있습니다.
// Java Spring의 @RequestBody 어노테이션과 유사한 기능을 제공합니다.
app.use(express.json());

// 각 기능별 라우트(경로) 정의 파일을 가져옵니다.
// Java Spring의 @Controller나 @RestController 클래스와 유사하게 URL 경로와 해당 경로를 처리할 로직을 매핑합니다.
import authRoutes from './routes/authRoutes.js'; // 인증 관련 라우트
import testRoutes from './routes/testRoutes.js'; // 테스트용 라우트
import itemRoutes from './routes/itemRoutes.js'; // 아이템 관련 라우트
import fileRoutes from './routes/fileRoutes.js'; // 파일 관련 라우트

// 루트 경로('/')에 대한 GET 요청을 처리하는 간단한 핸들러입니다.
// 사용자가 웹 브라우저나 API 클라이언트로 서버의 기본 주소에 접속했을 때 응답합니다.
app.get('/', (req, res) => {
  // req: 요청(request) 객체, 클라이언트로부터 온 정보를 담고 있습니다.
  // res: 응답(response) 객체, 클라이언트에게 보낼 정보를 설정합니다.
  res.send('API 서버가 실행 중입니다. (HTTPS)'); // 간단한 텍스트 메시지를 응답으로 보냅니다.
});

// 특정 경로 접두사(prefix)에 따라 라우터를 등록합니다.
// 예를 들어, '/auth'로 시작하는 모든 요청은 authRoutes에서 처리됩니다.
// Java Spring의 @RequestMapping("/auth")와 유사합니다.
app.use('/auth', authRoutes);
app.use('/test', testRoutes);
app.use('/items', itemRoutes);
app.use('/files', fileRoutes);

// 오류 처리를 위한 커스텀 미들웨어를 가져옵니다.
import errorHandler from './middleware/errorHandler.js';

// 등록된 라우트 중에서 일치하는 경로가 없을 경우 처리하는 404 핸들러입니다.
// 이 미들웨어는 다른 모든 라우트와 미들웨어 뒤에 위치해야 합니다.
app.use((req, res, next) => {
  // next: 다음 미들웨어 함수를 호출하는 콜백 함수입니다. 여기서는 사용되지 않습니다.
  res.status(404).json({ message: 'Not Found' }); // 404 상태 코드와 함께 JSON 응답을 보냅니다.
});

// 중앙 집중식 오류 처리 미들웨어입니다.
// 애플리케이션 전역에서 발생하는 오류를 일관된 방식으로 처리합니다.
// 이 미들웨어는 일반적으로 모든 미들웨어와 라우트 핸들러의 가장 마지막에 등록합니다.
// Java Spring의 @ControllerAdvice나 HandlerExceptionResolver와 유사한 역할을 합니다.
app.use(errorHandler);

// HTTPS 서버를 설정하고 시작합니다.
// Node.js에서는 http 모듈 또는 https 모듈을 사용하여 서버를 직접 생성하고 실행합니다.
// TODO: 실제 운영 환경에서는 공인된 기관에서 발급받은 정식 SSL 인증서를 사용해야 합니다.
// 아래 코드는 개발용으로 자체 서명된 인증서(self-signed certificate)를 사용하는 예시입니다.
// 'key.pem' (개인 키)과 'cert.pem' (공개 인증서) 파일이 프로젝트 루트 디렉토리에 있어야 합니다.
try {
  const options = {
    // SSL/TLS 연결에 필요한 개인 키와 인증서를 파일에서 읽어옵니다.
    key: fs.readFileSync('key.pem'), // 동기적으로 파일 읽기
    cert: fs.readFileSync('cert.pem'), // 동기적으로 파일 읽기
  };

  // https.createServer()를 사용하여 HTTPS 서버 인스턴스를 생성합니다.
  // 첫 번째 인자로 SSL 옵션 객체를, 두 번째 인자로 Express 애플리케이션 객체를 전달합니다.
  // .listen() 메서드로 특정 포트에서 들어오는 연결을 수신 대기합니다.
  https.createServer(options, app).listen(port, () => {
    logger.info(`HTTPS 서버가 https://localhost:${port} 에서 실행 중입니다.`);
  });
} catch (error) {
  // 인증서 파일을 찾을 수 없거나 다른 오류가 발생하면 HTTPS 서버 시작에 실패합니다.
  logger.error('HTTPS 서버를 시작하지 못했습니다. key.pem 또는 cert.pem 파일이 있는지 확인하세요.', error);
  logger.error('개발용 자체 서명 인증서 생성 방법 (터미널에서 실행):');
  logger.error('  openssl genrsa -out key.pem 2048'); // 개인 키 생성
  logger.error('  openssl req -new -key key.pem -out csr.pem'); // 인증서 서명 요청(CSR) 생성
  logger.error('  openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out cert.pem'); // 자체 서명 인증서 생성
  logger.info('\nHTTP 서버를 대신 시작합니다 (테스트 및 개발용).');
  // HTTPS 설정에 실패한 경우, 개발 편의를 위해 HTTP 서버로 대체 실행합니다.
  // 프로덕션 환경에서는 HTTPS를 강제해야 합니다.
  app.listen(port, () => {
    logger.info(`HTTP 서버가 http://localhost:${port} 에서 실행 중입니다.`);
  });
}

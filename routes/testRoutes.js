// Express 프레임워크를 가져옵니다.
import express from 'express';
// 테스트 관련 컨트롤러 함수들을 가져옵니다.
import { getTestData, handleKoreanInput } from '../controllers/testController.js';
// JWT 토큰을 검증하는 미들웨어를 가져옵니다.
import { verifyToken } from '../middleware/authMiddleware.js';

// Express의 Router 객체를 생성합니다.
// 이 파일에서 정의된 라우트들은 app.js에서 '/test' 접두사로 등록됩니다.
const router = express.Router();

// HTTP GET 요청을 '/test' 경로로 보낼 때 실행될 핸들러를 정의합니다.
// 이 경로는 보호된 리소스에 접근하는 예시로, verifyToken 미들웨어를 통과해야 합니다.
// 즉, 요청 헤더에 유효한 JWT가 포함되어 있어야 getTestData 컨트롤러 함수가 실행됩니다.
// Java Spring Security에서 특정 URL에 대해 'isAuthenticated()'와 같은 접근 규칙을 설정하는 것과 유사합니다.
router.get('/', verifyToken, getTestData);

// HTTP POST 요청을 '/test/korean-test' 경로로 보낼 때 실행될 핸들러를 정의합니다.
// 이 경로는 서버가 한글 입력을 올바르게 처리하는지 테스트하기 위한 엔드포인트입니다.
// 클라이언트가 요청 본문에 한글 데이터를 포함하여 보내면, handleKoreanInput 컨트롤러 함수가 이를 처리합니다.
// 이 경로는 별도의 인증 미들웨어를 사용하지 않으므로, 토큰 없이도 접근 가능합니다.
router.post('/korean-test', handleKoreanInput);

// 설정된 라우터 객체를 모듈 외부로 내보냅니다.
export default router;

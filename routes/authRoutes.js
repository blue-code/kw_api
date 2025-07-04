// Express 프레임워크를 가져옵니다.
import express from 'express';
// 인증 관련 컨트롤러 함수들을 가져옵니다.
// Java의 @Controller 클래스 내의 메소드들과 유사한 역할을 합니다.
import { login, validateToken, getServiceToken } from '../controllers/authController.js';
import { verifyApiKey } from '../middleware/authMiddleware.js';

// Express의 Router 객체를 생성합니다.
// 라우터는 특정 경로에 대한 요청을 처리하는 미들웨어 및 HTTP 메소드 핸들러의 집합입니다.
// Java Spring의 @RequestMapping 어노테이션이 붙은 컨트롤러 클래스와 유사하게,
// 특정 기본 경로(prefix)를 공유하는 라우트들을 그룹화하는 데 사용됩니다.
// 이 파일에서 정의된 라우트들은 app.js에서 '/auth' 접두사로 등록됩니다.
const router = express.Router();

// HTTP POST 요청을 '/auth/token' 경로로 보낼 때 실행될 핸들러를 정의합니다.
// 이 경로는 사용자 로그인을 처리하고 JWT(JSON Web Token)를 생성하는 데 사용됩니다.
// login 함수는 authController.js 파일에 정의된 컨트롤러 함수입니다.
// Java Spring의 @PostMapping("/token")과 유사합니다.
router.post('/token', login);

// HTTP POST 요청을 '/auth/validate' 경로로 보낼 때 실행될 핸들러를 정의합니다.
// 이 경로는 클라이언트로부터 받은 JWT의 유효성을 검증하는 데 사용됩니다.
// validateToken 함수는 authController.js 파일에 정의된 컨트롤러 함수입니다.
// Java Spring의 @PostMapping("/validate")과 유사합니다.
router.post('/validate', validateToken);

router.post('/service-token', verifyApiKey, getServiceToken);

// 설정된 라우터 객체를 모듈 외부로 내보냅니다.
// 이렇게 내보낸 라우터는 app.js에서 애플리케이션의 메인 라우팅 시스템에 통합됩니다.
export default router;

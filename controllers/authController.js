// 인증 관련 서비스를 가져옵니다. (현재 파일에서는 직접 사용되지 않지만, 일반적으로 컨트롤러는 서비스를 호출합니다)
// Java의 @Service 어노테이션이 붙은 클래스와 유사한 역할을 하는 모듈을 가져오는 것입니다.
import * as authService from '../services/authService.js';
// 표준화된 성공/실패 응답을 보내기 위한 유틸리티 함수들을 가져옵니다.
import { successResponse, errorResponse } from '../utils/responseHandler.js';
// 미리 정의된 에러 코드를 가져옵니다.
import { ERROR_CODES } from '../config/errorCodes.js';
// JSON Web Token(JWT)을 생성하고 검증하기 위한 라이브러리를 가져옵니다.
// Java에서 JJWT 라이브러리 등을 사용하는 것과 유사합니다.
import jwt from 'jsonwebtoken';
// .env 파일에서 환경 변수를 로드하기 위한 모듈을 가져옵니다.
import dotenv from 'dotenv';

// .env 파일의 환경 변수를 process.env 객체에 로드합니다.
dotenv.config();

// 임시 사용자 데이터입니다.
// 실제 프로덕션 환경에서는 이 데이터를 데이터베이스(예: MySQL, PostgreSQL, MongoDB 등)에 저장하고 조회해야 합니다.
// Java에서 인메모리 H2 데이터베이스나 ArrayList에 사용자 정보를 저장하는 것과 유사한 임시 방식입니다.
const users = [
  { id: 1, username: 'user1', password: 'password1' }, // 중요: 실제 환경에서는 비밀번호를 절대 평문으로 저장하면 안 됩니다. bcrypt와 같은 라이브러리를 사용하여 해시(hash)해야 합니다.
  { id: 2, username: 'user2', password: 'password2' },
];

// JWT 서명에 사용될 비밀 키입니다. .env 파일에서 가져옵니다.
// 이 키는 외부에 노출되어서는 안 됩니다.
// Java에서 JWT 서명 시 사용하는 SecretKey와 동일한 개념입니다.
const JWT_SECRET = process.env.JWT_SECRET;
// JWT의 만료 시간을 설정합니다. .env 파일에서 가져옵니다. (예: "1h", "7d")
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;


/**
 * 사용자 로그인 요청을 처리하고 JWT를 생성합니다.
 * HTTP POST 요청을 '/auth/token' 경로로 받았을 때 실행됩니다.
 * 요청 본문(request body)에는 'username'과 'password'가 포함되어야 합니다.
 *
 * @param {object} req - Express의 요청(request) 객체입니다. 클라이언트로부터 받은 HTTP 요청 정보를 담고 있습니다.
 *                       Java Servlet의 HttpServletRequest와 유사합니다. req.body를 통해 요청 본문에 접근합니다.
 * @param {object} res - Express의 응답(response) 객체입니다. 클라이언트에게 보낼 HTTP 응답을 설정하는 데 사용됩니다.
 *                       Java Servlet의 HttpServletResponse와 유사합니다.
 * @param {function} next - Express의 다음 미들웨어 함수를 호출하는 콜백 함수입니다. 오류 발생 시 오류 처리 미들웨어로 제어를 넘기는 데 사용됩니다.
 *                          Java의 try-catch 후 throw new ServletException(e)와 유사한 흐름을 만듭니다.
 */
export const login = (req, res, next) => {
  // 요청 본문에서 username과 password를 추출합니다.
  // JavaScript의 객체 디스트럭처링(destructuring) 문법입니다.
  // const username = req.body.username; 와 동일합니다.
  const { username, password } = req.body;

  try {
    // username 또는 password가 제공되지 않았는지 확인합니다.
    if (!username || !password) {
      // 필수 파라미터가 없는 경우, 400 Bad Request 상태와 함께 에러 응답을 보냅니다.
      // errorResponse 유틸리티 함수는 표준화된 JSON 형식으로 에러 메시지를 반환합니다.
      // ERROR_CODES.MISSING_CREDENTIALS 와 같은 상수를 사용하여 에러 코드를 관리하는 것이 좋습니다. (현재는 임의의 숫자 사용)
      return errorResponse(res, 'Username and password are required.', 400, ERROR_CODES.VALIDATION.MISSING_FIELDS);
    }

    // 임시 사용자 목록에서 username과 일치하는 사용자를 찾습니다.
    // Array.prototype.find() 메서드를 사용합니다.
    // 실제 애플리케이션에서는 데이터베이스에서 사용자를 조회하는 로직 (예: userService.findByUsername(username))이 필요합니다.
    const user = users.find(u => u.username === username);

    // 사용자를 찾지 못했거나 비밀번호가 일치하지 않는 경우 (실제로는 해시된 비밀번호를 비교해야 함)
    // 401 Unauthorized 상태와 함께 에러 응답을 보냅니다.
    // 보안을 위해 "Invalid username or password"와 같이 구체적이지 않은 메시지를 사용하는 것이 일반적입니다.
    if (!user || user.password !== password) { // 실제로는 await bcrypt.compare(password, user.hashedPassword) 와 같이 비교
      return errorResponse(res, 'Invalid credentials.', 401, ERROR_CODES.AUTH.INVALID_CREDENTIALS);
    }

    // 사용자가 성공적으로 인증되면 JWT를 생성합니다.
    // jwt.sign() 메소드는 페이로드(payload), 비밀 키, 옵션 객체를 인자로 받습니다.
    // 페이로드에는 토큰에 담을 사용자 정보(예: ID, username)를 포함합니다. 민감한 정보는 포함하지 않아야 합니다.
    const token = jwt.sign(
      { id: user.id, username: user.username }, // 페이로드: 토큰에 포함될 정보
      JWT_SECRET,                               // 비밀 키: 토큰 서명에 사용
      { expiresIn: JWT_EXPIRES_IN }              // 옵션: 토큰 만료 시간 등
    );

    // 로그인 성공 응답을 보냅니다. 생성된 토큰과 만료 시간을 함께 전달합니다.
    // successResponse 유틸리티 함수는 표준화된 JSON 형식으로 성공 메시지와 데이터를 반환합니다.
    successResponse(res, 'Login successful', { token, expiresIn: JWT_EXPIRES_IN });
  } catch (error) {
    // 동기 코드 블록 내에서 발생한 예외는 Express의 오류 처리 미들웨어로 전달합니다.
    // next(error)를 호출하면 app.js에 등록된 errorHandler 미들웨어가 실행됩니다.
    next(error);
  }
};

/**
 * 클라이언트로부터 받은 JWT의 유효성을 검증합니다.
 * HTTP POST 요청을 '/auth/validate' 경로로 받았을 때 실행됩니다.
 * 요청 본문에는 'token'이 포함되어야 합니다.
 *
 * @param {object} req - Express 요청 객체
 * @param {object} res - Express 응답 객체
 * @param {function} next - Express 다음 미들웨어 함수
 */
export const validateToken = (req, res, next) => {
  // 요청 본문에서 token을 추출합니다.
  const { token } = req.body;

  try {
    // 토큰이 제공되지 않았는지 확인합니다.
    if (!token) {
      return errorResponse(res, 'Token is required.', 400, ERROR_CODES.VALIDATION.MISSING_TOKEN);
    }

    // jwt.verify() 메소드를 사용하여 토큰을 검증합니다.
    // 토큰이 유효하면, 디코딩된 페이로드(사용자 정보 등)를 반환합니다.
    // 토큰이 유효하지 않거나(예: 서명 불일치, 만료됨) 경우 JsonWebTokenError 또는 TokenExpiredError 예외가 발생합니다.
    const decoded = jwt.verify(token, JWT_SECRET);

    // 토큰이 유효하면, 성공 응답과 함께 디코딩된 사용자 정보를 반환합니다.
    successResponse(res, 'Token is valid.', { user: decoded });
  } catch (error) {
    // jwt.verify()에서 발생하는 예외 (JsonWebTokenError, TokenExpiredError 등)를 처리합니다.
    // 이 예외들은 Express의 오류 처리 미들웨어로 전달되어 적절한 HTTP 상태 코드와 함께 응답됩니다.
    // (예: TokenExpiredError는 401 Unauthorized, JsonWebTokenError는 401 또는 403)
    // authMiddleware.js의 verifyToken 함수에서도 유사한 로직이 사용되지만,
    // 이 validateToken 컨트롤러는 명시적으로 토큰 유효성을 확인하는 API 엔드포인트 역할을 합니다.
    next(error);
  }
};

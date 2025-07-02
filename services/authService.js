// JSON Web Token(JWT) 라이브러리를 가져옵니다.
import jwt from 'jsonwebtoken';
// .env 파일에서 환경 변수를 로드하기 위한 모듈을 가져옵니다.
import dotenv from 'dotenv';
// 서비스 계층에서 사용할 커스텀 에러 클래스를 가져옵니다.
// 여기서는 itemService.js에 정의된 ServiceError를 재활용하고 있지만,
// 인증 전용 에러 클래스(예: AuthError)를 별도로 정의하거나, 공통 에러 모듈을 만드는 것이 더 적절할 수 있습니다.
import { ServiceError } from './itemService.js'; // TODO: 공통 에러 모듈 또는 인증 에러 클래스로 분리 고려

// .env 파일의 환경 변수를 process.env 객체에 로드합니다.
dotenv.config();

// 임시 사용자 데이터 저장소입니다.
// 중요: 이 방식은 데모 및 테스트 목적으로만 사용해야 합니다.
// 실제 프로덕션 환경에서는:
// 1. 사용자 정보를 데이터베이스(예: MySQL, PostgreSQL, MongoDB 등)에 안전하게 저장해야 합니다.
// 2. 비밀번호는 절대로 평문으로 저장해서는 안 되며, bcrypt나 Argon2와 같은 강력한 해시 함수를 사용하여
//    해시된 형태로 저장하고, 로그인 시에는 입력된 비밀번호를 해시하여 저장된 해시와 비교해야 합니다.
const users = [
  { id: 1, username: 'user1', password: 'password1' }, // 보안 취약점: 평문 비밀번호
  { id: 2, username: 'user2', password: 'password2' }, // 보안 취약점: 평문 비밀번호
];

// JWT 서명에 사용될 비밀 키입니다. .env 파일에서 가져옵니다.
const JWT_SECRET = process.env.JWT_SECRET;
// JWT의 만료 시간을 설정합니다. .env 파일에서 가져옵니다. (예: "1h", "7d")
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

// JWT_SECRET이 정의되지 않은 경우, 애플리케이션 실행을 중단하거나 경고를 표시합니다.
// 이는 보안상 매우 중요한 설정이므로, 누락 시 심각한 문제를 야기할 수 있습니다.
if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in the .env file. This is a critical security risk. The application will not run securely.");
  // 프로덕션 환경에서는 process.exit(1)을 호출하여 애플리케이션을 즉시 종료하는 것이 안전합니다.
  // 개발 환경에서는 경고 후 진행할 수도 있지만, 권장되지 않습니다.
  process.exit(1); // 애플리케이션 강제 종료
}

/**
 * 사용자 이름과 비밀번호를 사용하여 사용자를 인증하고, 성공 시 JWT를 생성하여 반환합니다.
 * 이 함수는 컨트롤러(authController.js)에서 호출됩니다.
 * Java의 @Service 클래스 내의 인증 메소드와 유사한 역할을 합니다.
 *
 * @async
 * @param {string} username - 사용자가 입력한 사용자 이름.
 * @param {string} password - 사용자가 입력한 비밀번호.
 * @returns {Promise<object>} 인증 성공 시 토큰 및 사용자 정보를 포함하는 객체를 반환합니다.
 * @throws {ServiceError} 입력 값 오류, 자격 증명 오류, 토큰 생성 오류 시 발생합니다.
 */
export const authenticateUser = async (username, password) => {
  // 입력 값 유효성 검사
  if (!username || !password) {
    // ServiceError는 HTTP 상태 코드와 내부 에러 코드를 함께 전달하여,
    // 상위 계층(컨트롤러 또는 에러 핸들러)에서 적절한 HTTP 응답을 생성하도록 돕습니다.
    throw new ServiceError('Username and password are required for authentication.', 400, 'AUTH_MISSING_CREDENTIALS');
  }

  // 임시 사용자 목록에서 사용자 검색 (실제로는 데이터베이스 조회: await User.findOne({ where: { username } });)
  const user = users.find(u => u.username === username);

  // 사용자가 존재하지 않는 경우
  if (!user) {
    // 보안을 위해 "사용자를 찾을 수 없음"과 "비밀번호 불일치"를 구분하지 않는 것이 일반적입니다.
    // 동일한 "Invalid credentials" 메시지를 사용하여 공격자가 사용자 이름 존재 여부를 추측하기 어렵게 합니다.
    throw new ServiceError('Invalid username or password.', 401, 'AUTH_INVALID_CREDENTIALS');
  }

  // 비밀번호 비교 (실제로는 해시된 비밀번호 비교: const isValidPassword = await bcrypt.compare(password, user.hashedPassword);)
  if (user.password !== password) { // 보안 취약점: 평문 비밀번호 비교
    throw new ServiceError('Invalid username or password.', 401, 'AUTH_INVALID_CREDENTIALS');
  }

  // 사용자가 성공적으로 인증된 경우, JWT를 생성합니다.
  try {
    const tokenPayload = {
      id: user.id,
      username: user.username,
      // 필요에 따라 다른 비민감 정보(예: 역할)를 추가할 수 있습니다.
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // 인증 성공 결과를 반환합니다.
    return {
      message: 'User authenticated successfully.',
      token,
      expiresIn: JWT_EXPIRES_IN,
      user: { id: user.id, username: user.username } // 클라이언트에 전달할 사용자 정보 (선택적)
    };
  } catch (error) {
    // JWT 서명 중 오류 발생 시 (드문 경우지만, 설정 오류 등)
    console.error('Critical error during JWT signing:', error);
    throw new ServiceError('Failed to generate authentication token due to an internal server error.', 500, 'AUTH_JWT_SIGNING_ERROR');
  }
};

/**
 * 제공된 JWT의 유효성을 검증합니다.
 * 이 함수는 authController.js의 validateToken 핸들러 또는 authMiddleware.js에서 사용될 수 있습니다.
 *
 * @async
 * @param {string} token - 검증할 JWT.
 * @returns {Promise<object>} 토큰이 유효한 경우, 디코딩된 페이로드(사용자 정보)를 포함하는 객체를 반환합니다.
 * @throws {ServiceError} 토큰 누락, 만료, 형식 오류 등 다양한 검증 실패 시 발생합니다.
 */
export const verifyAuthToken = async (token) => {
  // 토큰 존재 여부 확인
  if (!token) {
    throw new ServiceError('Authentication token is required for this operation.', 400, 'AUTH_TOKEN_MISSING');
  }

  try {
    // jwt.verify()는 토큰을 비밀 키로 검증하고, 유효하면 디코딩된 페이로드를 반환합니다.
    // 만료되었거나 서명이 유효하지 않으면 예외를 발생시킵니다.
    const decodedPayload = jwt.verify(token, JWT_SECRET);
    return {
      message: 'Token is valid and successfully verified.',
      user: decodedPayload, // 토큰에 포함된 사용자 정보 (예: { id: 1, username: 'user1', iat: ..., exp: ... })
    };
  } catch (error) {
    // jwt.verify()에서 발생할 수 있는 특정 오류들을 처리합니다.
    if (error.name === 'TokenExpiredError') {
      // 토큰 만료 오류
      throw new ServiceError('Authentication token has expired. Please log in again.', 401, 'AUTH_TOKEN_EXPIRED');
    }
    if (error.name === 'JsonWebTokenError') {
      // 토큰 형식 오류 또는 서명 불일치 등
      // error.message에 더 자세한 내용이 있을 수 있지만, 보안상 일반적인 메시지를 반환합니다.
      throw new ServiceError('Invalid authentication token. The token is malformed or signature is invalid.', 401, 'AUTH_TOKEN_INVALID');
    }
    // 기타 예상치 못한 오류 (예: JWT_SECRET 설정 문제 등)
    console.error('Unexpected error during token verification:', error);
    throw new ServiceError('Failed to authenticate token due to an unexpected server error.', 500, 'AUTH_TOKEN_VERIFICATION_ERROR');
  }
};

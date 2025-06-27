import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { ServiceError } from './itemService.js'; // itemService에 정의된 ServiceError 재활용 또는 별도 정의 가능

dotenv.config();

// 임시 사용자 데이터 (실제 환경에서는 데이터베이스 또는 다른 인증 시스템 사용)
const users = [
  { id: 1, username: 'user1', password: 'password1' }, // 실제 환경에서는 비밀번호를 해시하여 저장하고 비교해야 합니다.
  { id: 2, username: 'user2', password: 'password2' },
];

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined. Please set it in your .env file.");
  process.exit(1); // 애플리케이션 종료 또는 다른 적절한 처리
}

export const authenticateUser = async (username, password) => {
  if (!username || !password) {
    throw new ServiceError('Username and password are required.', 400, 'VALIDATION_ERROR_AUTH_MISSING_FIELDS');
  }

  const user = users.find(u => u.username === username);

  if (!user) {
    throw new ServiceError('Invalid credentials.', 401, 'INVALID_CREDENTIALS_USER_NOT_FOUND');
  }

  // 비밀번호 비교 (실제 환경에서는 bcrypt.compare 또는 유사한 해시 비교 함수 사용)
  if (user.password !== password) {
    throw new ServiceError('Invalid credentials.', 401, 'INVALID_CREDENTIALS_PASSWORD_MISMATCH');
  }

  try {
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    return {
      message: 'Login successful',
      token,
      expiresIn: JWT_EXPIRES_IN,
      user: { id: user.id, username: user.username } // 토큰 외 사용자 정보도 반환 (선택적)
    };
  } catch (error) {
    console.error('Error signing JWT:', error);
    throw new ServiceError('Failed to generate token.', 500, 'JWT_SIGNING_ERROR');
  }
};

export const verifyAuthToken = async (token) => {
  if (!token) {
    throw new ServiceError('Token is required.', 400, 'VALIDATION_ERROR_TOKEN_MISSING');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return {
      message: 'Token is valid.',
      user: decoded, // 토큰에 포함된 사용자 정보
    };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ServiceError('Token expired.', 401, 'TOKEN_EXPIRED');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new ServiceError('Invalid token.', 401, 'TOKEN_INVALID');
    }
    console.error('Error verifying JWT:', error);
    throw new ServiceError('Failed to authenticate token.', 500, 'TOKEN_VERIFICATION_ERROR');
  }
};

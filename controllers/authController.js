import * as authService from '../services/authService.js';
import { ServiceError } from '../services/itemService.js'; // authService에서도 동일한 ServiceError 사용 가능 (또는 authService에 별도 정의)

/**
 * 사용자 로그인 및 토큰 생성
 * POST /auth/token
 * body: { username, password }
 */
export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // username, password 필수 체크는 서비스 레이어에서도 하지만, 컨트롤러에서 먼저 하는 것이 일반적
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }
    const result = await authService.authenticateUser(username, password);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in login controller:', error.message);
    if (error instanceof ServiceError) {
      return res.status(error.statusCode || 500).json({ message: error.message, errorCode: error.errorCode });
    }
    // 예상치 못한 다른 오류
    res.status(500).json({ message: 'An unexpected error occurred during login.', error: error.message });
  }
};

/**
 * 토큰 유효성 검증
 * POST /auth/validate
 * body: { token }
 */
export const validateToken = async (req, res) => {
  const { token } = req.body;

  try {
    if (!token) {
      return res.status(400).json({ message: 'Token is required.' });
    }
    const result = await authService.verifyAuthToken(token);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in validateToken controller:', error.message);
    if (error instanceof ServiceError) {
      return res.status(error.statusCode || 500).json({ message: error.message, errorCode: error.errorCode });
    }
    // 예상치 못한 다른 오류
    res.status(500).json({ message: 'An unexpected error occurred during token validation.', error: error.message });
  }
};

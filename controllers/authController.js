
import * as authService from '../services/authService.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import { ERROR_CODES } from '../config/errorCodes.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// 임시 사용자 데이터 (실제 환경에서는 데이터베이스 사용)
const users = [
  { id: 1, username: 'user1', password: 'password1' }, // 실제 환경에서는 비밀번호를 해시하여 저장해야 합니다.
  { id: 2, username: 'user2', password: 'password2' },
];

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;


/**
 * 사용자 로그인 및 토큰 생성
 * POST /auth/token
 * body: { username, password }
 */

export const login = (req, res, next) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return errorResponse(res, 'Username and password are required.', 400, 1001);
    }

    const user = users.find(u => u.username === username);
    if (!user) {
      return errorResponse(res, 'Invalid credentials.', 401, 2001);
    }

    if (user.password !== password) {
      return errorResponse(res, 'Invalid credentials.', 401, 2001);
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    successResponse(res, 'Login successful', { token, expiresIn: JWT_EXPIRES_IN });
  } catch (error) {
    next(error);
  }
};

/**
 * 토큰 유효성 검증
 * POST /auth/validate
 * body: { token }
 */

export const validateToken = (req, res, next) => {
  const { token } = req.body;

  try {
    if (!token) {
      return errorResponse(res, 'Token is required.', 400, 1001);
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    successResponse(res, 'Token is valid.', { user: decoded });
  } catch (error) {
    next(error);
  }
};

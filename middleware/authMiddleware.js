import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { errorResponse } from '../utils/responseHandler.js';
import { ERROR_CODES } from '../config/errorCodes.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const VALID_API_KEYS = process.env.SERVICE_API_KEYS?.split(',') || [];

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Access denied. No token provided or token is not Bearer type.', 401, ERROR_CODES.AUTH.INVALID_TOKEN);
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return errorResponse(res, 'Access denied. Token is missing.', 401, ERROR_CODES.AUTH.INVALID_TOKEN);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // 요청 객체에 사용자 정보 추가
    next(); // 다음 미들웨어 또는 라우트 핸들러로 제어 전달
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired.', 401, ERROR_CODES.AUTH.TOKEN_EXPIRED);
    }
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid token.', 401, ERROR_CODES.AUTH.INVALID_TOKEN);
    }
    return errorResponse(res, 'Failed to authenticate token.', 500, ERROR_CODES.SERVER.INTERNAL_ERROR);
  }
};

export const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return errorResponse(res, 'Access denied. No API key provided.', 401, ERROR_CODES.AUTH.NO_API_KEY);
  }

  if (!VALID_API_KEYS.includes(apiKey)) {
    return errorResponse(res, 'Invalid API key.', 401, ERROR_CODES.AUTH.INVALID_CREDENTIALS);
  }

  next();
};

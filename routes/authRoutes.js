import express from 'express';
import { login, validateToken } from '../controllers/authController.js';

const router = express.Router();

// POST /auth/token - 사용자 로그인 및 토큰 생성
router.post('/token', login);

// POST /auth/validate - 토큰 유효성 검증
router.post('/validate', validateToken);

export default router;

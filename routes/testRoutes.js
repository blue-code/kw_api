import express from 'express';
import { getTestData } from '../controllers/testController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /test - 보호된 테스트 데이터 가져오기
// verifyToken 미들웨어를 통과해야 이 라우트에 접근 가능
router.get('/', verifyToken, getTestData);

export default router;

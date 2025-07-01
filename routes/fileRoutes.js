import express from 'express';
import { upload, download, serveImage } from '../controllers/fileController.js';
import uploadMiddleware from '../middleware/uploadMiddleware.js';

const router = express.Router();

// 파일 업로드 (단일 파일)
router.post('/upload', (req, res, next) => {
  uploadMiddleware.single('file')(req, res, (err) => {
    if (err) {
      // Multer 에러를 포함한 모든 에러를 전역 에러 핸들러로 전달
      return next(err);
    }
    next();
  });
}, upload);

// 이미지 제공 (프론트엔드에서 직접 접근)
router.get('/images/:id', serveImage);

// 파일 다운로드
router.get('/download/:id', download);

export default router;

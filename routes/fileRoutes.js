import express from 'express';
import { upload, download, serveImage } from '../controllers/fileController.js';
import uploadMiddleware from '../middleware/uploadMiddleware.js';

const router = express.Router();

// 파일 업로드 (단일 파일)
router.post('/upload', (req, res, next) => {
  uploadMiddleware.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer 에러 처리
      return res.status(500).json({ resultCode: -1, resultMessage: err.message });
    } else if (err) {
      // 일반적인 에러 처리
      return res.status(500).json({ resultCode: -1, resultMessage: 'An unknown error occurred during file upload.' });
    }
    next();
  });
}, upload);

// 이미지 제공 (프론트엔드에서 직접 접근)
router.get('/images/:id', serveImage);

// 파일 다운로드
router.get('/download/:id', download);

export default router;

import express from 'express';
const router = express.Router();
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import fileController from '../controllers/fileController.js';
import authMiddleware from '../middleware/authMiddleware.js'; // 인증 미들웨어 (필요시)

// ES 모듈에서는 __dirname을 직접 사용할 수 없으므로 path.resolve()와 import.meta.url을 사용합니다.
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 파일 저장 경로 및 파일명 설정
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// uploads 디렉토리가 없으면 생성
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        // 파일명 중복을 피하기 위해 타임스탬프 사용
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 10 }, // 10MB 파일 크기 제한
    fileFilter: function (req, file, cb) {
        // 특정 파일 타입만 허용 (예: 이미지, pdf 등)
        // if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        //     cb(null, true);
        // } else {
        //     cb(new Error('Invalid file type'), false);
        // }
        cb(null, true); // 모든 파일 타입 허용 (테스트용)
    }
});

// 파일 업로드 API
// authMiddleware.verifyToken 미들웨어를 추가하여 인증된 사용자만 업로드 가능하게 할 수 있습니다.
router.post('/upload', authMiddleware.verifyToken, upload.single('file'), fileController.uploadFile);

// 이미지 파일 미리보기 API (인증 없이 접근 가능하도록 설정하거나, 필요시 authMiddleware 추가)
// 이 라우트는 fileController.getFile로 직접 연결되며, 서비스에서 Content-Type을 설정합니다.
router.get('/view/:filename', fileController.getFile);

// 파일 다운로드 API
// authMiddleware.verifyToken 미들웨어를 추가하여 인증된 사용자만 다운로드 가능하게 할 수 있습니다.
router.get('/download/:filename', authMiddleware.verifyToken, fileController.downloadFile);

export default router;
